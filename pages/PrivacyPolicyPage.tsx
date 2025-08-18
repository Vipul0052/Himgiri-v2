import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Shield, Eye, Lock, Users, Mail, Phone } from 'lucide-react';

export function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl mb-4">Privacy Policy</h1>
        <p className="text-lg text-muted-foreground">
          Your privacy is important to us. This policy outlines how Himgirinaturals collects, 
          uses, and protects your personal information.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Badge variant="outline">Last Updated: January 2025</Badge>
          <Badge variant="outline">Version 2.1</Badge>
        </div>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardHeader className="text-center pb-4">
            <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
            <CardTitle className="text-lg">Data Protection</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              SSL encryption & secure storage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center pb-4">
            <Eye className="h-10 w-10 text-primary mx-auto mb-3" />
            <CardTitle className="text-lg">Transparency</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Clear data usage policies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center pb-4">
            <Lock className="h-10 w-10 text-primary mx-auto mb-3" />
            <CardTitle className="text-lg">Your Control</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Manage your data preferences
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center pb-4">
            <Users className="h-10 w-10 text-primary mx-auto mb-3" />
            <CardTitle className="text-lg">No Sharing</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Never sold to third parties
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Information Collection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Information We Collect</CardTitle>
          <CardDescription>
            We collect information to provide better services and improve your shopping experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Account Information</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Full name and contact details</li>
                  <li>• Email address and phone number</li>
                  <li>• Shipping and billing addresses</li>
                  <li>• Date of birth (optional)</li>
                </ul>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Order Information</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Purchase history and preferences</li>
                  <li>• Payment method details</li>
                  <li>• Delivery tracking information</li>
                  <li>• Customer service interactions</li>
                </ul>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Technical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Device & Browser Data</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• IP address and location data</li>
                  <li>• Browser type and version</li>
                  <li>• Operating system information</li>
                  <li>• Device identifiers</li>
                </ul>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Usage Analytics</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Pages visited and time spent</li>
                  <li>• Click patterns and navigation</li>
                  <li>• Search queries and filters used</li>
                  <li>• Shopping cart interactions</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How We Use Information */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How We Use Your Information</CardTitle>
          <CardDescription>
            Your information helps us provide personalized services and improve our offerings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Service Delivery</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Process and fulfill your orders</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Handle payments and prevent fraud</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Provide customer support</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Send order updates and notifications</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Improvement & Marketing</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Personalize your shopping experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Recommend relevant products</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Send promotional offers (with consent)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Analyze website usage and improve services</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Sharing */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Information Sharing & Disclosure</CardTitle>
          <CardDescription>
            We never sell your personal information and only share data when necessary for service delivery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-green-700 dark:text-green-400">When We Share</h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">Service Providers</h4>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Shipping partners, payment processors, and customer support tools
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">Legal Requirements</h4>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    When required by law or to protect our rights and safety
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">Business Transfers</h4>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    In case of company merger, acquisition, or sale of assets
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-red-700 dark:text-red-400">We Never Share</h3>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">Sell to Third Parties</h4>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Your data is never sold to advertisers or marketers
                  </p>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">Unnecessary Disclosure</h4>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Personal information beyond what's required for services
                  </p>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">Without Consent</h4>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Marketing communications without your explicit permission
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Security */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Data Security & Protection</CardTitle>
          <CardDescription>
            We implement industry-standard security measures to protect your information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Technical Safeguards</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>SSL/TLS encryption for data transmission</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Encrypted storage of sensitive information</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Regular security audits and updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Secure payment processing with PCI compliance</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Administrative Controls</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Limited access to personal data on need-to-know basis</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Employee training on data protection</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Regular backup and disaster recovery procedures</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Incident response and breach notification protocols</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Rights */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Rights & Choices</CardTitle>
          <CardDescription>
            You have control over your personal information and how it's used
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Data Access & Control</h3>
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-1">Access Your Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Request a copy of all personal information we have about you
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-1">Update Information</h4>
                  <p className="text-sm text-muted-foreground">
                    Correct or update your personal details anytime
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-1">Delete Account</h4>
                  <p className="text-sm text-muted-foreground">
                    Request deletion of your account and associated data
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Communication Preferences</h3>
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-1">Marketing Emails</h4>
                  <p className="text-sm text-muted-foreground">
                    Opt-out of promotional emails while keeping order updates
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-1">SMS Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Control SMS alerts for orders and delivery updates
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-1">Cookie Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Manage website cookies and tracking preferences
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact section removed */}
    </div>
  );
}