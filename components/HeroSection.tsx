import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect } from 'react';

interface HeroSectionProps {
  onNavigate: (page: string) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showHighRes, setShowHighRes] = useState(false);

  // Preload the hero image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    // Start with smaller thumbnail for faster loading
    img.src = "https://drive.google.com/thumbnail?id=1_kvrE6YIyF3zOSo6rRnjtZUpimMtiQXS&sz=w800";
    
    // Load high-res version after initial load
    const highResImg = new Image();
    highResImg.onload = () => setShowHighRes(true);
    highResImg.src = "https://drive.google.com/thumbnail?id=1_kvrE6YIyF3zOSo6rRnjtZUpimMtiQXS&sz=w2000";
  }, []);

  return (
    <section className="relative py-20 px-4 bg-gradient-to-br from-background to-muted overflow-hidden">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Premium Quality
              <br />
              <span className="text-accent">Himalayan Dry Fruits</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              From the pristine valleys of Himachal to your doorstep. Discover nature's finest 
              selection of fresh, nutritious nuts and dried fruits sourced directly from trusted 
              farms in the Himalayas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="text-lg px-8 py-3 bg-accent hover:bg-accent/90"
                onClick={() => onNavigate('shop')}
              >
                Shop Now
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-3"
                onClick={() => onNavigate('about')}
              >
                Learn More
              </Button>
            </div>
            <div className="flex items-center space-x-6 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">50K+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">100%</div>
                <div className="text-sm text-muted-foreground">Natural & Organic</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">5⭐</div>
                <div className="text-sm text-muted-foreground">Customer Rating</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            {/* Image container with loading priority */}
            <div className="w-full h-[420px] md:h-[560px] lg:h-[680px] rounded-2xl overflow-hidden shadow-2xl relative">
              {/* Loading Skeleton */}
              {!imageLoaded && !imageError && (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 animate-pulse flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-accent/20 rounded-full mx-auto mb-4 animate-bounce"></div>
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                </div>
              )}

              {/* Error Fallback */}
              {imageError && (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <div className="w-16 h-16 bg-muted-foreground/20 rounded-full mx-auto mb-4"></div>
                    <p>Image loading failed</p>
                  </div>
                </div>
              )}

              {/* Actual Image */}
              {imageLoaded && (
                <>
                  {/* Low-res image (always visible once loaded) */}
                  <img
                    src="https://drive.google.com/thumbnail?id=1_kvrE6YIyF3zOSo6rRnjtZUpimMtiQXS&sz=w800"
                    alt="Assorted premium Himalayan nuts and dried fruits"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    loading="eager"
                    fetchPriority="high"
                  />
                  
                  {/* High-res image (overlays when ready) */}
                  {showHighRes && (
                    <img
                      src="https://drive.google.com/thumbnail?id=1_kvrE6YIyF3zOSo6rRnjtZUpimMtiQXS&sz=w2000"
                      alt="Assorted premium Himalayan nuts and dried fruits"
                      className="w-full h-full object-cover absolute inset-0 transition-opacity duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  )}
                </>
              )}
            </div>
            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              100% Natural
            </div>
            <div className="absolute -bottom-4 -left-4 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              Himalayan Quality
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}