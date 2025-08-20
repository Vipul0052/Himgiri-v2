import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { 
  User, 
  Package, 
  Heart, 
  Star, 
  Edit, 
  Save, 
  X, 
  Plus,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Image as ImageIcon,
  Trash2,
  Share2,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  addresses: Address[];
  communication_preferences: {
    order_updates: boolean;
    promotions: boolean;
    newsletter: boolean;
  };
}

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  tracking_number?: string;
  shipping_address: Address;
  payment_method: string;
  estimated_delivery?: string;
}

interface WishlistItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  image: string;
  added_date: string;
  in_stock: boolean;
}

interface Review {
  id: string;
  product_id: string;
  product_name: string;
  rating: number;
  comment: string;
  images?: string[];
  helpful_votes: number;
  created_at: string;
  product_image: string;
}

export function UserDashboardPage() {
  const { user, orders, logout } = useAuth();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    communication_preferences: {
      order_updates: true,
      promotions: true,
      newsletter: true
    }
  });
  
  const [addressForm, setAddressForm] = useState({
    type: 'home' as const,
    full_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load profile data
      const profileResp = await fetch(`/api/app?action=user.profile&user_id=${user.id}`);
      if (profileResp.ok) {
        const profileData = await profileResp.json();
        if (profileData.profile) {
          setProfile(profileData.profile);
          setProfileForm({
            name: profileData.profile.name || '',
            phone: profileData.profile.phone || '',
            communication_preferences: profileData.profile.communication_preferences || {
              order_updates: true,
              promotions: true,
              newsletter: true
            }
          });
        }
      }

      // Load wishlist
      const wishlistResp = await fetch(`/api/app?action=wishlist.get&user_id=${user.id}`);
      if (wishlistResp.ok) {
        const wishlistData = await wishlistResp.json();
        if (wishlistData.wishlist) {
          setWishlist(wishlistData.wishlist);
        }
      }

      // Load reviews
      const reviewsResp = await fetch(`/api/app?action=review.user&user_id=${user.id}`);
      if (reviewsResp.ok) {
        const reviewsData = await reviewsResp.json();
        if (reviewsData.reviews) {
          setReviews(reviewsData.reviews);
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    try {
      const resp = await fetch('/api/app?action=user.update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          ...profileForm
        })
      });
      
      if (resp.ok) {
        showToast('Profile updated successfully!', 'success');
        setIsEditingProfile(false);
        await loadUserData(); // Reload data
      } else {
        showToast('Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      showToast('Failed to update profile', 'error');
    }
  };

  const handleAddAddress = async () => {
    if (!user) return;
    
    try {
      const resp = await fetch('/api/app?action=user.add-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          ...addressForm
        })
      });
      
      if (resp.ok) {
        showToast('Address added successfully!', 'success');
        setIsAddingAddress(false);
        setAddressForm({
          type: 'home',
          full_name: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          is_default: false
        });
        await loadUserData(); // Reload data
      } else {
        showToast('Failed to add address', 'error');
      }
    } catch (error) {
      console.error('Address addition failed:', error);
      showToast('Failed to add address', 'error');
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user) return;
    
    try {
              const resp = await fetch('/api/app?action=wishlist.remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          product_id: productId
        })
      });
      
      if (resp.ok) {
        showToast('Removed from wishlist!', 'success');
        setWishlist(prev => prev.filter(item => item.product_id !== productId));
      } else {
        showToast('Failed to remove from wishlist', 'error');
      }
    } catch (error) {
      console.error('Wishlist removal failed:', error);
      showToast('Failed to remove from wishlist', 'error');
    }
  };

  const handleMoveToCart = async (productId: string) => {
    // This would integrate with your cart system
    showToast('Added to cart!', 'success');
    // Remove from wishlist after adding to cart
    await handleRemoveFromWishlist(productId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <AlertCircle className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please login to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = '/#login'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.name}! 👋</h1>
            <p className="text-muted-foreground mt-2">Manage your account, orders, and preferences</p>
          </div>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orders.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {orders.length > 0 ? 'Last order: ' + new Date(orders[0]?.date).toLocaleDateString() : 'No orders yet'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{wishlist.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {wishlist.length > 0 ? 'Items saved for later' : 'Start building your wishlist'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reviews Given</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reviews.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {reviews.length > 0 ? 'Help other customers' : 'Share your experience'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest purchases and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-medium">Order #{order.id.toUpperCase()}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.date).toLocaleDateString()} • {order.items.length} items
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </Badge>
                          <p className="font-medium">₹{order.total}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No orders yet</p>
                    <Button className="mt-2" onClick={() => setActiveTab('orders')}>
                      Start Shopping
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your profile and preferences</CardDescription>
                  </div>
                  {!isEditingProfile && (
                    <Button onClick={() => setIsEditingProfile(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-base font-medium">Communication Preferences</Label>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="order_updates"
                            checked={profileForm.communication_preferences.order_updates}
                            onChange={(e) => setProfileForm(prev => ({
                              ...prev,
                              communication_preferences: {
                                ...prev.communication_preferences,
                                order_updates: e.target.checked
                              }
                            }))}
                          />
                          <Label htmlFor="order_updates">Order updates and tracking</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="promotions"
                            checked={profileForm.communication_preferences.promotions}
                            onChange={(e) => setProfileForm(prev => ({
                              ...prev,
                              communication_preferences: {
                                ...prev.communication_preferences,
                                promotions: e.target.checked
                              }
                            }))}
                          />
                          <Label htmlFor="promotions">Special offers and promotions</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="newsletter"
                            checked={profileForm.communication_preferences.newsletter}
                            onChange={(e) => setProfileForm(prev => ({
                              ...prev,
                              communication_preferences: {
                                ...prev.communication_preferences,
                                newsletter: e.target.checked
                              }
                            }))}
                          />
                          <Label htmlFor="newsletter">Newsletter and updates</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button onClick={handleProfileUpdate}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                        <p className="text-base">{profile?.name || user.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                        <p className="text-base">{user.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                        <p className="text-base">{profile?.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Addresses */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Shipping Addresses</CardTitle>
                    <CardDescription>Manage your delivery addresses</CardDescription>
                  </div>
                  <Button onClick={() => setIsAddingAddress(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Address
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isAddingAddress && (
                  <div className="border rounded-lg p-4 mb-4">
                    <h4 className="font-medium mb-4">Add New Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="address_type">Address Type</Label>
                        <select
                          id="address_type"
                          value={addressForm.type}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, type: e.target.value as any }))}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="address_full_name">Full Name</Label>
                        <Input
                          id="address_full_name"
                          value={addressForm.full_name}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, full_name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="address_phone">Phone</Label>
                        <Input
                          id="address_phone"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="address_address">Street Address</Label>
                        <Input
                          id="address_address"
                          value={addressForm.address}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, address: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="address_city">City</Label>
                        <Input
                          id="address_city"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="address_state">State</Label>
                        <Input
                          id="address_state"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="address_pincode">Pincode</Label>
                        <Input
                          id="address_pincode"
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, pincode: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                      <input
                        type="checkbox"
                        id="address_default"
                        checked={addressForm.is_default}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, is_default: e.target.checked }))}
                      />
                      <Label htmlFor="address_default">Set as default address</Label>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button onClick={handleAddAddress}>
                        <Save className="w-4 h-4 mr-2" />
                        Add Address
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddingAddress(false)}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {profile?.addresses && profile.addresses.length > 0 ? (
                  <div className="space-y-4">
                    {profile.addresses.map((address) => (
                      <div key={address.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <MapPin className="w-5 h-5 text-muted-foreground mt-1" />
                            <div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="capitalize">
                                  {address.type}
                                </Badge>
                                {address.is_default && (
                                  <Badge className="bg-primary text-primary-foreground">
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <p className="font-medium mt-1">{address.full_name}</p>
                              <p className="text-muted-foreground">{address.address}</p>
                              <p className="text-muted-foreground">
                                {address.city}, {address.state} {address.pincode}
                              </p>
                              <p className="text-muted-foreground flex items-center mt-1">
                                <Phone className="w-4 h-4 mr-1" />
                                {address.phone}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No addresses saved yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add your first shipping address to get started
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>Track your orders and view their status</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">Order #{order.id.toUpperCase()}</h3>
                            <p className="text-muted-foreground">
                              Placed on {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">₹{order.total}</p>
                            <Badge className={`mt-2 ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status}</span>
                            </Badge>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-3 mb-4">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                              <div className="w-12 h-12 bg-background rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Quantity: {item.quantity} × ₹{item.price}
                                </p>
                              </div>
                              <p className="font-medium">₹{item.price * item.quantity}</p>
                            </div>
                          ))}
                        </div>

                        {/* Order Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium mb-2">Shipping Address</h4>
                            <div className="text-sm text-muted-foreground">
                              <p>{order.shipping_address?.full_name}</p>
                              <p>{order.shipping_address?.address}</p>
                              <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.pincode}</p>
                              <p>{order.shipping_address?.phone}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Order Details</h4>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>Payment Method: {order.payment_method}</p>
                              {order.tracking_number && (
                                <p>Tracking: {order.tracking_number}</p>
                              )}
                              {order.estimated_delivery && (
                                <p>Estimated Delivery: {order.estimated_delivery}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Truck className="w-4 h-4 mr-2" />
                            Track Order
                          </Button>
                          <Button variant="outline" size="sm">
                            <Package className="w-4 h-4 mr-2" />
                            Reorder
                          </Button>
                          <Button variant="outline" size="sm">
                            <Star className="w-4 h-4 mr-2" />
                            Review Items
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No orders yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start shopping to see your order history here
                    </p>
                    <Button className="mt-4" onClick={() => window.location.href = '/#shop'}>
                      Browse Products
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Wishlist</CardTitle>
                <CardDescription>Products you've saved for later</CardDescription>
              </CardHeader>
              <CardContent>
                {wishlist.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="w-full h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-lg font-bold text-primary">₹{item.price}</p>
                          <p className="text-sm text-muted-foreground">
                            Added on {new Date(item.added_date).toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge variant={item.in_stock ? "default" : "secondary"}>
                              {item.in_stock ? "In Stock" : "Out of Stock"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button 
                            className="flex-1" 
                            onClick={() => handleMoveToCart(item.product_id)}
                            disabled={!item.in_stock}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRemoveFromWishlist(item.product_id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Your wishlist is empty</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start adding products you love to your wishlist
                    </p>
                    <Button className="mt-4" onClick={() => window.location.href = '/#shop'}>
                      Browse Products
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Reviews</CardTitle>
                <CardDescription>Reviews you've written for products</CardDescription>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium">{review.product_name}</h3>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-muted-foreground mb-3">{review.comment}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>Reviewed on {new Date(review.created_at).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{review.helpful_votes} found this helpful</span>
                              </div>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Share
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No reviews yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Review products you've purchased to help other customers
                    </p>
                    <Button className="mt-4" onClick={() => setActiveTab('orders')}>
                      View Orders
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}