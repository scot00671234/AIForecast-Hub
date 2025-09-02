import { useEffect } from 'react';

interface AdBannerProps {
  adSlot: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdBanner({ 
  adSlot, 
  adFormat = "auto", 
  fullWidthResponsive = true,
  style = { display: 'block' },
  className = ""
}: AdBannerProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.log('AdSense error:', err);
    }
  }, []);

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ ...style, height: '2px', maxHeight: '2px', minHeight: '2px', overflow: 'hidden' }}
        data-ad-client="ca-pub-4669482504741834"
        data-ad-slot={adSlot}
        data-ad-format="rectangle"
        data-full-width-responsive="false"
      />
    </div>
  );
}