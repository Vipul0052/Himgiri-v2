import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Truck, Package, Clock, MapPin, Plane, Shield, Phone } from 'lucide-react';

export function ShippingInfoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl mb-4">Shipping Information</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We deliver fresh, premium quality dry fruits and nuts across India.
          Learn about our shipping policies, delivery times, and charges.
        </p>
      </div>

      {/* Shipping Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader className="text-center pb-4">
            <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Free Shipping</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-2xl font-bold text-primary mb-2">₹999+</p>
            <p className="text-sm text-muted-foreground">
              Free delivery across India for orders above ₹999
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center pb-4">
            <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Fast Delivery</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-2xl font-bold text-primary mb-2">3-5 Days</p>
            <p className="text-sm text-muted-foreground">
              Standard delivery across India
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center pb-4">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Safe Packaging</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-2xl font-bold text-primary mb-2">100%</p>
            <p className="text-sm text-muted-foreground">
              Secure and food-grade packaging
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Domestic Shipping */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-primary" />
            <CardTitle>Domestic Shipping (India)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Delivery Zones & Timeline</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Metro Cities</p>
                    <p className="text-sm text-muted-foreground">Delhi, Mumbai, Bangalore, etc.</p>
                  </div>
                  <Badge variant="secondary">2-3 Days</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Tier 1 Cities</p>
                    <p className="text-sm text-muted-foreground">Pune, Ahmedabad, Chennai, etc.</p>
                  </div>
                  <Badge variant="secondary">3-4 Days</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Other Cities & Towns</p>
                    <p className="text-sm text-muted-foreground">All other locations</p>
                  </div>
                  <Badge variant="secondary">4-5 Days</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Remote Areas</p>
                    <p className="text-sm text-muted-foreground">Hill stations, remote villages</p>
                  </div>
                  <Badge variant="secondary">5-7 Days</Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Shipping Charges</h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="font-medium text-green-800 dark:text-green-200">Orders ₹999 & Above</p>
                  <p className="text-green-600 dark:text-green-400 font-bold">FREE SHIPPING</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium">Orders Below ₹999</p>
                  <p className="text-muted-foreground">₹99 shipping charge</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium">Express Delivery</p>
                  <p className="text-muted-foreground">Additional ₹150 (1-2 days)</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-muted-foreground">Additional ₹25 COD charge</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Packaging & Handling */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-primary" />
            <CardTitle>Packaging & Handling</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Our Packaging Standards</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Food-grade, airtight packaging to preserve freshness</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Vacuum-sealed bags for nuts and dried fruits</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Eco-friendly and recyclable packaging materials</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Temperature-controlled storage before shipping</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Fragile item protection with bubble wrap</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Order Processing Time</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Standard Orders</span>
                  <Badge variant="outline">24-48 hours</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Bulk Orders (10kg+)</span>
                  <Badge variant="outline">2-3 days</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Custom Packaging</span>
                  <Badge variant="outline">3-5 days</Badge>
                </div>
                {/* International orders removed */}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Important Shipping Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Please Note:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Delivery times may vary during festivals and peak seasons</li>
                <li>• Rural and remote area deliveries may take additional 1-2 days</li>
                {/* International shipping notes removed */}
                <li>• Saturday delivery available in metro cities</li>
                <li>• No deliveries on Sundays and public holidays</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Order Tracking:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• SMS and email notifications for order updates</li>
                <li>• Real-time tracking available on our website</li>
                <li>• WhatsApp updates for order status</li>
                <li>• Customer support for delivery queries</li>
              </ul>
              <Separator className="my-4" />
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                <span>For shipping queries: +917668067782</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}