import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../components/Toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Heart, ShoppingCart, Star, ArrowLeft } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface WishlistItem {
  id: string;
  product_id: string;
  product_data: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating?: number;
    reviewCount?: number;
    weight: string;
    category: string;
    inStock: boolean;
    badge?: string;
  };
  created_at: string;
}

interface WishlistPageProps {
  onNavigate: (page: string) => void;
}

export function WishlistPage({ onNavigate }: WishlistPageProps) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      const resp = await fetch(`/api/app?action=wishlist.get&user_id=${user?.id}`);
      if (resp.ok) {
        const data = await resp.json();
        setWishlistItems(data.wishlist || []);
      } else {
        showToast('Failed to load wishlist', 'error');
      }
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      showToast('Failed to load wishlist', 'error');
    } finally {
      setLoading(false);
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
        setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
        showToast('Removed from wishlist', 'success');
      } else {
        showToast('Failed to remove from wishlist', 'error');
      }
    } catch (error) {
      showToast('Failed to remove from wishlist', 'error');
    }
  };

  const addToCartFromWishlist = (item: WishlistItem) => {
    addToCart(item.product_data);
    showToast(`${item.product_data.name} added to cart`, 'success');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Wishlist</h1>
            <p className="text-gray-600 mb-8">Please login to view your wishlist</p>
            <Button onClick={() => onNavigate('login')} className="bg-green-600 hover:bg-green-700">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => onNavigate('home')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          </div>
          <div className="text-sm text-gray-500">
            {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">Start adding products you love to your wishlist!</p>
            <Button onClick={() => onNavigate('shop')} className="bg-green-600 hover:bg-green-700">
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardHeader className="p-0 relative">
                  <div className="relative">
                    <ImageWithFallback
                      src={item.product_data.image}
                      alt={item.product_data.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Badge */}
                    {item.product_data.badge && (
                      <Badge className="absolute top-2 left-2 bg-green-600 text-white">
                        {item.product_data.badge}
                      </Badge>
                    )}
                    
                    {/* Remove from wishlist button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-600 hover:text-red-700"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFromWishlist(item.product_data.id); }}
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.product_data.name}
                  </h3>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {item.product_data.rating || 4.5}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({item.product_data.reviewCount || 0} reviews)
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg font-bold text-green-600">
                      ₹{item.product_data.price}
                    </span>
                    {item.product_data.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{item.product_data.originalPrice}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    Weight: {item.product_data.weight}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Category: {item.product_data.category}
                  </div>
                </CardContent>
                
                <CardFooter className="p-4 pt-0">
                  <div className="w-full space-y-2">
                    <Button
                      onClick={() => addToCartFromWishlist(item)}
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={!item.product_data.inStock}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    
                    {!item.product_data.inStock && (
                      <div className="text-center text-sm text-red-600">
                        Out of Stock
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}