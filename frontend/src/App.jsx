import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import SupportPage from './pages/SupportPage';
import AdminSupportPage from './pages/AdminSupportPage';
import AboutPage from './pages/AboutPage';
import FavoritesPage from './pages/FavoritesPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import MyOrdersPage from './pages/MyOrdersPage';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <div className="app">
                <Header />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/orders/success" element={<OrderSuccessPage />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/admin/support" element={<AdminSupportPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/admin/orders" element={<AdminOrdersPage />} />
                    <Route path="/orders/my" element={<MyOrdersPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;