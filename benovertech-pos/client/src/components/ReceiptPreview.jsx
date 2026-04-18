/**
 * Receipt Preview Modal
 * Displays receipt after successful sale with print/download options
 */
import { X } from 'lucide-react';
import Receipt from './Receipt';

export default function ReceiptPreview({ sale, business, isOpen, onClose }) {
  if (!isOpen || !sale) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Modal */}
      <div className="bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-bold text-black">Receipt Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <Receipt
            sale={sale}
            business={business}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}
