import { Zap, Shield, Brain, Heart } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const benefits = [
  {
    icon: Zap,
    title: "Energy Boost",
    description: "Natural source of healthy fats and proteins that provide sustained energy throughout the day."
  },
  {
    icon: Shield,
    title: "Strong Immunity",
    description: "Rich in antioxidants, vitamins, and minerals that help strengthen your immune system."
  },
  {
    icon: Brain,
    title: "Brain Health",
    description: "Omega-3 fatty acids and vitamin E support cognitive function and memory."
  },
  {
    icon: Heart,
    title: "Heart Healthy",
    description: "Helps reduce bad cholesterol and supports cardiovascular health with healthy fats."
  }
];

export function HealthBenefits() {
  return (
    <section className="py-16 px-4 bg-muted/50">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Nuts & Dry Fruits?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Packed with essential nutrients, our premium nuts and dried fruits offer 
            incredible health benefits that support your wellness journey.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <benefit.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-3">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-primary/5 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-2">Ready to Transform Your Health?</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of satisfied customers who have made nuts and dried fruits 
              a part of their healthy lifestyle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Natural Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5★</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}