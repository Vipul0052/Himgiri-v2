import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useToast } from './Toast';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviews: number;
  weight: string;
  category: string;
  inStock: boolean;
  badge?: string;
}

interface ProductsGridProps {
  title?: string;
  limit?: number;
  category?: string;
}

export function ProductsGrid({ title = "Our Products", limit, category }: ProductsGridProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);

  // Mock products with accurate images and reduced prices
  const allProducts: Product[] = [
    {
      id: '1',
      name: 'Premium Kashmiri Almonds',
      price: 449,
      originalPrice: 549,
      image: 'https://images.unsplash.com/photo-1607214540429-c2b96c3ef533?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYXclMjBhbG1vbmRzJTIwYm93bHxlbnwxfHx8fDE3NTU1MDI4ODB8MA&ixlib=rb-4.1.0&q=80&w=400',
      rating: 4.8,
      reviews: 156,
      weight: '250g',
      category: 'nuts',
      inStock: true,
      badge: 'Premium'
    },
    {
      id: '2',
      name: 'Organic California Walnuts',
      price: 399,
      originalPrice: 499,
      image: 'https://images.unsplash.com/photo-1733337336594-61f20d18ac2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGVsbGVkJTIwd2FsbnV0c3xlbnwxfHx8fDE3NTU1MDI4ODF8MA&ixlib=rb-4.1.0&q=80&w=400',
      rating: 4.7,
      reviews: 89,
      weight: '250g',
      category: 'nuts',
      inStock: true,
      badge: 'Organic'
    },
    {
      id: '3',
      name: 'Premium Cashews',
      price: 379,
      originalPrice: 459,
      image: 'https://images.unsplash.com/photo-1626697556426-8a55a8af4999?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXNoZXclMjBudXRzJTIwYm93bHxlbnwxfHx8fDE3NTU1MDI4ODF8MA&ixlib=rb-4.1.0&q=80&w=400',
      rating: 4.9,
      reviews: 234,
      weight: '250g',
      category: 'nuts',
      inStock: true,
      badge: 'Best Seller'
    },
    {
      id: '4',
      name: 'Mixed Dried Fruits',
      price: 329,
      originalPrice: 399,
      image: 'https://images.unsplash.com/photo-1723937188995-beac88d36998?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc3NvcnRlZCUyMGRyaWVkJTIwZnJ1aXRzfGVufDF8fHx8MTc1NTUwMjg4Nnww&ixlib=rb-4.1.0&q=80&w=400',
      rating: 4.6,
      reviews: 67,
      weight: '250g',
      category: 'fruits',
      inStock: true
    },
    {
      id: '5',
      name: 'Jumbo Dates (Khajoor)',
      price: 249,
      originalPrice: 299,
      image: 'https://images.unsplash.com/photo-1707915317424-437561f0e323?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmllZCUyMGRhdGVzJTIwZnJ1aXR8ZW58MXx8fHwxNzU1NTAyODgyfDA&ixlib=rb-4.1.0&q=80&w=400',
      rating: 4.5,
      reviews: 123,
      weight: '500g',
      category: 'fruits',
      inStock: true
    },
    {
      id: '6',
      name: 'Premium Pistachios',
      price: 679,
      originalPrice: 799,
      image: 'https://images.unsplash.com/photo-1593802112792-b0f362884b21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXN0YWNoaW8lMjBudXRzJTIwc2hlbGx8ZW58MXx8fHwxNzU1NTAyODgyfDA&ixlib=rb-4.1.0&q=80&w=400',
      rating: 4.8,
      reviews: 91,
      weight: '250g',
      category: 'nuts',
      inStock: true,
      badge: 'Premium'
    },
    {
      id: '7',
      name: 'Turkish Apricots',
      price: 279,
      originalPrice: 349,
      image: 'https://images.unsplash.com/photo-1595412017587-b7f3117dff54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmllZCUyMGFwcmljb3RzfGVufDF8fHx8MTc1NTUwMjg4M3ww&ixlib=rb-4.1.0&q=80&w=400',
      rating: 4.4,
      reviews: 45,
      weight: '250g',
      category: 'fruits',
      inStock: true
    },
    {
      id: '8',
      name: 'Black Raisins',
      price: 199,
      originalPrice: 249,
      image: 'https://images.unsplash.com/photo-1698086032795-c8707f13f980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWlzaW5zJTIwZHJpZWQlMjBncmFwZXN8ZW58MXx8fHwxNzU1NDUxMTkzfDA&ixlib=rb-4.1.0&q=80&w=400',
      rating: 4.3,
      reviews: 78,
      weight: '250g',
      category: 'fruits',
      inStock: true
    },
    {
      id: '9',
      name: 'Brazil Nuts',
      price: 549,
      originalPrice: 649,
      image: 'https://images.unsplash.com/photo-1614807618553-35332e4de00d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWwlMjBudXRzfGVufDF8fHx8MTc1NTUwMjMyNXww&ixlib=rb-4.1.0&q=80&w=400',
      rating: 4.6,
      reviews: 34,
      weight: '250g',
      category: 'nuts',
      inStock: true
    },
    {
      id: '10',
      name: 'Fig (Anjeer)',
      price: 399,
      originalPrice: 479,
      image: 'https://images.unsplash.com/photo-1524593313283-1e092f06b2f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmllZCUyMGZpZ3N8ZW58MXx8fHwxNzU1NTAyODg0fDA&ixlib=rb-4.1.0&q=80&w=400',
      rating: 4.7,
      reviews: 56,
      weight: '250g',
      category: 'fruits',
      inStock: true
    },
    {
      id: '11',
      name: 'Pine Nuts (Chilgoza)',
      price: 1299,
      originalPrice: 1549,
      image: 'https://images.unsplash.com/photo-1589752881818-337a265572df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaW5lJTIwbnV0c3xlbnwxfHx8fDE3NTU1MDI4ODV8MA&ixlib=rb-4.1.0&q=80&w=400',
      rating: 4.9,
      reviews: 23,
      weight: '100g',
      category: 'nuts',
      inStock: true,
      badge: 'Rare'
    },
    {
      id: '12',
      name: 'Trail Mix Deluxe',
      price: 429,
      originalPrice: 519,
      image: 'https://images.unsplash.com/photo-1621926037410-5c727521e695?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaXhlZCUyMG51dHMlMjB0cmFpbCUyMG1peHxlbnwxfHx8fDE3NTU1MDI4ODZ8MA&ixlib=rb-4.1.0&q=80&w=400',
      rating: 4.8,
      reviews: 145,
      weight: '300g',
      category: 'mixed',
      inStock: true,
      badge: 'Popular'
    }
  ];

  let products = category ? 
    allProducts.filter(product => product.category === category) : 
    allProducts;

  if (limit) {
    products = products.slice(0, limit);
  }

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      weight: product.weight,
      category: product.category
    });
    
    showToast(`${product.name} added to cart!`, 'success');
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : i < rating
            ? 'fill-yellow-400/50 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="mb-4">{title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our premium collection of handpicked dry fruits and nuts, 
            sourced directly from the finest farms to bring you the best quality and taste.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm hover:shadow-xl">
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.badge && (
                      <Badge className="text-xs font-medium bg-primary text-primary-foreground">
                        {product.badge}
                      </Badge>
                    )}
                    {product.originalPrice > product.price && (
                      <Badge className="text-xs bg-destructive text-destructive-foreground">
                        {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                      </Badge>
                    )}
                  </div>

                  {/* Favorite button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-3 right-3 w-8 h-8 p-0 bg-white/80 backdrop-blur hover:bg-white/90"
                    onClick={() => toggleFavorite(product.id)}
                  >
                    <Heart 
                      className={`w-4 h-4 ${
                        favorites.includes(product.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-gray-600'
                      }`} 
                    />
                  </Button>

                  {/* Quick add to cart */}
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="absolute bottom-3 right-3 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </Button>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{product.weight}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {renderStars(product.rating)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">₹{product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-green-600 font-medium">
                      In Stock
                    </span>
                  </div>

                  <Button 
                    onClick={() => handleAddToCart(product)}
                    className="w-full"
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!limit && (
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Discover more premium quality dry fruits and nuts
            </p>
            <Button variant="outline" size="lg">
              Load More Products
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}