
import React, { useEffect, useRef, useState } from 'react';

interface BannerAdProps {
  type?: 'display' | 'fluid' | 'article';
  isPremium?: boolean;
  className?: string;
}

const AD_CONFIGS = {
  display: {
    slot: "5068979219",
    format: "auto",
    responsive: "true",
    style: { display: 'block', minWidth: '250px', minHeight: '100px' }
  },
  fluid: {
    slot: "7691079606",
    format: "fluid",
    layoutKey: "-fb+5w+4e-db+86",
    style: { display: 'block', minWidth: '250px' }
  },
  article: {
    slot: "1819805828",
    format: "fluid",
    layout: "in-article",
    style: { display: 'block', textAlign: 'center' as const, minWidth: '250px' }
  }
};

const BannerAd: React.FC<BannerAdProps> = ({ type = 'display', isPremium = false, className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);
  const [isAdRequested, setIsAdRequested] = useState(false);
  const config = AD_CONFIGS[type];

  useEffect(() => {
    // Prevent ads for premium users or if already pushed for this instance
    if (isPremium || pushedRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      
      // CRITICAL: AdSense Fluid ads require at least 250px width.
      // We check visibility and actual rendered width before pushing.
      if (entry.isIntersecting && containerRef.current) {
        const width = containerRef.current.offsetWidth;
        
        if (width >= 250) {
          try {
            // Check if this specific element was already processed by a global push
            if (insRef.current && !insRef.current.getAttribute('data-adsbygoogle-status')) {
              // @ts-ignore
              const adsbygoogle = window.adsbygoogle || [];
              adsbygoogle.push({});
              pushedRef.current = true;
              setIsAdRequested(true);
              observer.disconnect();
            }
          } catch (e) {
            console.error("AdSense Push Failure:", e);
          }
        }
      }
    }, { threshold: 0.1 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isPremium, type]);

  if (isPremium) return null;

  return (
    <div 
      className={`w-full flex flex-col items-center justify-center my-6 overflow-hidden ${className}`} 
      ref={containerRef}
      style={{ minWidth: '250px', minHeight: '100px' }}
    >
      <div className="w-full max-w-4xl bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden relative shadow-sm min-h-[100px] flex items-center justify-center">
        <div className="absolute top-1 left-2 text-[8px] font-black text-slate-300 uppercase tracking-widest z-0">Sponsor Content</div>
        
        <ins className="adsbygoogle"
             ref={insRef}
             style={config.style}
             data-ad-client="ca-pub-6150753757369593"
             data-ad-slot={config.slot}
             data-ad-format={config.format}
             {...(type === 'fluid' ? { 'data-ad-layout-key': config.layoutKey } : {})}
             {...(type === 'article' ? { 'data-ad-layout': config.layout } : {})}
             data-full-width-responsive={type === 'display' ? "true" : undefined}>
        </ins>

        {!isAdRequested && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 opacity-30">
            <div className="text-center">
               <i className="fas fa-certificate text-slate-200 text-xl mb-1"></i>
               <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Awaiting Ad Container...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerAd;
