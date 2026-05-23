'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Code2, Users, Zap, Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-dark to-secondary/20"></div>
        
        <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Code2 className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">LinkUp</span>
          </div>
          <Link href="/auth" className="btn-primary">
            Get Started
          </Link>
        </nav>

        <div className="relative z-10 container mx-auto px-6 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              Find Your Perfect
              <span className="gradient-text"> Dev Partner</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 animate-slide-up">
              AI-powered matching for developers. Build amazing projects together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link href="/auth" className="btn-primary text-lg">
                Start Matching <ArrowRight className="inline ml-2" />
              </Link>
              <Link href="#features" className="btn-outline text-lg">
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-3xl animate-bounce-slow"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl animate-bounce-slow" style={{ animationDelay: '1s' }}></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-dark-lighter">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Why <span className="gradient-text">LinkUp</span>?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-12 h-12 text-primary" />}
              title="AI-Powered Matching"
              description="Our advanced algorithm analyzes your skills, interests, and work style to find your perfect match."
            />
            <FeatureCard
              icon={<Users className="w-12 h-12 text-secondary" />}
              title="Build Together"
              description="Connect with developers who share your passion and complement your skills."
            />
            <FeatureCard
              icon={<Heart className="w-12 h-12 text-primary" />}
              title="Hackathon Ready"
              description="Find teammates for your next hackathon or collaborative project in minutes."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            How It <span className="gradient-text">Works</span>
          </h2>
          
          <div className="max-w-4xl mx-auto space-y-12">
            <StepCard
              number="1"
              title="Create Your Profile"
              description="Tell us about your skills, interests, and what you're looking for in a teammate."
            />
            <StepCard
              number="2"
              title="Swipe & Match"
              description="Browse through AI-curated profiles and swipe right on developers you'd like to work with."
            />
            <StepCard
              number="3"
              title="Start Building"
              description="Once you match, start chatting and collaborate on amazing projects together!"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Find Your Dev Partner?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of developers already building together
          </p>
          <Link href="/auth" className="bg-white text-primary hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 hover:scale-105 inline-block">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-dark-lighter">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <p>&copy; 2026 LinkUp. Built with ❤️ for developers.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="card card-hover text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-2xl font-bold">
        {number}
      </div>
      <div>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 text-lg">{description}</p>
      </div>
    </div>
  );
}
