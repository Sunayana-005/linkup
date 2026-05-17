from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import firebase_admin
from firebase_admin import credentials, firestore
from sentence_transformers import SentenceTransformer
import chromadb
import os
from dotenv import load_dotenv
import numpy as np

load_dotenv()

app = FastAPI(title="LinkUp API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firebase
cred = credentials.Certificate(os.getenv("FIREBASE_CREDENTIALS_PATH"))
firebase_admin.initialize_app(cred)
db = firestore.client()

# Initialize sentence transformer model
model = SentenceTransformer('sentence-transformers/all-mpnet-base-v2')

# Initialize ChromaDB
chroma_client = chromadb.PersistentClient(
    path=os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
)
collection = chroma_client.get_or_create_collection(name="user_profiles")


# ─── Pydantic Models ──────────────────────────────────────────────

class UserProfile(BaseModel):
    user_id: str
    display_name: Optional[str] = ""
    avatar_url: Optional[str] = ""
    tagline: Optional[str] = ""
    interests: List[str]
    build_habits: dict  # slider values (0-1)
    hackathon_scenarios: dict  # slider values (0-1)
    additional_preferences: dict
    bio: Optional[str] = ""

class MatchRequest(BaseModel):
    user_id: str
    limit: int = 20

class SwipeAction(BaseModel):
    user_id: str
    target_user_id: str
    action: str  # "like" or "pass"

class ChatMessage(BaseModel):
    match_id: str
    sender_id: str
    text: str


# ─── Helpers ──────────────────────────────────────────────────────

def create_user_embedding(profile: UserProfile) -> List[float]:
    """Create a rich embedding from the user profile for vector similarity."""
    text_parts = []

    # Interests
    text_parts.append(f"Interests: {', '.join(profile.interests)}")

    # Build habits as descriptive text
    habits_text = " ".join([f"{k}: {v}" for k, v in profile.build_habits.items()])
    text_parts.append(f"Build habits: {habits_text}")

    # Hackathon scenarios
    scenarios_text = " ".join([f"{k}: {v}" for k, v in profile.hackathon_scenarios.items()])
    text_parts.append(f"Hackathon style: {scenarios_text}")

    # Bio
    if profile.bio:
        text_parts.append(f"Bio: {profile.bio}")

    # Tagline
    if profile.tagline:
        text_parts.append(f"Tagline: {profile.tagline}")

    # Additional preferences
    prefs_text = " ".join([f"{k}: {v}" for k, v in profile.additional_preferences.items()])
    text_parts.append(f"Preferences: {prefs_text}")

    combined_text = " | ".join(text_parts)
    embedding = model.encode(combined_text)
    return embedding.tolist()


def calculate_similarity_score(profile1: dict, profile2: dict) -> float:
    """
    Calculate similarity score between two profiles (0 to 1).
    Weighted blend of interest overlap, slider distances, and preferences.
    """
    scores = []

    # Interest overlap (30% weight)
    interests1 = set(profile1.get('interests', []))
    interests2 = set(profile2.get('interests', []))
    if interests1 and interests2:
        interest_score = len(interests1 & interests2) / len(interests1 | interests2)
        scores.append(interest_score * 0.3)

    # Build habits slider similarity (25% weight)
    habits1 = profile1.get('build_habits', {})
    habits2 = profile2.get('build_habits', {})
    if habits1 and habits2:
        common_keys = set(habits1.keys()) & set(habits2.keys())
        if common_keys:
            habit_diffs = [abs(float(habits1[k]) - float(habits2[k])) for k in common_keys]
            habit_score = 1 - (sum(habit_diffs) / len(habit_diffs))
            scores.append(habit_score * 0.25)

    # Hackathon scenarios slider similarity (25% weight)
    scenarios1 = profile1.get('hackathon_scenarios', {})
    scenarios2 = profile2.get('hackathon_scenarios', {})
    if scenarios1 and scenarios2:
        common_keys = set(scenarios1.keys()) & set(scenarios2.keys())
        if common_keys:
            scenario_diffs = [abs(float(scenarios1[k]) - float(scenarios2[k])) for k in common_keys]
            scenario_score = 1 - (sum(scenario_diffs) / len(scenario_diffs))
            scores.append(scenario_score * 0.25)

    # Bio embedding similarity (20%) is handled via ChromaDB distance

    return sum(scores) if scores else 0.0


# ─── API Routes ───────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "LinkUp API is running", "version": "1.0.0"}


@app.post("/api/profile/create")
async def create_profile(profile: UserProfile):
    """Create or update user profile and compute embedding."""
    try:
        # Store in Firestore
        user_ref = db.collection('users').document(profile.user_id)
        user_ref.set(profile.dict())

        # Create embedding and store in ChromaDB
        embedding = create_user_embedding(profile)
        collection.upsert(
            ids=[profile.user_id],
            embeddings=[embedding],
            metadatas=[{"user_id": profile.user_id}]
        )

        return {"status": "success", "message": "Profile created/updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/profile/{user_id}")
async def get_profile(user_id: str):
    """Get a user's profile."""
    try:
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
        return {"profile": user_doc.to_dict()}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/matches/get")
async def get_matches(request: MatchRequest):
    """Get ranked potential matches for a user using vector similarity + profile scoring."""
    try:
        # Get user profile
        user_ref = db.collection('users').document(request.user_id)
        user_doc = user_ref.get()

        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")

        user_profile = user_doc.to_dict()

        # Get swipe history to exclude already-swiped users
        swipes_ref = db.collection('swipes').where('user_id', '==', request.user_id)
        swiped_users = set([doc.to_dict()['target_user_id'] for doc in swipes_ref.stream()])

        # Get user embedding for vector search
        user_embedding = create_user_embedding(UserProfile(**user_profile))

        # Query ChromaDB for nearest neighbors
        results = collection.query(
            query_embeddings=[user_embedding],
            n_results=min(request.limit * 3, 100)  # Over-fetch to account for filtering
        )

        # Score and filter matches
        matches = []
        for i, user_id in enumerate(results['ids'][0]):
            if user_id == request.user_id or user_id in swiped_users:
                continue

            # Get full profile from Firestore
            match_ref = db.collection('users').document(user_id)
            match_doc = match_ref.get()

            if match_doc.exists:
                match_profile = match_doc.to_dict()

                # ChromaDB embedding distance → similarity (20% weight)
                embedding_distance = results['distances'][0][i] if 'distances' in results else 0
                embedding_score = max(0, 1 - embedding_distance) * 0.2

                # Profile field similarity (80% weight)
                profile_score = calculate_similarity_score(user_profile, match_profile)
                total_score = profile_score + embedding_score

                matches.append({
                    "user_id": user_id,
                    "profile": match_profile,
                    "similarity_score": round(total_score, 3)
                })

        # Sort by score descending, take top N
        matches.sort(key=lambda x: x['similarity_score'], reverse=True)
        matches = matches[:request.limit]

        return {"matches": matches}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/swipe")
async def record_swipe(swipe: SwipeAction):
    """Record a swipe action and check for mutual match."""
    try:
        # Store swipe
        swipe_ref = db.collection('swipes').document()
        swipe_ref.set({
            'user_id': swipe.user_id,
            'target_user_id': swipe.target_user_id,
            'action': swipe.action,
            'timestamp': firestore.SERVER_TIMESTAMP
        })

        # Check for mutual match on like
        if swipe.action == "like":
            mutual_swipe = db.collection('swipes')\
                .where('user_id', '==', swipe.target_user_id)\
                .where('target_user_id', '==', swipe.user_id)\
                .where('action', '==', 'like')\
                .limit(1)\
                .stream()

            is_match = len(list(mutual_swipe)) > 0

            if is_match:
                # Create match record
                match_ref = db.collection('matches').document()
                match_ref.set({
                    'users': [swipe.user_id, swipe.target_user_id],
                    'timestamp': firestore.SERVER_TIMESTAMP
                })
                return {"status": "success", "is_match": True}

        return {"status": "success", "is_match": False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/matches/list/{user_id}")
async def list_matches(user_id: str):
    """Get all mutual matches for a user with profiles."""
    try:
        matches_ref = db.collection('matches').where('users', 'array_contains', user_id)
        matches = []

        for doc in matches_ref.stream():
            match_data = doc.to_dict()
            other_user_id = [uid for uid in match_data['users'] if uid != user_id][0]

            # Get other user's profile
            user_ref = db.collection('users').document(other_user_id)
            user_doc = user_ref.get()

            if user_doc.exists:
                matches.append({
                    "match_id": doc.id,
                    "user_id": other_user_id,
                    "profile": user_doc.to_dict(),
                    "timestamp": match_data.get('timestamp')
                })

        return {"matches": matches}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/recompute")
async def recompute_all_embeddings():
    """Recompute all user embeddings in ChromaDB (admin utility)."""
    try:
        users_ref = db.collection('users').stream()
        count = 0

        for user_doc in users_ref:
            user_data = user_doc.to_dict()
            try:
                profile = UserProfile(**user_data)
                embedding = create_user_embedding(profile)
                collection.upsert(
                    ids=[profile.user_id],
                    embeddings=[embedding],
                    metadatas=[{"user_id": profile.user_id}]
                )
                count += 1
            except Exception as e:
                print(f"Skipping user {user_doc.id}: {e}")

        return {"status": "success", "recomputed": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000))
    )
