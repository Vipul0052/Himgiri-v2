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

  // Check for OAuth callback parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const loginSuccess = urlParams.get('login');
    const provider = urlParams.get('provider');
    
    if (loginSuccess === 'success' && provider === 'google') {
      // Google OAuth was successful, trigger auth check
      console.log('Google OAuth successful, checking authentication...');
      
      // Dispatch custom event to trigger auth check
      window.dispatchEvent(new CustomEvent('checkGoogleAuth'));
      
      // Clean up URL parameters
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
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