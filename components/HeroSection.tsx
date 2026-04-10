import { Button } from './ui/button';
import { useState } from 'react';

interface HeroSectionProps {
  onNavigate: (page: string) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl =
    "https://res.cloudinary.com/ditpz54g0/image/upload/w_1200,q_auto,f_auto/v1775818134/Generated_Image_April_10_2026_-_3_58PM_rtom1y.png";

  return (
    <section className="relative py-20 px-4 bg-gradient-to-br from-background to-muted overflow-hidden">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* TEXT */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Premium Quality
              <br />
              <span className="text-accent">Himalayan Dry Fruits</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg">
              From the pristine valleys of Himachal to your doorstep. Discover nature's finest 
              selection of fresh, nutritious nuts and dried fruits sourced directly from trusted farms.
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

          {/* IMAGE */}
          <div className="relative">
            <div className="w-full h-[420px] md:h-[560px] lg:h-[680px] rounded-2xl overflow-hidden shadow-2xl relative">

              {/* Loading */}
              {!imageLoaded && !imageError && (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 animate-pulse flex items-center justify-center">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              )}

              {/* Error */}
              {imageError && (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">Image failed</p>
                </div>
              )}

              {/* Image */}
              <img
                src={imageUrl}
                alt="Himgiri Naturals Dry Fruits"
                className={`w-full h-full object-cover object-right transition-opacity duration-500 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                loading="eager"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            </div>

            {/* Badges */}
            <div className="absolute -top-4 -right-4 bg-accent text-white px-4 py-2 rounded-full text-sm shadow-lg">
              100% Natural
            </div>

            <div className="absolute -bottom-4 -left-4 bg-primary text-white px-4 py-2 rounded-full text-sm shadow-lg">
              Himalayan Quality
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
