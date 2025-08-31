import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { MapPin, Phone, Mail, Award, Truck, Shield, Users } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Himgirinaturals</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From the pristine valleys of the Himalayas to your home, we bring you the finest 
            quality dry fruits and nuts with a commitment to purity, authenticity, and excellence.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Our Story */}
        <section>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded with a passion for bringing authentic Himalayan flavors to every home, 
                  Himgirinaturals started as a small family business in the heart of Gurgaon. 
                  Our journey began with a simple mission: to source the finest quality nuts and 
                  dried fruits directly from the mountain regions.
                </p>
                <p>
                  We believe that nature provides the best nutrition, and our products reflect 
                  this philosophy. Every product is carefully selected, processed with minimal 
                  intervention, and packaged to preserve its natural goodness and flavor.
                </p>
                <p>
                  Today, we proudly serve thousands of customers across India, maintaining our 
                  commitment to quality, freshness, and customer satisfaction. Our success is 
                  built on trust, transparency, and the unwavering belief that everyone deserves 
                  access to premium, healthy snacks.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-[420px] md:h-[560px] lg:h-[680px] rounded-2xl overflow-hidden shadow-xl">
                <ImageWithFallback
                  src="https://drive.google.com/thumbnail?id=1_kvrE6YIyF3zOSo6rRnjtZUpimMtiQXS&sz=w2000"
                  alt="Himgirinaturals premium dry fruits collection"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <Badge className="absolute -bottom-4 -right-4 bg-accent text-accent-foreground px-6 py-2 text-sm">
                Est. 2025
              </Badge>
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="bg-muted/30 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Mission & Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We are driven by core values that define our approach to business and customer relationships.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Premium Quality</h3>
                <p className="text-sm text-muted-foreground">
                  We source only the finest grade products from trusted suppliers.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">100% Natural</h3>
                <p className="text-sm text-muted-foreground">
                  No artificial preservatives, colors, or additives in our products.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Fast Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  Quick and secure delivery to ensure freshness reaches you.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Customer First</h3>
                <p className="text-sm text-muted-foreground">
                  Your satisfaction and health are our top priorities.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Location & Contact */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Visit Our Store</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Located in the heart of Gurgaon, our store welcomes you to experience 
              our premium products firsthand.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Map Placeholder */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="h-64 bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-accent mx-auto mb-2" />
                    <p className="font-semibold">Ghaziabad, India</p>
                    <p className="text-sm text-muted-foreground">Interactive map integration</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-accent" />
                      <div>
                        <p className="font-medium">Store Address</p>
                        <p className="text-sm text-muted-foreground">Ghaziabad, India</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-accent" />
                      <div>
                        <p className="font-medium">Phone Number</p>
                        <p className="text-sm text-muted-foreground">+12898138506</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-accent" />
                      <div>
                        <p className="font-medium">Email Address</p>
                        <p className="text-sm text-muted-foreground">shop@himgirinaturals.com</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Store Hours</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span>9:00 AM - 8:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span>9:00 AM - 9:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span>10:00 AM - 7:00 PM</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Our Achievements</h2>
            <p className="text-muted-foreground">
              Numbers that speak for our commitment to excellence
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">50K+</div>
              <div className="text-muted-foreground">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">100+</div>
              <div className="text-muted-foreground">Premium Products</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">4.9★</div>
              <div className="text-muted-foreground">Customer Rating</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">5+</div>
              <div className="text-muted-foreground">Years of Excellence</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}