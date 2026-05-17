# LinkUp Backend

FastAPI backend with sentence transformers for developer matching.

## Setup Options

### Option 1: Docker (Recommended)

#### Prerequisites
- Docker Desktop installed
- Docker Compose installed

#### Quick Start

1. **Firebase Setup**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file as `firebase-credentials.json` in the backend directory

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```

3. **Build and Run**
   ```bash
   # Build the Docker image
   docker-compose build

   # Start the container
   docker-compose up
   ```

   Or in one command:
   ```bash
   docker-compose up --build
   ```

4. **Run in Background**
   ```bash
   docker-compose up -d
   ```

5. **View Logs**
   ```bash
   docker-compose logs -f backend
   ```

6. **Stop the Container**
   ```bash
   docker-compose down
   ```

The API will be available at `http://localhost:8000`

#### Docker Commands

```bash
# Rebuild after code changes
docker-compose build

# Start services
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Remove volumes (WARNING: deletes ChromaDB data)
docker-compose down -v

# Execute commands inside container
docker-compose exec backend python -c "print('Hello')"

# Access container shell
docker-compose exec backend bash
```

#### Production Deployment

For production, use the production compose file:

```bash
# Build and run production
docker-compose -f docker-compose.prod.yml up --build -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop production
docker-compose -f docker-compose.prod.yml down
```

### Option 2: Local Python Installation

#### Prerequisites
- Python 3.9+

#### Setup Steps

1. **Create Virtual Environment**
   ```bash
   cd backend
   python -m venv venv
   
   # Activate on Windows
   venv\Scripts\activate
   
   # Activate on Mac/Linux
   source venv/bin/activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Firebase Setup**
   - Download `firebase-credentials.json` (see Docker setup above)
   - Place in backend directory

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```

5. **Run the Server**
   ```bash
   python main.py
   ```

   Or with uvicorn:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /` - Health check
- `POST /api/profile/create` - Create/update user profile
- `POST /api/matches/get` - Get potential matches for a user
- `POST /api/swipe` - Record swipe action (like/pass)
- `GET /api/matches/list/{user_id}` - Get all matches for a user

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## How It Works

1. **Profile Creation**: User profiles are stored in Firebase Firestore
2. **Embedding Generation**: Sentence transformers create embeddings from user profiles
3. **Vector Storage**: ChromaDB stores embeddings for fast similarity search
4. **Matching Algorithm**:
   - Interest overlap (30% weight)
   - Build habits similarity (25% weight)
   - Hackathon scenarios similarity (25% weight)
   - Bio embedding similarity (20% weight)
5. **Scoring**: Returns similarity score from 0-1 (1 being highly similar)

## Model

Uses `sentence-transformers/all-mpnet-base-v2` - a lightweight, efficient model for semantic similarity.

## Troubleshooting

### Docker Issues

**Port already in use:**
```bash
# Change port in docker-compose.yml
ports:
  - "8001:8000"  # Use 8001 instead
```

**Container won't start:**
```bash
# Check logs
docker-compose logs backend

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up
```

**Firebase credentials not found:**
- Ensure `firebase-credentials.json` exists in backend directory
- Check file permissions (should be readable)

**ChromaDB errors:**
```bash
# Remove volume and restart
docker-compose down -v
docker-compose up
```

### Local Python Issues

**Module not found:**
```bash
# Ensure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt
```

**Port already in use:**
```bash
# Change port in .env or main.py
API_PORT=8001
```

**Model download slow:**
- First run downloads ~400MB sentence transformer model
- Model is cached in `~/.cache/torch/sentence_transformers/`
- Be patient, it only happens once

## Development

### Hot Reload

Docker compose is configured for hot reload in development mode. Changes to Python files will automatically restart the server.

### Testing API

Use curl, Postman, or the Swagger UI at `http://localhost:8000/docs`

Example:
```bash
# Health check
curl http://localhost:8000/

# Create profile
curl -X POST http://localhost:8000/api/profile/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test123",
    "interests": ["Frontend", "AI/ML"],
    "build_habits": {"planning": 0.7, "testing": 0.8},
    "hackathon_scenarios": {"team_size": 0.5, "innovation": 0.9},
    "additional_preferences": {},
    "bio": "Love building AI apps"
  }'
```

## Performance

- First request may be slow (model loading)
- Subsequent requests are fast (~100-200ms)
- ChromaDB provides efficient vector search
- Can handle thousands of profiles

## Security Notes

- Never commit `firebase-credentials.json`
- Keep `.env` file secure
- Use environment variables for sensitive data
- In production, use proper secrets management

## Monitoring

### Docker Stats
```bash
docker stats linkup-backend
```

### Container Health
```bash
docker-compose ps
```

### Logs
```bash
# Follow logs
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```
