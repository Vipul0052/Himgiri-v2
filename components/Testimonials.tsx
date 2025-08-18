import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Mumbai, Maharashtra",
    rating: 5,
    comment: "The quality of almonds from Himgirinaturals is exceptional! Fresh, crunchy, and full of flavor. My family absolutely loves them.",
    product: "Kashmiri Almonds"
  },
  {
    id: 2,
    name: "Raj Kumar",
    location: "Delhi, India",
    rating: 5,
    comment: "Best dry fruits I've ever purchased online. The cashews are premium quality and the packaging keeps them fresh for months.",
    product: "Himalayan Cashews"
  },
  {
    id: 3,
    name: "Anita Gupta",
    location: "Bangalore, Karnataka",
    rating: 5,
    comment: "Himgirinaturals has become our go-to source for all dry fruits. Excellent quality, fair prices, and super fast delivery!",
    product: "Mixed Nuts Combo"
  },
  {
    id: 4,
    name: "Vikram Singh",
    location: "Chandigarh, Punjab",
    rating: 5,
    comment: "The walnuts are incredibly fresh and tasty. You can really taste the Himalayan quality. Highly recommend to everyone!",
    product: "Himalayan Walnuts"
  },
  {
    id: 5,
    name: "Meera Patel",
    location: "Ahmedabad, Gujarat",
    rating: 5,
    comment: "Amazing service and product quality. The pistachios are the best I've tasted. Perfect for gifting and personal consumption.",
    product: "Afghan Pistachios"
  }
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our valued customers have to say about 
            their experience with Himgirinaturals.
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Testimonial Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/30">
            <CardContent className="p-8 md:p-12">
              <div className="text-center">
                <Quote className="w-12 h-12 text-accent mx-auto mb-6" />
                
                {/* Rating Stars */}
                <div className="flex justify-center space-x-1 mb-6">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-lg md:text-xl text-foreground mb-6 font-medium leading-relaxed">
                  "{testimonials[currentIndex].comment}"
                </blockquote>

                {/* Customer Info */}
                <div className="space-y-2">
                  <div className="font-semibold text-lg">
                    {testimonials[currentIndex].name}
                  </div>
                  <div className="text-muted-foreground">
                    {testimonials[currentIndex].location}
                  </div>
                  <div className="text-sm text-accent">
                    Purchased: {testimonials[currentIndex].product}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="sm"
            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 bg-background/80 backdrop-blur-sm"
            onClick={prevTestimonial}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 bg-background/80 backdrop-blur-sm"
            onClick={nextTestimonial}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center space-x-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-accent' : 'bg-muted-foreground/30'
              }`}
              onClick={() => goToTestimonial(index)}
            />
          ))}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-center">
          <div>
            <div className="text-3xl font-bold text-accent mb-2">50K+</div>
            <div className="text-muted-foreground">Happy Customers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent mb-2">4.9★</div>
            <div className="text-muted-foreground">Average Rating</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent mb-2">99%</div>
            <div className="text-muted-foreground">Customer Satisfaction</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent mb-2">10K+</div>
            <div className="text-muted-foreground">5-Star Reviews</div>
          </div>
        </div>
      </div>
    </section>
  );
}