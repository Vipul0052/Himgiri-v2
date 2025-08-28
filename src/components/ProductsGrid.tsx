import { useEffect, useMemo, useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../components/Toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

interface Product {
  id: string;
  name: string;
  price: number | null;
  originalPrice?: number | null;
  image: string | null;
  rating?: number;
  reviews?: number;
  weight?: string;
  category: string | null;
  inStock: boolean;
  badges?: string[];
  stock?: number; // Added stock property
}

interface ProductsGridProps {
  title?: string;
  limit?: number;
  category?: string;
}

function deriveFromDescription(desc?: string) {
  const result: Partial<Product> & { badges?: string[] } = {}
  if (!desc) return result
  const badges: string[] = []
  const tagWords = ['Premium','Organic','Best Seller','Popular','Rare']
  for (const w of tagWords) if (desc.includes(w) && !badges.includes(w)) badges.push(w)
  const offMatch = desc.match(/(\d+)%\s*OFF/i)
  if (offMatch) badges.push(`${offMatch[1]}% OFF`)
  const ratingMatch = desc.match(/(\d+(?:\.\d+)?)\s*\((\d+)\)/)
  if (ratingMatch) {
    result.rating = parseFloat(ratingMatch[1])
    result.reviews = parseInt(ratingMatch[2], 10)
  }
  const weightMatch = desc.match(/(\d+\s*(?:g|kg|ml|L))/i)
  if (weightMatch) result.weight = weightMatch[1]
  const priceArrows = desc.match(/₹\s*(\d+[\d\.]*)\s*→\s*₹\s*(\d+[\d\.]*)/)
  if (priceArrows) {
    const orig = parseFloat(priceArrows[1])
    const now = parseFloat(priceArrows[2])
    if (!Number.isNaN(orig)) result.originalPrice = orig
    if (!Number.isNaN(now)) result.price = now
  }
  result.badges = badges.length ? badges : undefined
  return result
}

export function ProductsGrid({ title = "Our Products", limit, category }: ProductsGridProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://images.unsplash.com';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link) }
  }, [])

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const r = await fetch('/api/app?action=products.list', { headers: { 'cache-control': 'no-cache' } });
        const j = r.ok ? await r.json() : { products: [] };
        if (!cancelled) setItems(j.products || []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true };
  }, []);

  const products: Product[] = useMemo(() => {
    let arr = (items || []).map((p: any) => {
      const derived = deriveFromDescription(p.description)
      const price = (typeof p.price === 'number' ? p.price : undefined) ?? derived.price ?? null
      const originalPrice = derived.originalPrice ?? null
      const rating = derived.rating
      const reviews = derived.reviews
      const weight = derived.weight
      const badges = (Array.isArray(p.badges) ? p.badges : undefined) ?? derived.badges
      return {
        id: String(p.id),
        name: p.name,
        price,
        originalPrice,
        image: p.image,
        rating,
        reviews,
        weight,
        category: p.category,
        inStock: Boolean(p.in_stock), // Convert in_stock to inStock
        badges,
        stock: p.stock, // Add stock property
      }
    })
    if (category) arr = arr.filter(p => p.category === category)
    if (limit) arr = arr.slice(0, limit)
    return arr;
  }, [items, category, limit]);

  const handleAddToCart = (product: Product) => {
    if (!product.price) {
      showToast('Product not available', 'error');
      return;
    }
    if (!product.inStock) {
      showToast('Product is out of stock', 'error');
      return;
    }
    addItem({ id: product.id, name: product.name, price: product.price, originalPrice: product.originalPrice || product.price, image: product.image || '', weight: product.weight || '', category: product.category || '' });
    showToast(`${product.name} added to cart!`, 'success');
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const renderStars = (rating?: number) => {
    const r = rating ?? 0;
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < Math.floor(r) ? 'fill-yellow-400 text-yellow-400' : i < r ? 'fill-yellow-400/50 text-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="mb-4">{title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Discover our premium collection of handpicked dry fruits and nuts, sourced directly from the finest farms to bring you the best quality and taste.</p>
        </div>

        {loading && (
          <div className="text-center text-sm text-muted-foreground mb-4">Loading products…</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm hover:shadow-xl">
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <ImageWithFallback src={product.image || ''} alt={product.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" referrerPolicy="no-referrer" />

                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.badges?.map((b, idx) => (
                      <Badge key={idx} className={`text-xs font-medium ${b.includes('% OFF') ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'}`}>{b}</Badge>
                    ))}
                  </div>

                  <Button variant="ghost" size="sm" className="absolute top-3 right-3 w-8 h-8 p-0 bg-white/80 backdrop-blur hover:bg-white/90" onClick={() => toggleFavorite(product.id)}>
                    <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </Button>

                  <Button onClick={() => handleAddToCart(product)} className="absolute bottom-3 right-3 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" size="sm">
                    <ShoppingCart className="w-4 h-4" />
                  </Button>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>
                    {product.weight && <p className="text-xs text-muted-foreground">{product.weight}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">{renderStars(product.rating)}</div>
                    {product.rating != null && product.reviews != null && (
                      <span className="text-xs text-muted-foreground">{product.rating} ({product.reviews})</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {product.price != null && <span className="font-bold text-primary">₹{product.price}</span>}
                      {product.originalPrice && product.price && product.originalPrice > product.price && (
                        <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      {product.inStock && typeof product.stock === 'number' && product.stock < 10 && product.stock > 0 && (
                        <span className="text-xs text-orange-600 font-medium">Only {product.stock} left!</span>
                      )}
                    </div>
                  </div>

                  <Button onClick={() => handleAddToCart(product)} className="w-full" size="sm" disabled={product.price == null || !product.inStock}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {product.price == null ? 'Unavailable' : !product.inStock ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!limit && (
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Discover more premium quality dry fruits and nuts</p>
            <Button variant="outline" size="lg">Load More Products</Button>
          </div>
        )}
      </div>
    </section>
  );
}