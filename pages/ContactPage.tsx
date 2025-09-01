import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from 'lucide-react';

export function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Contact Form & Info */}
        <section>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="p-8">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-accent" />
                  Send us a Message
                </CardTitle>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                      First Name *
                    </label>
                    <Input id="firstName" placeholder="Your first name" required />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                      Last Name *
                    </label>
                    <Input id="lastName" placeholder="Your last name" required />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <Input id="email" type="email" placeholder="your.email@example.com" required />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <Input id="phone" placeholder="+91 7668067782" />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Subject *
                  </label>
                  <Input id="subject" placeholder="How can we help you?" required />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message *
                  </label>
                  <textarea 
                    id="message" 
                    placeholder="Please describe your inquiry in detail..."
                    rows={5}
                    required 
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-accent" />
                    Visit Our Store
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium">Store Address</p>
                      <p className="text-sm text-muted-foreground">Ghaziabad, Uttar Pradesh, India</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium">Phone Number</p>
                      <p className="text-sm text-muted-foreground">+91 7668067782</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium">Email Address</p>
                      <p className="text-sm text-muted-foreground">shop@himgirinaturals.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium">Business Hours</p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Monday - Friday: 9:00 AM - 8:00 PM</p>
                        <p>Saturday: 9:00 AM - 9:00 PM</p>
                        <p>Sunday: 10:00 AM - 7:00 PM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Contact */}
              <Card className="bg-accent/5 border-accent/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3 text-accent">Need Immediate Help?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    For urgent inquiries or order-related questions, call us directly:
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                    onClick={() => window.open('tel:+917668067782')}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now: +91 7668067782
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Interactive Map */}
        <section>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent" />
                Our Location
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-96 w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224345.83923192776!2d77.06889754725782!3d28.669156699999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cf1bb41c50fdf%3A0xe6f06fd26a7798ba!2sGhaziabad%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1703123456789!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Himgiri Naturals - Ghaziabad, India"
                  className="w-full h-full"
                ></iframe>
              </div>
              <div className="p-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-accent" />
                    <span>Ghaziabad, Uttar Pradesh, India</span>
                  </div>
                  <a
                    href="https://maps.google.com/?q=Ghaziabad,Uttar+Pradesh,India"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:text-accent/80 transition-colors cursor-pointer"
                  >
                    Open in Maps →
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ Section */}
        <section className="bg-muted/30 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Quick answers to common questions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">How quickly do you respond to inquiries?</h3>
                <p className="text-sm text-muted-foreground">
                  We typically respond to all inquiries within 24 hours during business days.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Can I visit your store in person?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! We welcome visitors to our store in Ghaziabad during business hours.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Do you offer bulk order consultations?</h3>
                <p className="text-sm text-muted-foreground">
                  Absolutely! Contact us for personalized bulk order pricing and consultation.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards, UPI, net banking, and cash on delivery.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}