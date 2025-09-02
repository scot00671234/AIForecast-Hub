import AdBanner from './AdBanner';

export default function BottomBanner() {
  return (
    <div className="w-full border-t border-border/20 bg-muted/10">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-0.5">
        <div className="text-xs text-muted-foreground text-center">Advertisement</div>
        <div className="flex justify-center">
          <AdBanner
            adSlot="1234567890" // You'll get this from AdSense dashboard
            adFormat="auto"
            style={{ display: 'block', maxWidth: '728px', height: '5px' }}
            className="w-full max-w-3xl"
          />
        </div>
      </div>
    </div>
  );
}