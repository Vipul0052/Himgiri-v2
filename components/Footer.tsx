import { useState } from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Logo } from './Logo';
import { useNewsletter } from '../hooks/useNewsletter';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { subscribe, isLoading } = useNewsletter();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleQuickLinkClick = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
      // Scroll to top when navigating
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await subscribe(newsletterEmail);
    if (success) {
      setNewsletterEmail('');
    }
  };

  const handlePhoneClick = () => {
    // Open WhatsApp with the phone number
    window.open('https://wa.me/12898138506', '_blank');
  };

  const handleEmailClick = () => {
    // Open email client
    window.open('mailto:shop@himgirinaturals.com', '_blank');
  };

  const handleMapClick = () => {
    // Open Google Maps for Sector 31, Gurgaon
    window.open('https://maps.google.com/?q=Sector+31,+Gurgaon,+India', '_blank');
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Logo 
              size="md" 
              onClick={() => handleQuickLinkClick('home')}
              className="group"
            />
            <p className="text-sm text-background/80 leading-relaxed">
              Your trusted source for premium quality Himalayan nuts and dried fruits. 
              We bring nature's finest directly from the mountains to your doorstep.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-background/60 hover:text-background transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-background transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-background transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => handleQuickLinkClick('about')} 
                  className="text-background/80 hover:text-background transition-colors text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleQuickLinkClick('shop')} 
                  className="text-background/80 hover:text-background transition-colors text-left"
                >
                  Our Products
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleQuickLinkClick('home')} 
                  className="text-background/80 hover:text-background transition-colors text-left"
                >
                  Health Benefits
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleQuickLinkClick('bulk-orders')} 
                  className="text-background/80 hover:text-background transition-colors text-left"
                >
                  Bulk Orders
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleQuickLinkClick('faq')} 
                  className="text-background/80 hover:text-background transition-colors text-left"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => handleQuickLinkClick('about')} 
                  className="text-background/80 hover:text-background transition-colors text-left"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleQuickLinkClick('shipping-info')} 
                  className="text-background/80 hover:text-background transition-colors text-left"
                >
                  Shipping Info
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleQuickLinkClick('returns-refunds')} 
                  className="text-background/80 hover:text-background transition-colors text-left"
                >
                  Returns & Refunds
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleQuickLinkClick('privacy-policy')} 
                  className="text-background/80 hover:text-background transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleQuickLinkClick('terms-of-service')} 
                  className="text-background/80 hover:text-background transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4">Stay Updated</h3>
            <p className="text-sm text-background/80 mb-4">
              Subscribe to get special offers, health tips, and product updates.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="flex space-x-2">
                <Input 
                  type="email"
                  placeholder="Enter your email" 
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/60"
                  required
                />
                <Button 
                  type="submit" 
                  variant="secondary" 
                  size="sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-background/20 border-t-background rounded-full animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-background/60">
                By subscribing, you agree to our privacy policy.
              </p>
            </form>
          </div>
        </div>

        <Separator className="bg-background/20" />

        {/* Contact Info */}
        <div className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <button 
              onClick={handlePhoneClick}
              className="flex items-center space-x-2 text-left hover:text-background transition-colors"
            >
              <Phone className="h-4 w-4 text-background/60" />
              <span className="text-background/80">+12898138506</span>
            </button>
            <button 
              onClick={handleEmailClick}
              className="flex items-center space-x-2 text-left hover:text-background transition-colors"
            >
              <Mail className="h-4 w-4 text-background/60" />
              <span className="text-background/80">shop@himgirinaturals.com</span>
            </button>
            <button 
              onClick={handleMapClick}
              className="flex items-center space-x-2 text-left hover:text-background transition-colors"
            >
              <MapPin className="h-4 w-4 text-background/60" />
              <span className="text-background/80">Sector 31, Gurgaon, India</span>
            </button>
          </div>
        </div>

        <Separator className="bg-background/20" />

        {/* Copyright */}
        <div className="py-6 text-center text-sm text-background/60">
          <p>Copyright © 2025 Himgirinaturals. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}