import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ShieldCheck, Building2, ChevronRight, ArrowLeft, CheckCircle2, QrCode, Sparkles } from 'lucide-react';
import '../auth.css';

interface OnboardingSlide {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badge: string;
  features: string[];
  graphicPills: string[];
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Smart Visitor Management',
    subtitle: 'Pre-approve guests, track real-time entry logs, digital QR gate passes, and receive instant arrival alerts.',
    icon: <QrCode size={32} />,
    badge: 'GATE SECURITY',
    features: [
      'Pre-approve expected visitors, cabs & deliveries',
      'Instant gate entry notifications on your phone',
      'Masked passcode & digital QR verification',
      'Complete historical visitor entry logs',
    ],
    graphicPills: ['Pre-Approve Guests', 'Digital Gate Passes', 'Real-time Alerts'],
  },
  {
    id: 2,
    title: 'Community & Society Services',
    subtitle: 'Connect with neighbors, view official society notices, book clubhouse amenities, and pay maintenance dues seamlessly.',
    icon: <Building2 size={32} />,
    badge: 'SOCIETY HUB',
    features: [
      'Official committee notices & announcements',
      'One-tap society maintenance & bill payments',
      'Amenity booking & event RSVP management',
      'Facility helpdesk ticket tracking with SLAs',
    ],
    graphicPills: ['Pay Dues Online', 'Society Notices', 'Amenity Bookings'],
  },
  {
    id: 3,
    title: 'Complete Family & Security Hub',
    subtitle: 'Manage family profiles, registered vehicles, staff attendance, and one-tap emergency SOS broadcasts for complete peace of mind.',
    icon: <ShieldCheck size={32} />,
    badge: 'FAMILY & SAFETY',
    features: [
      'Family members & resident profile management',
      'Vehicle registration & parking tags',
      '24/7 Security gate intercom & emergency contacts',
      'One-tap Panic SOS alert dispatcher',
    ],
    graphicPills: ['Family Profiles', 'Emergency SOS', 'Vehicle Tags'],
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

  const handleBack = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="auth-container">
      {/* Top Bar */}
      <header className="auth-header">
        <div className="auth-brand">
          <div className="auth-brand-logo">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="auth-brand-title">CommunityOS</h1>
          </div>
          <span className="auth-brand-badge">Pillars</span>
        </div>
        <button className="btn-auth-text" onClick={handleComplete}>
          Skip
        </button>
      </header>

      {/* Slide Content Container */}
      <main className="onboarding-wrapper">
        <div className="onboarding-card">
          {/* Visual Illustration Header */}
          <div className="onboarding-illustration">
            <span className="illustration-badge">{currentSlide.badge}</span>
            <div className="illustration-graphics">
              <div className="graphic-icon-box">{currentSlide.icon}</div>
              <div className="graphic-title">{currentSlide.title}</div>
              <div className="graphic-pills">
                {currentSlide.graphicPills.map((pill, idx) => (
                  <span key={idx} className="graphic-pill">
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <h2 className="onboarding-title">{currentSlide.title}</h2>
          <p className="onboarding-desc">{currentSlide.subtitle}</p>

          {/* Feature List */}
          <div className="onboarding-features-list">
            {currentSlide.features.map((feat, idx) => (
              <div key={idx} className="onboarding-feature-item">
                <CheckCircle2 size={16} className="feature-check" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions & Dots */}
        <div className="onboarding-footer">
          {/* Pagination Indicators */}
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

          {/* Buttons */}
          <div className="onboarding-actions">
            {currentSlideIndex > 0 && (
              <button className="btn-onboarding-secondary" onClick={handleBack}>
                <ArrowLeft size={16} />
                Back
              </button>
            )}
            <button className="btn-onboarding-primary" onClick={handleNext}>
              <span>{isLastSlide ? 'Get Started to Login' : 'Next'}</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};


