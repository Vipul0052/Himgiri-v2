import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { ShoppingCart, Star, Search, Grid, List } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const allProducts = [
  {
    id: 1,
    name: "Premium Kashmiri Almonds",
    image: "https://images.unsplash.com/photo-1653046058018-626c37d645db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbG1vbmRzJTIwbnV0c3xlbnwxfHx8fDE3NTU0NTExOTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    healthBenefit: "Rich in Vitamin E & Antioxidants",
    price: 799,
    originalPrice: 999,
    rating: 4.8,
    category: "nuts",
    badge: "Best Seller"
  },
  {
    id: 2,
    name: "Himalayan Cashews",
    image: "https://images.unsplash.com/photo-1610073474647-7b0b80a2f31f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXNoZXdzJTIwbnV0c3xlbnwxfHx8fDE3NTU0NTExOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    healthBenefit: "Heart Healthy & Protein Rich",
    price: 899,
    originalPrice: 1199,
    rating: 4.7,
    category: "nuts",
    badge: "Premium"
  },
  {
    id: 3,
    name: "Afghan Pistachios",
    image: "https://images.unsplash.com/photo-1598110996285-54523b72be93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXN0YWNoaW9zJTIwbnV0c3xlbnwxfHx8fDE3NTU0NTExOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    healthBenefit: "High Protein & Fiber",
    price: 1299,
    originalPrice: 1599,
    rating: 4.9,
    category: "nuts",
    badge: "New"
  },
  {
    id: 4,
    name: "Himalayan Walnuts",
    image: "https://images.unsplash.com/photo-1605525483148-8fb743b620da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YWxudXRzJTIwbnV0c3xlbnwxfHx8fDE3NTU0NTExOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    healthBenefit: "Brain Health & Omega-3",
    price: 849,
    originalPrice: 1099,
    rating: 4.6,
    category: "nuts",
    badge: "Organic"
  },
  {
    id: 5,
    name: "Golden Raisins",
    image: "https://images.unsplash.com/photo-1698086032795-c8707f13f980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWlzaW5zJTIwZHJpZWQlMjBncmFwZXN8ZW58MXx8fHwxNzU1NDUxMTkzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    healthBenefit: "Natural Energy & Iron Rich",
    price: 549,
    originalPrice: 699,
    rating: 4.5,
    category: "berries",
    badge: "Value Pack"
  },
  {
    id: 6,
    name: "Himalayan Mixed Nuts",
    image: "https://images.unsplash.com/photo-1733337336596-c8e9c0dfa944?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc3NvcnRlZCUyMG51dHMlMjBkcmllZCUyMGZydWl0c3xlbnwxfHx8fDE3NTU0NTExOTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    healthBenefit: "Complete Nutrition Package",
    price: 1149,
    originalPrice: 1399,
    rating: 4.8,
    category: "combos",
    badge: "Popular"
  },
  {
    id: 7,
    name: "Organic Sunflower Seeds",
    image: "https://images.unsplash.com/photo-1634582872934-be411573f235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWVkcyUyMHN1bmZsb3dlciUyMHB1bXBraW58ZW58MXx8fHwxNzU1NDUxOTAwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    healthBenefit: "High in Healthy Fats",
    price: 399,
    originalPrice: 499,
    rating: 4.4,
    category: "seeds",
    badge: "Organic"
  },
  {
    id: 8,
    name: "Dried Cranberries",
    image: "https://images.unsplash.com/photo-1569654972109-6648a47920ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmllZCUyMGJlcnJpZXMlMjBmcnVpdHN8ZW58MXx8fHwxNzU1NDUxODk3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    healthBenefit: "Antioxidant Rich",
    price: 649,
    originalPrice: 799,
    rating: 4.6,
    category: "berries",
    badge: "Premium"
  }
];

export function ShopPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { addItem } = useCart();

  // Filter and sort products
  const filteredProducts = allProducts
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.healthBenefit.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleAddToCart = (product: typeof allProducts[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Shop Premium Dry Fruits</h1>
          <p className="text-muted-foreground">
            Discover our complete collection of premium Himalayan nuts, dried fruits, and healthy snacks.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="nuts">Nuts</SelectItem>
                <SelectItem value="seeds">Seeds</SelectItem>
                <SelectItem value="berries">Berries</SelectItem>
                <SelectItem value="combos">Combos</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredProducts.length} of {allProducts.length} products
          </div>
        </div>

        {/* Products Grid/List */}
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
        }`}>
          {filteredProducts.map((product) => (
            <Card key={product.id} className={`group hover:shadow-lg transition-shadow duration-300 ${
              viewMode === 'list' ? 'flex flex-row' : ''
            }`}>
              <CardContent className={`p-0 ${viewMode === 'list' ? 'flex flex-row flex-1' : ''}`}>
                <div className={`relative overflow-hidden rounded-t-lg ${
                  viewMode === 'list' ? 'w-32 h-32 rounded-l-lg rounded-t-none flex-shrink-0' : 'aspect-square'
                }`}>
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                    {product.badge}
                  </Badge>
                </div>
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                  <div>
                    <h3 className="font-semibold mb-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {product.healthBenefit}
                    </p>
                    <div className="flex items-center space-x-1 mb-3">
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      <span className="text-sm font-medium">{product.rating}</span>
                      <span className="text-sm text-muted-foreground">(125 reviews)</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-lg font-bold text-accent">
                        ₹{product.price}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{product.originalPrice}
                      </span>
                      <span className="text-sm text-green-600">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                      </span>
                    </div>
                  </div>
                  {viewMode === 'list' && (
                    <Button 
                      className="w-full mt-3" 
                      variant="outline"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  )}
                </div>
              </CardContent>
              {viewMode === 'grid' && (
                <CardFooter className="p-4 pt-0">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              No products found matching your criteria.
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}