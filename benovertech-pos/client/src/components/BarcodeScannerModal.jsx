/**
 * Barcode Scanner Modal
 * Displays barcode scanner in a modal overlay
 */
import { X } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';

export default function BarcodeScannerModal({ isOpen, onClose, onProductSelected, products }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Modal */}
      <div className="bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-bold text-black">Scan Product Barcode</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <BarcodeScanner
            onBarcodeDetected={onProductSelected}
            products={products}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}
