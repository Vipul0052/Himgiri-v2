import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Card, CardContent } from '../components/ui/card';
import { HeartPulse, ShieldCheck, Dumbbell, Leaf } from 'lucide-react';

interface HealthBenefitsPageProps {}

export function HealthBenefitsPage(props: HealthBenefitsPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Health Benefits</h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Discover how premium Himalayan nuts and dried fruits support heart health, immunity,
              energy, and overall wellness.
            </p>
          </div>
          <div className="relative">
            <div className="w-full h-[420px] md:h-[560px] lg:h-[680px] rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://drive.google.com/thumbnail?id=1_kvrE6YIyF3zOSo6rRnjtZUpimMtiQXS&sz=w2000"
                alt="Healthy premium nuts and dried fruits"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-12">
        <section>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <HeartPulse className="w-6 h-6 text-accent" />
                  <h3 className="font-semibold">Heart Health</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Rich in healthy fats and antioxidants that support cardiovascular health.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheck className="w-6 h-6 text-accent" />
                  <h3 className="font-semibold">Immunity Support</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Vitamins and minerals like zinc and vitamin E help strengthen immunity.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Dumbbell className="w-6 h-6 text-accent" />
                  <h3 className="font-semibold">Energy & Satiety</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Natural proteins, fiber, and good fats keep you energized and satisfied.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Leaf className="w-6 h-6 text-accent" />
                  <h3 className="font-semibold">Clean Nutrition</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Minimal processing preserves natural goodness; no artificial additives.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}