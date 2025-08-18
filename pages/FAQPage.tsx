import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, HelpCircle, Package, Truck, CreditCard, Shield } from 'lucide-react';

export function FAQPage() {
  const faqCategories = [
    {
      icon: Package,
      title: "Products & Quality",
      badge: "Most Popular",
      faqs: [
        {
          question: "Are your dry fruits and nuts organic?",
          answer: "Yes, all our products are 100% natural and organically sourced from the Himalayan region. We work directly with local farmers who use traditional, pesticide-free farming methods."
        },
        {
          question: "How do you ensure the freshness of your products?",
          answer: "We maintain strict quality control with temperature-controlled storage, vacuum packaging, and regular freshness checks. All products are packaged in airtight containers to preserve natural oils and flavors."
        },
        {
          question: "What's the shelf life of your products?",
          answer: "Our dry fruits and nuts have a shelf life of 6-12 months when stored properly in a cool, dry place. Each product package includes specific storage instructions and expiry dates."
        },
        {
          question: "Do you test for pesticides and contaminants?",
          answer: "Absolutely. All our products undergo rigorous testing in certified laboratories for pesticides, heavy metals, and other contaminants before packaging."
        }
      ]
    },
    {
      icon: Truck,
      title: "Shipping & Delivery",
      faqs: [
        {
          question: "What are your delivery charges?",
          answer: "We offer free shipping on orders above ₹999. For orders below ₹999, delivery charges are ₹99 within India. Express delivery is available for an additional ₹150."
        },
        {
          question: "How long does delivery take?",
          answer: "Standard delivery takes 3-5 business days across India. Express delivery takes 1-2 business days for major cities. International shipping takes 7-14 business days."
        },
        {
          question: "Do you deliver internationally?",
          answer: "Yes, we ship to over 25 countries including USA, UK, Canada, Australia, and UAE. International shipping charges are calculated based on weight and destination."
        },
        {
          question: "Can I track my order?",
          answer: "Yes, you'll receive a tracking number via SMS and email once your order is shipped. You can track your order real-time on our website or the courier partner's website."
        }
      ]
    },
    {
      icon: CreditCard,
      title: "Orders & Payment",
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit/debit cards, UPI, net banking, digital wallets, and cash on delivery (COD) for orders within India."
        },
        {
          question: "Is cash on delivery available?",
          answer: "Yes, COD is available for orders within India up to ₹5,000. A nominal COD charge of ₹25 applies for this service."
        },
        {
          question: "Can I modify or cancel my order?",
          answer: "Orders can be modified or cancelled within 2 hours of placing the order. After that, please contact our customer service team for assistance."
        },
        {
          question: "Do you offer bulk discounts?",
          answer: "Yes, we offer attractive bulk discounts starting from 10kg orders. Please visit our Bulk Orders page or contact us for custom pricing."
        }
      ]
    },
    {
      icon: Shield,
      title: "Returns & Refunds",
      faqs: [
        {
          question: "What is your return policy?",
          answer: "We offer a 7-day return policy for unopened products in original packaging. Opened products can be returned only if there's a quality issue."
        },
        {
          question: "How do I return a product?",
          answer: "Contact our customer service team to initiate a return. We'll provide a return label and arrange pickup. Refunds are processed within 5-7 business days."
        },
        {
          question: "What if I receive a damaged product?",
          answer: "If you receive a damaged or defective product, please contact us within 24 hours with photos. We'll immediately send a replacement or provide a full refund."
        },
        {
          question: "Are there any return charges?",
          answer: "No return charges apply for damaged, defective, or wrong products. For other returns, return shipping costs may apply based on your location."
        }
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Find answers to common questions about our products, shipping, payments, and more. 
          Can't find what you're looking for? Contact our support team.
        </p>
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search FAQs..." 
            className="pl-10"
          />
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="space-y-8">
        {faqCategories.map((category, categoryIndex) => (
          <Card key={categoryIndex}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <category.icon className="h-6 w-6 text-primary" />
                <CardTitle className="flex items-center gap-3">
                  {category.title}
                  {category.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {category.badge}
                    </Badge>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {category.faqs.map((faq, faqIndex) => (
                  <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Still Need Help Section */}
      <Card className="mt-12">
        <CardHeader className="text-center">
          <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle>Still Need Help?</CardTitle>
          <CardDescription>
            Our customer support team is here to help you with any questions or concerns
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-3">Get detailed help via email</p>
              <Button variant="outline" size="sm">
                Send Email
              </Button>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2">Phone Support</h3>
              <p className="text-sm text-muted-foreground mb-3">Mon-Sat, 9 AM - 7 PM</p>
              <Button variant="outline" size="sm">
                Call Now
              </Button>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2">WhatsApp Chat</h3>
              <p className="text-sm text-muted-foreground mb-3">Quick support via WhatsApp</p>
              <Button variant="outline" size="sm">
                Start Chat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}