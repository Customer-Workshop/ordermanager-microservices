import { Sticker } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <Sticker className="h-6 w-6 text-primary-400" />
            <span className="font-bold text-white">StickerStore</span>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} StickerStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
