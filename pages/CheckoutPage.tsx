import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { ArrowLeft, CreditCard, Smartphone, Truck, Shield, MapPin } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface CheckoutPageProps { onNavigate: (page: string) => void; }

declare global { interface Window { Razorpay?: any; } }

export function CheckoutPage({ onNavigate }: CheckoutPageProps) {
  const { items, total, clearCart } = useCart();
  const { user, addOrder, setReturnUrl } = useAuth();
  const { showToast } = useToast();
  
  // Check if user is logged in
  if (!user) {
    // Set return URL to checkout before redirecting to login
    setReturnUrl('checkout');
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="mb-6">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Login Required</h2>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to complete your purchase
          </p>
        </div>
        <div className="space-y-3">
          <Button onClick={() => onNavigate('login')} className="w-full">
            Login to Continue
          </Button>
          <Button variant="outline" onClick={() => {
            // Navigate to login page and set return URL to checkout
            setReturnUrl('checkout');
            onNavigate('login');
            // We'll use a custom event to signal the login page to open signup tab
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('openSignupTab'));
            }, 100);
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
  
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '', address: '', city: '', state: '', pincode: ''
  });

  const deliveryFee = total > 999 ? 0 : 50;
  const finalTotal = total + deliveryFee;

  const handleInputChange = (field: string, value: string) => setShippingInfo(prev => ({ ...prev, [field]: value }));

  const validateForm = () => ['fullName','email','phone','address','city','state','pincode'].every(f => shippingInfo[f as keyof typeof shippingInfo].trim() !== '');

  const createRazorpayOrder = async (amountPaise: number) => {
    const resp = await fetch('/api/payments?action=razorpay.order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: amountPaise }) })
    if (!resp.ok) throw new Error('Order create failed'); return resp.json();
  }
  const verifyRazorpay = async (payload: any) => {
    const resp = await fetch('/api/payments?action=razorpay.verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return resp.ok;
  }

  const saveOrderToDatabase = async (orderData: any) => {
    try {
      const orderPayload = {
        user_id: user?.id,
        email: shippingInfo.email,
        name: shippingInfo.fullName,
        amount: orderData.total,
        currency: 'INR',
        items: orderData.items,
        shipping: {
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          pincode: shippingInfo.pincode,
          phone: shippingInfo.phone
        },
        status: orderData.status,
        payment_method: paymentMethod,
        created_at: new Date().toISOString()
      };

      const resp = await fetch('/api/app?action=orders.create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!resp.ok) {
        console.error('Failed to save order to database:', await resp.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving order to database:', error);
      return false;
    }
  };

  const handlePlaceOrder = async () => {
    // Double-check authentication
    if (!user) {
      showToast('Please login to place an order', 'error');
      onNavigate('login');
      return;
    }
    
    if (!validateForm()) { showToast('Please fill in all required fields', 'error'); return; }
    if (items.length === 0) { showToast('Your cart is empty', 'error'); return; }
    setIsProcessing(true);
    try {
      if (paymentMethod === 'razorpay') {
        const amountPaise = finalTotal * 100;
        const { order, keyId } = await createRazorpayOrder(amountPaise);
        if (!window.Razorpay) {
          await new Promise<void>((resolve, reject) => { const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.onload = () => resolve(); s.onerror = () => reject(new Error('Failed to load Razorpay')); document.body.appendChild(s); });
        }
        const options = {
          key: keyId, amount: order.amount, currency: order.currency, name: 'Himgiri Naturals', description: 'Order Payment', order_id: order.id,
          prefill: { name: shippingInfo.fullName, email: shippingInfo.email, contact: shippingInfo.phone }, theme: { color: '#d4af37' },
          handler: async (response: any) => {
            const ok = await verifyRazorpay(response);
            if (!ok) { showToast('Payment verification failed', 'error'); setIsProcessing(false); return; }
            const orderData = { total: finalTotal, status: 'pending' as const, items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price, image: i.image })) };
            
            // Save order to database
            const dbSaved = await saveOrderToDatabase(orderData);
            if (!dbSaved) {
              showToast('Order placed but failed to save to database', 'warning');
            }
            
            if (user) addOrder(orderData); clearCart(); showToast('Payment successful! Order placed successfully.', 'success'); setTimeout(() => onNavigate(user ? 'orders' : 'home'), 1500); setIsProcessing(false);
          }
        };
        const rz = new window.Razorpay(options);
        rz.on('payment.failed', () => { showToast('Payment failed. Please try again.', 'error'); setIsProcessing(false); });
        rz.open();
        return;
      }
      // COD / UPI
      await new Promise(r => setTimeout(r, 800));
      const orderData = { total: finalTotal, status: 'pending' as const, items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price, image: i.image })) };
      
      // Save order to database
      const dbSaved = await saveOrderToDatabase(orderData);
      if (!dbSaved) {
        showToast('Order placed but failed to save to database', 'warning');
      }
      
      if (user) addOrder(orderData); clearCart();
      showToast(paymentMethod === 'upi' ? 'Payment successful! Order placed successfully.' : 'Order placed successfully! Pay on delivery.', 'success');
      setTimeout(() => onNavigate(user ? 'orders' : 'home'), 1500);
    } catch { showToast('Failed to place order. Please try again.', 'error'); } finally { setIsProcessing(false); }
  };

  if (items.length === 0) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <h2 className="mb-4">Your cart is empty</h2>
      <p className="mb-6 text-muted-foreground">Add some products to checkout</p>
      <Button onClick={() => onNavigate('shop')}>Continue Shopping</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('cart')} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Button>
          <h1>Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" /> Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" value={shippingInfo.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} placeholder="Enter your full name" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" value={shippingInfo.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="your@email.com" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" value={shippingInfo.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input id="address" value={shippingInfo.address} onChange={(e) => handleInputChange('address', e.target.value)} placeholder="Street address" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" value={shippingInfo.city} onChange={(e) => handleInputChange('city', e.target.value)} placeholder="City" />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" value={shippingInfo.state} onChange={(e) => handleInputChange('state', e.target.value)} placeholder="State" />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input id="pincode" value={shippingInfo.pincode} onChange={(e) => handleInputChange('pincode', e.target.value)} placeholder="110001" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="razorpay" id="razorpay" />
                    <Label htmlFor="razorpay" className="flex-1 flex items-center gap-3 cursor-pointer">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <div><div>Credit/Debit Card, Net Banking</div><div className="text-sm text-muted-foreground">Powered by Razorpay</div></div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="flex-1 flex items-center gap-3 cursor-pointer">
                      <Smartphone className="w-5 h-5 text-purple-600" />
                      <div><div>UPI Payment</div><div className="text-sm text-muted-foreground">Pay using PhonePe, GPay, Paytm</div></div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 flex items-center gap-3 cursor-pointer">
                      <Truck className="w-5 h-5 text-green-600" />
                      <div><div>Cash on Delivery</div><div className="text-sm text-muted-foreground">Pay when you receive</div></div>
                    </Label>
                  </div>
                </RadioGroup>
                {paymentMethod === 'razorpay' && (<div className="mt-4 text-sm text-muted-foreground">Payment will be processed securely via Razorpay on next step.</div>)}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <ImageWithFallback src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h4 className="text-sm">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.weight}</p>
                      <div className="flex justify-between items-center mt-1"><span className="text-sm">Qty: {item.quantity}</span><span>₹{item.price * item.quantity}</span></div>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{total}</span></div>
                  <div className="flex justify-between"><span>Delivery</span><span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span></div>
                  {deliveryFee === 0 && (<p className="text-xs text-green-600">🎉 Free delivery on orders above ₹999</p>)}
                  <Separator />
                  <div className="flex justify-between font-semibold"><span>Total</span><span>₹{finalTotal}</span></div>
                </div>
                <Button onClick={handlePlaceOrder} disabled={isProcessing || !validateForm()} className="w-full" size="lg">{isProcessing ? 'Processing...' : `Place Order - ₹${finalTotal}`}</Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Shield className="w-4 h-4" /><span>Secure checkout</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Delivery Information</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex items-start gap-2"><Truck className="w-4 h-4 mt-0.5 text-muted-foreground" /><div><p>Standard Delivery: 3-5 business days</p><p className="text-muted-foreground">Free delivery on orders above ₹999</p></div></div>
                <div className="flex items-start gap-2"><Shield className="w-4 h-4 mt-0.5 text-muted-foreground" /><div><p>No Return Policy</p><p className="text-muted-foreground">All sales are final</p></div></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}