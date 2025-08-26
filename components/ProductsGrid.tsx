import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  weight: string;
  image: string;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
}

interface ProductsGridProps {
  products: Product[];
}

export function ProductsGrid({ products }: ProductsGridProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      const resp = await fetch(`/api/app?action=wishlist.get&user_id=${user?.id}`);
      if (resp.ok) {
        const data = await resp.json();
        const wishlistIds = new Set(data.wishlist?.map((item: any) => item.product_id) || []);
        setWishlistItems(wishlistIds);
      }
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    }
  };

  const toggleWishlist = async (product: Product) => {
    if (!user) {
      showToast('Please login to add items to wishlist', 'info');
      return;
    }

    try {
      const isInWishlist = wishlistItems.has(product.id);
      
      if (isInWishlist) {
        // Remove from wishlist
        const resp = await fetch('/api/app?action=wishlist.remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            product_id: product.id
          })
        });
        
        if (resp.ok) {
          setWishlistItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(product.id);
            return newSet;
          });
          showToast('Removed from wishlist', 'success');
        }
      } else {
        // Add to wishlist
        const resp = await fetch('/api/app?action=wishlist.add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            product_id: product.id,
            product_data: product
          })
        });
        
        if (resp.ok) {
          setWishlistItems(prev => new Set(prev).add(product.id));
          showToast('Added to wishlist', 'success');
        }
      }
    } catch (error) {
      showToast('Failed to update wishlist', 'error');
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    showToast(`${product.name} added to cart successfully`, 'success');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
          <CardHeader className="p-0 relative">
            <div className="relative">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Wishlist Button */}
              <Button
                variant="ghost"
                size="sm"
                className={`absolute top-2 right-2 rounded-full w-8 h-8 p-0 ${
                  wishlistItems.has(product.id) 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-white/80 text-gray-600 hover:bg-white'
                }`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product) }}
              >
                <Heart className={`w-4 h-4 ${wishlistItems.has(product.id) ? 'fill-current' : ''}`} />
              </Button>

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.isNew && (
                  <Badge className="bg-green-500 text-white text-xs">New</Badge>
                )}
                {product.isBestSeller && (
                  <Badge className="bg-yellow-500 text-white text-xs">Best Seller</Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < (product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                {product.reviewCount && (
                  <span className="text-sm text-muted-foreground">
                    ({product.reviewCount})
                  </span>
                )}
              </div>

              <p className="text-sm text-muted-foreground">{product.weight}</p>
              
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-primary">₹{product.price}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-4 pt-0">
            <Button 
              onClick={() => handleAddToCart(product)}
              className="w-full flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}