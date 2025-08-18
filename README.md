# Himgiri Naturals - Premium Dry Fruits E-commerce

A modern, responsive e-commerce website for premium dry fruits and nuts built with React, TypeScript, and Tailwind CSS.

## Features

- 🛒 **Complete E-commerce Functionality**: Shopping cart, checkout, payment integration
- 🔐 **Authentication**: Email/password and Google OAuth login
- 📱 **Responsive Design**: Mobile-first, fully responsive across all devices
- 🌙 **Dark/Light Mode**: Theme toggle with persistent user preference
- 💳 **Payment Options**: Razorpay, UPI, and Cash on Delivery
- 📦 **Order Management**: View order history and track orders
- 🎨 **Modern UI**: Clean, accessible design with smooth animations
- 🔍 **Product Search & Filter**: Advanced filtering and sorting options
- 📊 **Real-time Cart Updates**: Live cart count and notifications
- 🚀 **Fast Performance**: Optimized build with code splitting

## Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS v4, Radix UI components
- **Build Tool**: Vite
- **Icons**: Lucide React
- **State Management**: React Context API
- **Notifications**: Custom toast system
- **Authentication**: Mock implementation with localStorage (ready for real backend)
- **Deployment**: Vercel-ready

## Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd himgiri-naturals
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your API keys and configuration.

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
himgiri-naturals/
├── public/                 # Static assets
│   ├── favicon.svg
│   └── og-image.jpg
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Shadcn/ui components
│   │   ├── figma/         # Figma-specific components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductsGrid.tsx
│   │   └── ...
│   ├── contexts/          # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   └── ThemeContext.tsx
│   ├── pages/             # Page components
│   │   ├── HomePage.tsx
│   │   ├── ShopPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   └── ...
│   ├── styles/            # Global styles
│   │   └── globals.css
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Features Overview

### 🛒 Shopping Cart
- Add/remove products
- Update quantities
- Real-time price calculations
- Persistent storage
- Mobile-friendly overlay

### 🔐 Authentication
- Email/password signup and login
- Google OAuth integration (ready for implementation)
- Protected routes
- Order history for logged-in users

### 💳 Payment Integration
- Razorpay payment gateway
- UPI payment options
- Cash on Delivery
- Order confirmation system

### 📱 Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interactions
- Floating cart icon on mobile

### 🌙 Theme System
- Light and dark modes
- Persistent user preference
- Smooth theme transitions
- Earthy color palette

## Environment Variables

Required environment variables for full functionality:

```env
# Payment Gateway
VITE_RAZORPAY_KEY_ID=your_razorpay_key
VITE_RAZORPAY_SECRET=your_razorpay_secret

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# App Configuration
VITE_APP_URL=your_app_url
VITE_CONTACT_EMAIL=support@himgirinaturals.com
VITE_CONTACT_PHONE=+91 98765 43210
```

## Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

## Customization

### Adding New Products

Edit `src/components/ProductsGrid.tsx` and update the `allProducts` array:

```tsx
{
  id: 'unique-id',
  name: 'Product Name',
  price: 299,
  originalPrice: 399,
  image: 'https://image-url.jpg',
  rating: 4.5,
  reviews: 123,
  weight: '250g',
  category: 'nuts', // 'nuts', 'fruits', 'mixed'
  inStock: true,
  badge: 'Premium' // optional
}
```

### Theming

Customize colors in `src/styles/globals.css`:

```css
:root {
  --primary: #8b4513;    /* Brand color */
  --accent: #d4af37;     /* Gold accent */
  --background: #faf8f5; /* Light background */
  /* ... */
}
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Email: enquiry@himgirinaturals.com

## Roadmap

- [ ] Real backend integration with Supabase
- [ ] Advanced search and filtering
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Multi-language support
- [ ] Analytics integration
- [ ] SEO optimization
- [ ] PWA features
