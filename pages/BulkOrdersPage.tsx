import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Package, Users, Truck, Phone, Mail } from 'lucide-react';

export function BulkOrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl mb-4">Bulk Orders</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Perfect for businesses, events, gifting, and wholesale requirements. 
          Get the best prices on large quantity orders with customized packaging options.
        </p>
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card>
          <CardHeader className="text-center">
            <Package className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Wholesale Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Competitive bulk pricing with discounts starting from 10kg orders. 
              The more you order, the more you save.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Custom Packaging</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Branded packaging options available for corporate gifts, 
              events, and retail reselling with your logo and design.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Fast Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Priority processing and expedited shipping for bulk orders. 
              Scheduled deliveries available for regular orders.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Tiers */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Bulk Pricing Tiers</CardTitle>
          <CardDescription>
            Our volume-based pricing structure offers significant savings for larger orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <h3 className="font-semibold text-lg mb-2">Starter</h3>
              <p className="text-2xl font-bold text-primary mb-2">5% OFF</p>
              <p className="text-sm text-muted-foreground">10kg - 25kg</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <h3 className="font-semibold text-lg mb-2">Business</h3>
              <p className="text-2xl font-bold text-primary mb-2">12% OFF</p>
              <p className="text-sm text-muted-foreground">25kg - 50kg</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <h3 className="font-semibold text-lg mb-2">Wholesale</h3>
              <p className="text-2xl font-bold text-primary mb-2">18% OFF</p>
              <p className="text-sm text-muted-foreground">50kg - 100kg</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <h3 className="font-semibold text-lg mb-2">Enterprise</h3>
              <p className="text-2xl font-bold text-primary mb-2">25% OFF</p>
              <p className="text-sm text-muted-foreground">100kg+</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Form */}
      <Card>
        <CardHeader>
          <CardTitle>Request Bulk Quote</CardTitle>
          <CardDescription>
            Fill out the form below and we'll get back to you within 24 hours with a customized quote
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" placeholder="Your company name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Person</Label>
                <Input id="contact" placeholder="Your full name" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order-type">Order Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select order type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corporate-gifts">Corporate Gifts</SelectItem>
                  <SelectItem value="retail-reselling">Retail Reselling</SelectItem>
                  <SelectItem value="event-catering">Event Catering</SelectItem>
                  <SelectItem value="restaurant-supply">Restaurant Supply</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Order Requirements</Label>
              <Textarea 
                id="requirements" 
                placeholder="Please specify the products, quantities, delivery date, and any special requirements..."
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full">
              Request Quote
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <div className="mt-12 text-center">
        <h2 className="text-2xl mb-4">Need Help?</h2>
        <p className="text-muted-foreground mb-6">
          Our bulk orders team is here to assist you with custom requirements and pricing
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Call: +12898138506
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email: bulk@himgirinaturals.com
          </Button>
        </div>
      </div>
    </div>
  );
}