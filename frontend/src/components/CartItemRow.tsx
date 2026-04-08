import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '../types';
import { useCart } from '../context/CartContext';

interface CartItemRowProps {
  item: CartItem;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
      <img
        src={item.productImageUrl}
        alt={item.productName}
        className="w-20 h-20 object-cover rounded-lg"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{item.productName}</h3>
        <p className="text-primary-600 font-medium">${item.productPrice.toFixed(2)} each</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
          disabled={item.quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="text-right min-w-[80px]">
        <p className="font-bold text-gray-900">${item.subtotal.toFixed(2)}</p>
      </div>
      <button
        onClick={() => removeFromCart(item.id)}
        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
}
