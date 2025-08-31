import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, Truck, Shield, Lock } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface CartPageProps {
  onNavigate: (page: string) => void;
}

export function CartPage({ onNavigate }: CartPageProps) {
  const { items, total, updateQuantity, removeItem } = useCart();
  const { user, setReturnUrl } = useAuth();
  const { showToast } = useToast();
  
  // Check if user is logged in
  if (!user) {
    // Set return URL to cart before redirecting to login
    setReturnUrl('cart');
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="mb-6">
          <Lock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Login Required</h2>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to view your cart and make purchases
          </p>
        </div>
        <div className="space-y-3">
          <Button onClick={() => onNavigate('login')} className="w-full">
            Login to Continue
          </Button>
          <Button variant="outline" onClick={() => {
            // Set return URL to cart
            setReturnUrl('cart');
            // Set a flag in localStorage to open signup tab
            localStorage.setItem('himgiri_open_signup_tab', 'true');
            // Navigate to login page
            onNavigate('login');
          }} className="w-full">
            Create New Account
          </Button>
          <Button variant="ghost" onClick={() => onNavigate('shop')} className="w-full">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }
  
  const deliveryFee = total > 999 ? 0 : 50;
  const finalTotal = total + deliveryFee;

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(id);
      return;
    }
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      removeItem(id);
      showToast(`${item.name} removed from cart`, 'info');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="mb-4">Your cart is empty</h2>
        <p className="mb-6 text-muted-foreground">
          Discover our premium dry fruits and nuts collection
        </p>
        <div className="flex gap-4">
          <Button onClick={() => onNavigate('home')}>
            Back to Home
          </Button>
          <Button onClick={() => onNavigate('shop')} variant="outline">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Button>
          <div>
            <h1>Shopping Cart</h1>
            <p className="text-muted-foreground">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.weight}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold text-primary">₹{item.price}</span>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="text-sm text-muted-foreground line-through">
                                ₹{item.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="font-semibold">
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>₹{total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span>
                  </div>
                  {deliveryFee === 0 && (
                    <p className="text-xs text-green-600">🎉 Free delivery on orders above ₹999</p>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{finalTotal}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => onNavigate('checkout')}
                  className="w-full" 
                  size="lg"
                >
                  Proceed to Checkout
                </Button>
                
                <Button 
                  onClick={() => onNavigate('shop')}
                  variant="outline" 
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>

            {/* Delivery & Policy Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order Information</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="flex items-start gap-2">
                  <Truck className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Free Delivery</p>
                    <p className="text-muted-foreground">On orders above ₹999 • 3-5 business days</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">No Return Policy</p>
                    <p className="text-muted-foreground">All sales are final</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted p-3 rounded-lg">
              <Shield className="w-4 h-4" />
              <span>Secure checkout with SSL encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}