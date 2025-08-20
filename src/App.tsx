import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CartOverlay } from '../components/CartOverlay';
import { HomePage } from '../pages/HomePage';
import { ShopPage } from '../pages/ShopPage';
import { AboutPage } from '../pages/AboutPage';
import { LoginPage } from '../pages/LoginPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { OrdersPage } from '../pages/OrdersPage';
import { BulkOrdersPage } from '../pages/BulkOrdersPage';
import { FAQPage } from '../pages/FAQPage';
import { ShippingInfoPage } from '../pages/ShippingInfoPage';
import { ReturnsRefundsPage } from '../pages/ReturnsRefundsPage';
import { PrivacyPolicyPage } from '../pages/PrivacyPolicyPage';
import { TermsOfServicePage } from '../pages/TermsOfServicePage';
import { UserDashboardPage } from '../pages/UserDashboardPage';
import { WishlistPage } from '../pages/WishlistPage';
import { ThemeProvider } from '../contexts/ThemeContext';
import { CartProvider } from '../contexts/CartContext';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../components/Toast';
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');

  // Check URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    if (pageParam && ['home', 'shop', 'about', 'login', 'cart', 'checkout', 'orders', 'bulk-orders', 'faq', 'shipping-info', 'returns-refunds', 'privacy-policy', 'terms-of-service', 'dashboard', 'wishlist'].includes(pageParam)) {
      setCurrentPage(pageParam);
    }
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    // Update URL without page parameter to avoid conflicts
    const url = new URL(window.location.href);
    url.searchParams.delete('page');
    url.searchParams.delete('tab');
    window.history.replaceState({}, '', url.toString());
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'shop':
        return <ShopPage />;
      case 'about':
        return <AboutPage />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'cart':
        return <CartPage onNavigate={handleNavigate} />;
      case 'checkout':
        return <CheckoutPage onNavigate={handleNavigate} />;
      case 'orders':
        return <OrdersPage onNavigate={handleNavigate} />;
      case 'bulk-orders':
        return <BulkOrdersPage />;
      case 'faq':
        return <FAQPage />;
      case 'shipping-info':
        return <ShippingInfoPage />;
      case 'returns-refunds':
        return <ReturnsRefundsPage />;
      case 'privacy-policy':
        return <PrivacyPolicyPage />;
      case 'terms-of-service':
        return <TermsOfServicePage />;
      case 'dashboard':
        return <UserDashboardPage onNavigate={handleNavigate} />;
      case 'wishlist':
        return <WishlistPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <div className="min-h-screen flex flex-col">
              <Header currentPage={currentPage} onNavigate={handleNavigate} />
              <main className="flex-1">
                {renderPage()}
              </main>
              <Footer onNavigate={handleNavigate} />
              <CartOverlay onNavigate={handleNavigate} />
            </div>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
      <Analytics />
    </ThemeProvider>
  );
}