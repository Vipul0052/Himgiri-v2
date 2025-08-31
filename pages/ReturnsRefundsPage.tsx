import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, XCircle, Shield, Phone, Mail } from 'lucide-react';

interface ReturnsRefundsPageProps {
  onNavigate?: (page: string) => void;
}

export function ReturnsRefundsPage({ onNavigate }: ReturnsRefundsPageProps) {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {onNavigate && (
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('home')} 
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        )}

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="mb-4">Returns & Refunds Policy</h1>
            <p className="text-muted-foreground">
              Important information about our no return policy
            </p>
          </div>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <XCircle className="w-6 h-6" />
                No Return Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-background rounded-lg border">
                <h3 className="font-semibold mb-2">Important Notice</h3>
                <p className="text-sm text-muted-foreground">
                  At Himgiri Naturals, we maintain a <strong>strict no return policy</strong> on all our products. 
                  All sales are final and we do not accept returns, exchanges, or refunds for any reason.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-destructive">What This Means</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• No returns accepted</li>
                    <li>• No exchanges allowed</li>
                    <li>• No refunds provided</li>
                    <li>• All sales are final</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-destructive">Why We Have This Policy</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Food safety regulations</li>
                    <li>• Hygiene considerations</li>
                    <li>• Product freshness</li>
                    <li>• Health compliance</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Quality Assurance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                While we maintain a no return policy, we are committed to providing you with the highest quality products:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Our Quality Promise</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Premium sourced products</li>
                    <li>• Rigorous quality checks</li>
                    <li>• Fresh packaging</li>
                    <li>• Proper storage conditions</li>
                    <li>• Expiry date monitoring</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Before You Order</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Read product descriptions carefully</li>
                    <li>• Check quantities and weights</li>
                    <li>• Review your order before checkout</li>
                    <li>• Contact us if you have questions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Damaged or Defective Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                In the rare case that you receive a damaged or defective product due to shipping or handling issues, 
                please contact us immediately:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Call Us</p>
                    <p className="text-sm text-muted-foreground">+91 7668067782</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Email Us</p>
                    <p className="text-sm text-muted-foreground">support@himgirinaturals.com</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Reporting Requirements</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Contact us within 24 hours of delivery</li>
                  <li>• Provide order number and product details</li>
                  <li>• Include photos of the damaged product</li>
                  <li>• Keep original packaging</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                For any questions about our no return policy or if you need assistance with your order:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <span>+91 7668067782</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <span>support@himgirinaturals.com</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}