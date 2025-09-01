import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from 'lucide-react';

export function ContactPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-lg">This is the Contact page. If you can see this, navigation is working!</p>
        <div className="mt-8 p-4 bg-green-100 rounded">
          <p className="text-green-800">✅ Contact page is working!</p>
        </div>
      </div>
    </div>
  );
}