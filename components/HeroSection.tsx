import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HeroSectionProps {
  onNavigate: (page: string) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
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
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1733337336596-c8e9c0dfa944?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc3NvcnRlZCUyMG51dHMlMjBkcmllZCUyMGZydWl0c3xlbnwxfHx8fDE3NTU0NTExOTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Assorted premium Himalayan nuts and dried fruits"
                className="w-full h-full object-cover"
              />
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