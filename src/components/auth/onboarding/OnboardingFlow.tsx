import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowRight } from 'lucide-react';
import '../auth.css';

interface OnboardingSlide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Smart Visitor Management',
    subtitle: 'Pre-approve visitors, track entry history, and manage guest access seamlessly. Keep your society secure with real-time visitor notifications and digital gate passes.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: 'Community & Society Services',
    subtitle: 'Connect with neighbors, view official society notices, book clubhouse amenities, and pay maintenance dues seamlessly.',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: 'Complete Family & Security Hub',
    subtitle: 'Manage family profiles, registered vehicles, staff attendance, and one-tap emergency SOS broadcasts for complete peace of mind.',
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80',
  },
];

export const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  const currentSlide = ONBOARDING_SLIDES[currentSlideIndex];
  const isLastSlide = currentSlideIndex === ONBOARDING_SLIDES.length - 1;

  const handleComplete = () => {
    completeOnboarding();
    navigate('/login');
  };

  const handleNext = () => {
    if (isLastSlide) {
      handleComplete();
    } else {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="auth-container">
      {/* ── Top Bar with Skip on Left & Circular Arrow on Right (Screenshot match) ── */}
      <header className="auth-header">
        <button className="btn-auth-text" onClick={handleComplete}>
          Skip
        </button>
        <button className="btn-auth-circle-nav" onClick={handleNext} aria-label="Next slide">
          <ArrowRight size={18} />
        </button>
      </header>

      {/* ── Center Content: Centered Illustration, Navy Title, Muted Subtitle ── */}
      <main className="onboarding-wrapper">
        <div className="onboarding-card">
          <div className="onboarding-illustration">
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '16px',
                filter: 'drop-shadow(0 12px 24px rgba(8, 59, 86, 0.15))',
              }}
            />
          </div>

          <h2 className="onboarding-title">{currentSlide.title}</h2>
          <p className="onboarding-desc">{currentSlide.subtitle}</p>
        </div>

        {/* ── Footer: Pagination Dots ── */}
        <div className="onboarding-footer">
          <div className="pagination-dots">
            {ONBOARDING_SLIDES.map((_, idx) => (
              <div
                key={idx}
                className={`dot ${idx === currentSlideIndex ? 'active' : ''}`}
                onClick={() => setCurrentSlideIndex(idx)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OnboardingFlow;
