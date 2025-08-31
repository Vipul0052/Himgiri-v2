import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { ArrowLeft, CreditCard, Smartphone, Truck, Shield, MapPin, Plus } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { AddressForm, AddressData } from '../components/AddressForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

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
            // Set return URL to checkout
            setReturnUrl('checkout');
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
  
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '', 
    address: '', 
    city: '', 
    state: '', 
    pincode: '', 
    saveAddress: false
  });
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  
  // Load saved addresses when component mounts
  useEffect(() => {
    if (user) {
      loadSavedAddresses();
    }
  }, [user]);

  const loadSavedAddresses = async () => {
    if (!user) return;
    
    try {
      console.log('Loading saved addresses...');
      const response = await fetch(`/api/app?action=user.profile&user_id=${user.id}`);
      if (response.ok) {
        const profileData = await response.json();
        console.log('Profile data loaded successfully');
        console.log('Addresses count:', profileData.profile?.addresses?.length || 0);
        setSavedAddresses(profileData.profile.addresses || []);
      } else {
        console.error('Failed to load profile data:', response.status);
      }
    } catch (error) {
      console.error('Failed to load saved addresses:', error);
    }
  };

  const handleSavedAddressSelect = (addressId: string) => {
    console.log('handleSavedAddressSelect called with addressId:', addressId);
    if (!addressId) return;
    
    const selectedAddress = savedAddresses.find(addr => addr.id === addressId);
    console.log('Selected address found:', selectedAddress);
    
    if (selectedAddress) {
      const updatedShippingInfo = {
        ...shippingInfo,
        fullName: selectedAddress.full_name,
        phone: selectedAddress.phone,
        address: selectedAddress.address,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
        saveAddress: false // Don't save an already saved address
      };
      
      console.log('Updating shipping info to:', updatedShippingInfo);
      setShippingInfo(updatedShippingInfo);
      
      // Show success message
      showToast(`Address loaded: ${selectedAddress.full_name}`, 'success');
    } else {
      console.error('Selected address not found for ID:', addressId);
      showToast('Selected address not found', 'error');
    }
  };

  const handleAddNewAddress = async (addressData: AddressData) => {
    console.log('Adding new address:', addressData);
    setIsAddingAddress(true);
    try {
      // Update shipping info with new address
      setShippingInfo(prev => ({
        ...prev,
        fullName: addressData.full_name,
        phone: addressData.phone,
        address: addressData.address,
        city: addressData.city,
        state: addressData.state,
        pincode: addressData.pincode,
        saveAddress: true // Mark to save this new address
      }));

      // Save address to user's address book
      if (user) {
        console.log('Saving address to address book...');
        const addressPayload = {
          user_id: user.id,
          type: addressData.type,
          full_name: addressData.full_name,
          phone: addressData.phone,
          address: addressData.address,
          city: addressData.city,
          state: addressData.state,
          pincode: addressData.pincode,
          is_default: addressData.is_default
        };

        console.log('Address payload prepared');

        const addressResp = await fetch('/api/app?action=user.add-address', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addressPayload)
        });

        console.log('Address API response status:', addressResp.status);

        if (addressResp.ok) {
          const responseData = await addressResp.json();
          console.log('Address saved successfully');
          showToast('Address saved successfully!', 'success');
          await loadSavedAddresses(); // Reload saved addresses
        } else {
          const errorText = await addressResp.text();
          console.error('Failed to save address to address book:', addressResp.status, errorText);
          showToast('Address saved for checkout but failed to save to address book', 'warning');
        }
      }

      setShowAddressForm(false);
    } catch (error) {
      console.error('Error adding new address:', error);
      showToast('Failed to add address', 'error');
    } finally {
      setIsAddingAddress(false);
    }
  };

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
        payment_method: paymentMethod, // Use the current payment method
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

      // After successful order creation, save address to user's address book
      if (user) {
        if (shippingInfo.saveAddress) {
          await saveAddressToUserBook();
        }
        // Trigger a refresh of user orders
        window.dispatchEvent(new CustomEvent('refreshUserOrders'));
      }

      return true;
    } catch (error) {
      console.error('Error saving order to database:', error);
      return false;
    }
  };

  // Function to save checkout address to user's address book
  const saveAddressToUserBook = async () => {
    if (!user) {
      console.log('No user logged in, cannot save address');
      return;
    }
    
    console.log('Saving checkout address to user book:', shippingInfo);
    
    try {
      // Check if this address already exists
      const existingAddressesResp = await fetch(`/api/app?action=user.profile&user_id=${user.id}`);
      if (existingAddressesResp.ok) {
        const profileData = await existingAddressesResp.json();
        const existingAddresses = profileData.profile?.addresses || [];
        
        console.log('Existing addresses:', existingAddresses);
        
        // Check if this exact address already exists
        const addressExists = existingAddresses.some((addr: any) => 
          addr.address === shippingInfo.address &&
          addr.city === shippingInfo.city &&
          addr.state === shippingInfo.state &&
          addr.pincode === shippingInfo.pincode &&
          addr.phone === shippingInfo.phone
        );
        
        console.log('Address already exists:', addressExists);
        
        if (!addressExists) {
          // Save new address to user's address book
          const addressPayload = {
            user_id: user.id,
            type: 'home', // Default type for checkout addresses
            full_name: shippingInfo.fullName,
            phone: shippingInfo.phone,
            address: shippingInfo.address,
            city: shippingInfo.city,
            state: shippingInfo.state,
            pincode: shippingInfo.pincode,
            is_default: existingAddresses.length === 0 // Make default if it's the first address
          };
          
          console.log('Saving new address with payload:', addressPayload);
          
          const addressResp = await fetch('/api/app?action=user.add-address', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(addressPayload)
          });
          
          console.log('Address save response status:', addressResp.status);
          
          if (addressResp.ok) {
            const responseData = await addressResp.json();
            console.log('Checkout address saved to user address book:', responseData);
            showToast('Address saved to your address book for future orders!', 'success');
          } else {
            const errorText = await addressResp.text();
            console.error('Failed to save address to address book:', addressResp.status, errorText);
            showToast('Order placed but address not saved to address book', 'warning');
          }
        } else {
          console.log('Address already exists, not saving duplicate');
        }
      } else {
        console.error('Failed to fetch existing addresses:', existingAddressesResp.status);
      }
    } catch (error) {
      console.error('Error saving address to address book:', error);
      // Don't fail the order if address saving fails
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
            
            clearCart(); showToast('Payment successful! Order placed successfully.', 'success'); setTimeout(() => onNavigate(user ? 'orders' : 'home'), 1500); setIsProcessing(false);
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
      
      clearCart();
      showToast(paymentMethod === 'upi' ? 'Payment successful! Order placed successfully.' : 'Order placed successfully! Pay on delivery.', 'success');
      setTimeout(() => onNavigate(user ? 'orders' : 'home'), 1500);
    } catch { showToast('Failed to place order. Please try again.', 'error'); } finally { setIsProcessing(false); }
  };

  useEffect(() => {
    try { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }) } catch { window.scrollTo(0, 0) }
  }, [])

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
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" /> 
                  Shipping Information
                  {user && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddressForm(true)}
                      className="ml-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Address
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Saved Addresses Dropdown */}
                {user && savedAddresses.length > 0 && (
                  <div>
                    <Label htmlFor="savedAddresses">Use Saved Address</Label>
                    <select
                      id="savedAddresses"
                      onChange={(e) => handleSavedAddressSelect(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      defaultValue=""
                    >
                      <option value="">Select a saved address or fill manually</option>
                      {savedAddresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.type} - {addr.full_name} - {addr.address}, {addr.city}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* Manual Address Form */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input 
                        id="fullName" 
                        value={shippingInfo.fullName} 
                        onChange={(e) => handleInputChange('fullName', e.target.value)} 
                        placeholder="Enter your full name" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={shippingInfo.email} 
                        onChange={(e) => handleInputChange('email', e.target.value)} 
                        placeholder="your@email.com" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="flex">
                      <div className="flex items-center px-3 py-2 bg-background border border-r-0 rounded-l-md text-sm text-muted-foreground">
                        +91
                      </div>
                      <Input 
                        id="phone"
                        value={shippingInfo.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="Enter 10-digit mobile number"
                        className="rounded-l-none focus:bg-background"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Complete Address *</Label>
                    <Input 
                      id="address" 
                      value={shippingInfo.address} 
                      onChange={(e) => handleInputChange('address', e.target.value)} 
                      placeholder="House/Flat number, Street, Area, Landmark" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input 
                        id="city" 
                        value={shippingInfo.city} 
                        onChange={(e) => handleInputChange('city', e.target.value)} 
                        placeholder="City" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Select 
                        value={shippingInfo.state} 
                        onValueChange={(value) => handleInputChange('state', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
                            'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
                            'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
                            'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
                            'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
                            'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir',
                            'Ladakh', 'Chandigarh', 'Dadra & Nagar Haveli', 'Daman & Diu', 'Lakshadweep',
                            'Puducherry', 'Andaman & Nicobar Islands'
                          ].map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input 
                        id="pincode" 
                        value={shippingInfo.pincode} 
                        onChange={(e) => handleInputChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} 
                        placeholder="123456" 
                        maxLength={6}
                      />
                    </div>
                  </div>
                  
                  {/* Save Address Option */}
                  {user && (
                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="checkbox"
                        id="saveAddress"
                        checked={shippingInfo.saveAddress}
                        onChange={(e) => handleInputChange('saveAddress', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="saveAddress" className="text-sm">
                        Save this address to my address book for future orders
                      </Label>
                    </div>
                  )}
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

      {showAddressForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <AddressForm
            onSubmit={handleAddNewAddress}
            onCancel={() => setShowAddressForm(false)}
            isSubmitting={isAddingAddress}
            title="Add New Address for Checkout"
          />
        </div>
      )}
    </div>
  );
}