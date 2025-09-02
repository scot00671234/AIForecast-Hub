import AdBanner from './AdBanner';

export default function InFeedAd() {
  return (
    <div className="w-full my-1.5 p-1 bg-muted/20 border border-border/30 rounded-lg">
      <div className="text-xs text-muted-foreground mb-1 text-center">Sponsored</div>
      <AdBanner
        adSlot="0987654321" // You'll get this from AdSense dashboard
        adFormat="fluid"
        style={{ display: 'block', minHeight: '10px' }}
        className="w-full"
      />
    </div>
  );
}