import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { 
  User, Package, Heart, Star, Edit3, Save, 
  MapPin, Phone, Mail, Calendar, Truck, 
  Clock, CheckCircle, XCircle, AlertCircle 
} from 'lucide-react';

interface UserDashboardPageProps {
  onNavigate: (page: string) => void;
}

interface Order {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  items: any[];
  shipping: any;
  payment_method: string;
}

interface WishlistItem {
  id: string;
  product_id: string;
  product_data: any;
  created_at: string;
}

interface Review {
  id: string;
  product_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export function UserDashboardPage({ onNavigate }: UserDashboardPageProps) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // Load orders
      const ordersResp = await fetch(`/api/app?action=user.orders&user_id=${user?.id}`);
      if (ordersResp.ok) {
        const ordersData = await ordersResp.json();
        setOrders(ordersData.orders || []);
      }
      
      // Load wishlist
      const wishlistResp = await fetch(`/api/app?action=wishlist.get&user_id=${user?.id}`);
      if (wishlistResp.ok) {
        const wishlistData = await wishlistResp.json();
        setWishlist(wishlistData.wishlist || []);
      }
      
      // Load user reviews
      const reviewsResp = await fetch(`/api/app?action=review.user&user_id=${user?.id}`);
      if (reviewsResp.ok) {
        const reviewsData = await reviewsResp.json();
        setReviews(reviewsData.reviews || []);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      showToast('Failed to load user data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const resp = await fetch('/api/app?action=user.update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          ...profileData
        })
      });
      
      if (resp.ok) {
        showToast('Profile updated successfully', 'success');
        setIsEditing(false);
      } else {
        showToast('Failed to update profile', 'error');
      }
    } catch (error) {
      showToast('Failed to update profile', 'error');
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const resp = await fetch('/api/app?action=wishlist.remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          product_id: productId
        })
      });
      
      if (resp.ok) {
        setWishlist(prev => prev.filter(item => item.product_id !== productId));
        showToast('Removed from wishlist', 'success');
      }
    } catch (error) {
      showToast('Failed to remove from wishlist', 'error');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'shipped': return <Truck className="w-4 h-4 text-purple-500" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <User className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Login Required</h2>
        <p className="text-muted-foreground mb-6">Please login to access your dashboard</p>
        <Button onClick={() => onNavigate('login')}>Login</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
            <p className="text-muted-foreground">Manage your account, orders, and preferences</p>
          </div>
          <Button variant="outline" onClick={() => logout()}>
            Logout
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Member since: {new Date(user.created_at || Date.now()).toLocaleDateString()}
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleProfileUpdate} className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                      <Edit3 className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No orders yet</p>
                    <Button onClick={() => onNavigate('shop')} className="mt-4">
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Amount</p>
                            <p className="font-semibold">₹{order.amount}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Payment</p>
                            <p className="font-semibold">{order.payment_method}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Items</p>
                            <p className="font-semibold">{order.items?.length || 0} items</p>
                          </div>
                        </div>

                        {order.shipping && (
                          <div className="border-t pt-3">
                            <p className="text-sm text-muted-foreground mb-2">Shipping Address:</p>
                            <p className="text-sm">
                              {order.shipping.address}, {order.shipping.city}, {order.shipping.state} - {order.shipping.pincode}
                            </p>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  My Wishlist
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading wishlist...</div>
                ) : wishlist.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Your wishlist is empty</p>
                    <Button onClick={() => onNavigate('shop')} className="mt-4">
                      Discover Products
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlist.map((item) => (
                      <Card key={item.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2">{item.product_data?.name || 'Product'}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.product_data?.weight || 'N/A'}
                            </p>
                            <p className="font-bold text-primary">
                              ₹{item.product_data?.price || 'N/A'}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromWishlist(item.product_id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  My Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>You haven't written any reviews yet</p>
                    <Button onClick={() => onNavigate('shop')} className="mt-4">
                      Shop & Review
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm">{review.comment}</p>
                        )}
                      </Card>
                    ))}
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