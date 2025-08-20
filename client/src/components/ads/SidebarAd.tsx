import AdBanner from './AdBanner';

export default function SidebarAd() {
  return (
    <div className="w-full max-w-sm mx-auto mb-6">
      <div className="text-xs text-muted-foreground mb-2 text-center">Advertisement</div>
      <AdBanner
        adSlot="1234567890" // You'll get this from AdSense dashboard
        adFormat="rectangle"
        style={{ display: 'block', width: '300px', height: '250px' }}
        className="border border-border/20 rounded-lg overflow-hidden"
      />
    </div>
  );
}