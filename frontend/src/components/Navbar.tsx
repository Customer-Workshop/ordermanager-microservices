import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Sticker, LogOut, LogIn, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-primary-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl hover:text-accent-300 transition-colors">
            <Sticker className="h-8 w-8" />
            <span>StickerStore</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-accent-300 transition-colors font-medium">Home</Link>
            {isAuthenticated && (
              <>
                <Link to="/orders" className="hover:text-accent-300 transition-colors font-medium flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  Orders
                </Link>
                <Link to="/cart" className="relative hover:text-accent-300 transition-colors font-medium flex items-center gap-1">
                  <ShoppingCart className="h-5 w-5" />
                  Cart
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-3 bg-accent-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-primary-200 text-sm">Hi, {user?.username}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-primary-600 hover:bg-primary-500 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 bg-accent-500 hover:bg-accent-600 px-4 py-2 rounded-lg transition-colors font-medium"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-accent-300">Home</Link>
            {isAuthenticated && (
              <>
                <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-accent-300">Orders</Link>
                <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-accent-300">
                  Cart {itemCount > 0 && `(${itemCount})`}
                </Link>
              </>
            )}
            {isAuthenticated ? (
              <button onClick={handleLogout} className="block py-2 text-left w-full hover:text-accent-300">Logout</button>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-accent-300">Login</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
