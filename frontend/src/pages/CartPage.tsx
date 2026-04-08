import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItemRow from '../components/CartItemRow';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { cartItems, cartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <ShoppingBag className="h-20 w-20 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven&apos;t added any stickers yet!</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          Browse Stickers
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="space-y-4 mb-8">
        {cartItems.map(item => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg text-gray-600">Subtotal ({cartItems.length} items)</span>
          <span className="text-2xl font-bold text-gray-900">${cartTotal.toFixed(2)}</span>
        </div>
        <Link
          to="/checkout"
          className="block w-full bg-primary-600 hover:bg-primary-700 text-white text-center py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
