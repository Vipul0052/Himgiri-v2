import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { FileText, Scale, Shield, AlertTriangle, CheckCircle, Mail, Phone } from 'lucide-react';

export function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl mb-4">Terms of Service</h1>
        <p className="text-lg text-muted-foreground">
          These terms govern your use of Himgirinaturals website and services. 
          Please read carefully before making any purchases.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Badge variant="outline">Effective Date: January 1, 2025</Badge>
          <Badge variant="outline">Version 3.0</Badge>
        </div>
      </div>

      {/* Quick Summary */}
      <Card className="mb-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <CardTitle>Quick Summary</CardTitle>
          </div>
          <CardDescription>
            Key points you should know before using our services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                What You Can Expect
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• High-quality, fresh dry fruits and nuts</li>
                <li>• Secure payment processing and data protection</li>
                <li>• Timely delivery and customer support</li>
                <li>• Fair return and refund policies</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Your Responsibilities
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Provide accurate information for orders</li>
                <li>• Use our website respectfully and legally</li>
                <li>• Pay for orders as agreed</li>
                <li>• Follow proper storage instructions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acceptance of Terms */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>1. Acceptance of Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            By accessing and using the Himgirinaturals website (www.himgirinaturals.com), 
            placing orders, or using our services, you acknowledge that you have read, 
            understood, and agree to be bound by these Terms of Service.
          </p>
          <p>
            If you do not agree with any part of these terms, please do not use our website or services. 
            We reserve the right to modify these terms at any time, and continued use constitutes acceptance of any changes.
          </p>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="font-medium mb-2">Age Requirement:</p>
            <p className="text-sm text-muted-foreground">
              You must be at least 18 years old to make purchases. Minors may use our services with parental consent and supervision.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Products and Services */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>2. Products & Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Product Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Quality Assurance</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• All products are sourced from certified suppliers</li>
                  <li>• Quality testing before packaging and dispatch</li>
                  <li>• Proper storage and handling procedures</li>
                  <li>• Clear expiry dates and storage instructions</li>
                </ul>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Product Descriptions</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Accurate descriptions to the best of our knowledge</li>
                  <li>• Images may vary slightly from actual products</li>
                  <li>• Nutritional information based on supplier data</li>
                  <li>• Origin and processing details provided where available</li>
                </ul>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Service Availability</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Our services are available 24/7 online, with customer support during business hours. 
              We reserve the right to modify, suspend, or discontinue any part of our services without prior notice.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">Website Access</h4>
                <p className="text-sm text-green-600 dark:text-green-400">24/7 online ordering</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Customer Support</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400">Mon-Sat, 9 AM - 7 PM</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg">
                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">Order Processing</h4>
                <p className="text-sm text-purple-600 dark:text-purple-400">Business days only</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders and Payments */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>3. Orders & Payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Order Process</h3>
              <div className="space-y-3">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Order Confirmation</h4>
                    <p className="text-xs text-muted-foreground">
                      Orders are confirmed upon successful payment processing
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Processing Time</h4>
                    <p className="text-xs text-muted-foreground">
                      24-48 hours for standard orders, longer for bulk orders
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Modification Rights</h4>
                    <p className="text-xs text-muted-foreground">
                      Orders can be modified within 2 hours of placement
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Payment Terms</h3>
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-1">Accepted Methods</h4>
                  <p className="text-sm text-muted-foreground">
                    Credit/debit cards, UPI, net banking, digital wallets, and COD
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-1">Payment Security</h4>
                  <p className="text-sm text-muted-foreground">
                    All payments processed through secure, PCI-compliant gateways
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-1">Pricing</h4>
                  <p className="text-sm text-muted-foreground">
                    Prices in INR, subject to change without notice. Taxes included where applicable
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping and Delivery */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>4. Shipping & Delivery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Delivery Terms</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Delivery timelines are estimates, not guarantees</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Risk of loss transfers upon delivery to your address</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Accurate delivery address is customer's responsibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Re-delivery charges apply for failed delivery attempts</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">International Shipping</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Customs duties and taxes are customer's responsibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Delivery delays due to customs clearance possible</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Some products may be restricted in certain countries</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Customer must check import regulations in their country</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liability and Disclaimers */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Scale className="h-6 w-6 text-primary" />
            <CardTitle>5. Liability & Disclaimers</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
            <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Important Disclaimers
            </h3>
            <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
              <li>• Products are sold "as is" without warranties beyond what's legally required</li>
              <li>• We are not responsible for allergic reactions or health issues</li>
              <li>• Nutritional information is approximate and may vary</li>
              <li>• Not liable for damages beyond the purchase price</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Limitation of Liability</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Our liability is limited to the purchase price of the product. We are not liable for 
                indirect, incidental, or consequential damages.
              </p>
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-1">Maximum Liability</h4>
                <p className="text-sm text-muted-foreground">
                  Limited to the total amount paid for the specific order
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Health & Safety</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Customers with allergies or health conditions should consult healthcare providers 
                before consuming our products.
              </p>
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-1">Customer Responsibility</h4>
                <p className="text-sm text-muted-foreground">
                  Check ingredient lists and follow storage instructions
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Conduct */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>6. User Conduct & Prohibited Uses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-red-700 dark:text-red-400">Prohibited Activities</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Fraudulent or unauthorized use of payment methods</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Attempting to hack, disrupt, or misuse our systems</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Providing false or misleading information</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Using our services for illegal purposes</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Violating intellectual property rights</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-green-700 dark:text-green-400">Expected Behavior</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Provide accurate account and order information</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Respect our staff and other customers</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Use our services for legitimate purposes only</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Follow return and refund procedures properly</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Report issues or concerns promptly</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Governing Law */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>7. Governing Law & Dispute Resolution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Applicable Law</h3>
              <p className="text-sm text-muted-foreground mb-3">
                These terms are governed by the laws of India. Any disputes will be subject to 
                the exclusive jurisdiction of courts in Gurgaon, Haryana.
              </p>
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-1">Jurisdiction</h4>
                <p className="text-sm text-muted-foreground">
                  Gurgaon, Haryana, India
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Dispute Resolution</h3>
              <p className="text-sm text-muted-foreground mb-3">
                We encourage resolving disputes through direct communication. 
                If needed, mediation will be attempted before legal proceedings.
              </p>
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-1">Contact for Disputes</h4>
                <p className="text-sm text-muted-foreground">
                  legal@himgirinaturals.com
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Questions About These Terms?</CardTitle>
          </div>
          <CardDescription>
            Contact us if you need clarification on any part of these terms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Legal Department</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Terms and legal questions
              </p>
              <Button variant="outline" size="sm">
                legal@himgirinaturals.com
              </Button>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Phone className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Customer Service</h3>
              <p className="text-sm text-muted-foreground mb-3">
                General inquiries and support
              </p>
              <Button variant="outline" size="sm">
                +12898138506
              </Button>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="h-8 w-8 bg-accent text-accent-foreground rounded mx-auto mb-3 flex items-center justify-center">
                <span className="text-sm font-bold">H</span>
              </div>
              <h3 className="font-semibold mb-2">Business Address</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Official registered address
              </p>
              <Button variant="outline" size="sm">
                Sector 31, Gurgaon
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}