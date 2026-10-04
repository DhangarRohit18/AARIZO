import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, ExternalLink, Copy, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { advertisementRepository } from '../../repositories/advertisements/AdvertisementRepository';
import type { Advertisement } from '../../types/advertisement';

export type AdvertisementItem = Advertisement;

export interface AdvertisementPopupProps {
  societyId?: string;
  forceOpen?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdvertisementPopup: React.FC<AdvertisementPopupProps> = ({
  societyId = 'soc-gvs',
  forceOpen = false,
  isOpen: propIsOpen,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const userRole = (currentUser?.role || 'resident').toUpperCase();

  const [allAds, setAllAds] = useState<Advertisement[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [internalOpen, setInternalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);
  const recordedImpressionIds = useRef<Set<string>>(new Set());

  // Real-time Firestore subscription for advertisements
  useEffect(() => {
    const unsub = advertisementRepository.subscribe(societyId, (list) => {
      setAllAds(list);
    });
    return () => unsub();
  }, [societyId]);

  // Filter & Prioritize eligible ads
  const eligibleAds = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const now = Date.now();

    // Check 24-hr global dismissal
    const dismissedUntil = localStorage.getItem('aarizo_ad_dismissed_until');
    if (!forceOpen && !propIsOpen && dismissedUntil && Number(dismissedUntil) > now) {
      return [];
    }

    return allAds
      .filter((ad) => {
        // 1. Status check
        if (ad.status !== 'ACTIVE') return false;

        // 2. Date window check
        const start = ad.startAt ? ad.startAt.split('T')[0] : '';
        const end = ad.endAt ? ad.endAt.split('T')[0] : '';
        if (start && start > today) return false;
        if (end && end < today) return false;

        // 3. Audience check
        if (ad.targetAudience && ad.targetAudience !== 'ALL') {
          if (ad.targetAudience !== userRole) return false;
        }

        // If forced open by user click, bypass frequency check
        if (forceOpen || propIsOpen) return true;

        // 4. Frequency check
        switch (ad.frequency) {
          case 'ONCE_PER_SESSION': {
            const seenSession = sessionStorage.getItem(`aarizo_ad_seen_sess_${ad.id}`);
            if (seenSession) return false;
            break;
          }
          case 'ONCE_PER_DAY': {
            const lastShown = localStorage.getItem(`aarizo_ad_seen_day_${ad.id}`);
            if (lastShown && now - Number(lastShown) < 24 * 60 * 60 * 1000) return false;
            break;
          }
          case 'ONCE_PER_CAMPAIGN': {
            const seenCamp = localStorage.getItem(`aarizo_ad_seen_camp_${ad.id}`);
            if (seenCamp) return false;
            break;
          }
          case 'ALWAYS':
          default:
            break;
        }

        return true;
      })
      .sort((a, b) => (b.priority || 5) - (a.priority || 5));
  }, [allAds, userRole, forceOpen, propIsOpen]);

  // Auto-open if eligible ads exist
  useEffect(() => {
    if (forceOpen || propIsOpen) {
      setInternalOpen(true);
      return;
    }

    if (eligibleAds.length > 0) {
      setInternalOpen(true);
    } else {
      setInternalOpen(false);
    }
  }, [eligibleAds, forceOpen, propIsOpen]);

  const currentAd = eligibleAds[currentAdIndex] || eligibleAds[0];
  const isVisible = propIsOpen !== undefined ? propIsOpen : internalOpen;

  // Record impression in Firestore atomically
  useEffect(() => {
    if (isVisible && currentAd?.id && !recordedImpressionIds.current.has(currentAd.id)) {
      recordedImpressionIds.current.add(currentAd.id);
      advertisementRepository.recordImpression(currentAd.id).catch(() => {});

      // Mark frequency persistence
      const now = Date.now();
      sessionStorage.setItem(`aarizo_ad_seen_sess_${currentAd.id}`, 'true');
      localStorage.setItem(`aarizo_ad_seen_day_${currentAd.id}`, String(now));
      localStorage.setItem(`aarizo_ad_seen_camp_${currentAd.id}`, 'true');
    }
  }, [isVisible, currentAd?.id]);

  if (!isVisible || !currentAd) return null;

  const handleClose = () => {
    if (dontShowToday) {
      const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem('aarizo_ad_dismissed_until', String(tomorrow));
    }
    setInternalOpen(false);
    if (onClose) onClose();
  };

  const handleCopyCode = () => {
    if (currentAd.discountCode) {
      navigator.clipboard.writeText(currentAd.discountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClaimOffer = () => {
    // Record click analytics to Firestore atomically
    advertisementRepository.recordClick(currentAd.id).catch(() => {});

    const link = currentAd.actionUrl;
    if (link) {
      if (link.startsWith('tel:') || link.startsWith('mailto:')) {
        window.location.href = link;
      } else {
        window.open(link, '_blank', 'noopener,noreferrer');
      }
    }
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3.5 sm:p-4 animate-in fade-in duration-200">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-sm sm:max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col transform transition-all scale-100">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
          title="Close Offer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Banner Media Header */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-900">
          <img
            src={
              currentAd.imageUrl ||
              'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80'
            }
            alt={currentAd.title}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

          {/* Exclusive Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/90 text-white text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-sm">
            <Sparkles className="w-3 h-3" />
            <span>Society Resident Special</span>
          </div>

          {/* Ad Tagline Over Banner */}
          <div className="absolute bottom-3 left-4 right-4">
            <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              {currentAd.tagline || currentAd.vendorName || 'Verified Community Partner'}
            </p>
            <h3 className="text-lg sm:text-xl font-black text-white leading-tight mt-0.5">
              {currentAd.title}
            </h3>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {currentAd.description}
            </p>

            {/* Discount Code Box */}
            {currentAd.discountCode && (
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-dashed border-amber-300 dark:border-amber-700/80 bg-amber-50/70 dark:bg-amber-950/30">
                <div>
                  <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block">
                    Exclusive Promo Code
                  </span>
                  <span className="text-sm font-black text-amber-900 dark:text-amber-200 tracking-wider">
                    {currentAd.discountCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <button
              type="button"
              onClick={handleClaimOffer}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#083B56] to-[#176B91] hover:from-[#0D4767] hover:to-[#1B7FA6] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{currentAd.actionLabel || 'Claim Exclusive Offer'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-500 dark:text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={dontShowToday}
                  onChange={(e) => setDontShowToday(e.target.checked)}
                  className="rounded text-[#176B91] focus:ring-[#176B91]"
                />
                <span>Don't show again today</span>
              </label>

              {eligibleAds.length > 1 && (
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span>
                    {currentAdIndex + 1} of {eligibleAds.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = (currentAdIndex + 1) % eligibleAds.length;
                      setCurrentAdIndex(next);
                    }}
                    className="text-[#176B91] font-bold hover:underline ml-1 cursor-pointer"
                  >
                    Next offer →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export interface OffersLauncherPillProps {
  onOpen?: () => void;
  onClick?: () => void;
  label?: string;
  className?: string;
}

// Reusable Offers pill button for resident top bar or home screen
export const OffersLauncherPill: React.FC<OffersLauncherPillProps> = ({
  onOpen,
  onClick,
  label = 'Society Deals (25% Off)',
  className = '',
}) => {
  const handleClick = () => {
    if (onClick) onClick();
    else if (onOpen) onOpen();
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer ${className}`}
      title="View Society Partner Discounts & Offers"
    >
      <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
      <span>{label}</span>
    </button>
  );
};

export default AdvertisementPopup;
