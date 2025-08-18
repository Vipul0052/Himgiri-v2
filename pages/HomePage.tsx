import { HeroSection } from '../components/HeroSection';
import { ProductsGrid } from '../components/ProductsGrid';
import { ShopByCategory } from '../components/ShopByCategory';
import { HealthBenefits } from '../components/HealthBenefits';
import { Testimonials } from '../components/Testimonials';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen">
      <HeroSection onNavigate={onNavigate} />
      <ProductsGrid onNavigate={onNavigate} />
      <ShopByCategory onNavigate={onNavigate} />
      <HealthBenefits />
      <Testimonials />
    </div>
  );
}