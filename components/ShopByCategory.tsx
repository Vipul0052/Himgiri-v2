import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowRight } from 'lucide-react';

interface Category { id: number; name: string; description?: string; image?: string; sort?: number }

const defaultCategories: Category[] = [
  { id: 1, name: 'Premium Nuts', description: 'Almonds, Cashews, Walnuts & More', image: 'https://images.unsplash.com/photo-1653046058018-626c37d645db?w=1080', sort: 10 },
  { id: 2, name: 'Healthy Seeds', description: 'Sunflower, Pumpkin, Chia Seeds', image: 'https://images.unsplash.com/photo-1634582872934-be411573f235?w=1080', sort: 20 },
  { id: 3, name: 'Dried Berries', description: 'Cranberries, Blueberries, Goji Berries', image: 'https://images.unsplash.com/photo-1569654972109-6648a47920ce?w=1080', sort: 30 },
  { id: 4, name: 'Special Combos', description: 'Curated Mix Packs & Gift Sets', image: 'https://images.unsplash.com/photo-1733337336596-c8e9c0dfa944?w=1080', sort: 40 },
]

interface ShopByCategoryProps {
  onNavigate: (page: string) => void;
}

export function ShopByCategory({ onNavigate }: ShopByCategoryProps) {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const r = await fetch('/api/app?action=categories.list')
        const j = r.ok ? await r.json() : { categories: [] }
        if (!cancelled) setCategories(j.categories || [])
      } catch {
        if (!cancelled) setCategories([])
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const goShop = () => { try { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }) } catch { window.scrollTo(0, 0) }; onNavigate('shop') }

  const categoriesToRender = categories.length ? categories : defaultCategories

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse our carefully curated categories to find exactly what you're looking for
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoriesToRender.map((category) => (
            <Card 
              key={category.id} 
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden border-0"
              onClick={goShop}
            >
              <CardContent className="p-0">
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={category.image || ''}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.description}
                  </p>
                  <Button variant="ghost" className="group-hover:bg-accent group-hover:text-accent-foreground" onClick={goShop}>
                    Explore
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Categories Banner */}
        <div className="mt-12 bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Special Himalayan Collection</h3>
          <p className="text-muted-foreground mb-6 max-w-3xl mx-auto">
            Experience the authentic taste of the Himalayas with our exclusive collection of 
            premium dry fruits and nuts, sourced directly from the mountain regions.
          </p>
          <Button 
            size="lg" 
            className="bg-accent hover:bg-accent/90"
            onClick={goShop}
          >
            Shop Himalayan Collection
          </Button>
        </div>
      </div>
    </section>
  );
}