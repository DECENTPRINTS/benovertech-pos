/**
 * Receipt Component
 * Premium Apple-style receipt for displaying transaction details
 */
import { Printer, Download, X, MessageCircle } from 'lucide-react';
import Button from './Button';

export default function Receipt({ sale, business, onPrint, onClose }) {
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(generatePrintHTML());
    printWindow.document.close();
    printWindow.print();
    if (onPrint) onPrint();
  };

  const handleDownloadPDF = async () => {
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');

      const element = document.getElementById('receipt-content');
      
      // Capture with high quality
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 10000,
      });

      // Create PDF with exact dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgData = canvas.toDataURL('image/png');
      
      // Add image to fill the page
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // If content is longer than one page, add more pages
      let heightLeft = imgHeight - 297; // A4 height in mm
      let position = 0;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      pdf.save(`receipt-${sale.id || 'draft'}.pdf`);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handleWhatsAppShare = () => {
    try {
      const items = sale.items?.map(item => 
        `${item.name} (${item.quantity}x ₦${item.price.toLocaleString()})`
      ).join('\n') || '';
      
      const subtotal = sale.items?.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      ) || 0;

      const message = `*${business?.name || 'BENOVERTECH'} Receipt*\n\n` +
        `*Customer:* ${sale.customerName || 'Walk-in Customer'}\n` +
        `*Phone:* ${sale.customerPhone || 'N/A'}\n` +
        `*Payment:* ${sale.paymentMethod?.toUpperCase() || 'CASH'}\n\n` +
        `*Items:*\n${items}\n\n` +
        `*Total: ₦${subtotal.toLocaleString()}*\n\n` +
        `Thank you for your purchase!\n` +
        `Receipt #${sale.id || 'DRAFT'}`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');
    } catch (err) {
      console.error('Error sharing to WhatsApp:', err);
      alert('Failed to share to WhatsApp');
    }
  };

  const generatePrintHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f5f5f5; }
            .receipt { max-width: 400px; margin: 20px auto; background: white; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; }
            .business-name { font-size: 24px; font-weight: 700; color: #000; }
            .business-info { font-size: 12px; color: #6b7280; margin-top: 8px; }
            .receipt-number { font-size: 11px; color: #9ca3af; margin-top: 12px; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
            .customer-info { font-size: 13px; color: #374151; }
            .customer-info p { margin: 4px 0; }
            .customer-label { font-size: 11px; color: #9ca3af; margin-bottom: 2px; }
            table { width: 100%; }
            th { text-align: left; font-size: 11px; color: #6b7280; font-weight: 600; padding: 12px 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; }
            td { padding: 10px 0; font-size: 13px; }
            .product-name { color: #000; font-weight: 500; }
            .product-qty { color: #6b7280; }
            .product-price { color: #000; text-align: right; }
            .totals { margin-top: 20px; border-top: 2px solid #e5e7eb; padding-top: 16px; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; }
            .total-label { color: #6b7280; }
            .total-value { color: #000; font-weight: 500; }
            .total-paid { display: flex; justify-content: space-between; align-items: baseline; margin-top: 16px; padding-top: 12px; border-top: 1px solid #e5e7eb; }
            .total-paid-label { font-size: 12px; color: #6b7280; }
            .total-paid-value { font-size: 28px; font-weight: 700; color: #000; }
            .payment-method { text-align: center; font-size: 12px; color: #6b7280; margin-top: 16px; padding-top: 12px; border-top: 1px solid #e5e7eb; }
            .footer { text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
            .warranty { font-size: 10px; color: #6b7280; line-height: 1.6; }
            .thank-you { font-size: 13px; font-weight: 600; color: #000; margin-bottom: 12px; }
            .timestamp { font-size: 11px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="receipt">
            ${getReceiptContent()}
          </div>
        </body>
      </html>
    `;
  };

  const getReceiptContent = () => {
    const subtotal = sale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const items = sale.items || [];

    return `
      <div class="header">
        <div class="business-name">${business?.name || 'BENOVERTECH'}</div>
        <div class="business-info">
          ${business?.address || ''}<br>
          ${business?.phone || ''}
        </div>
        <div class="receipt-number">Receipt #${sale.id || 'DRAFT'}</div>
      </div>

      <div class="section">
        <div class="section-title">Customer</div>
        <div class="customer-info">
          <p>${sale.customerName || 'Walk-in Customer'}</p>
          ${sale.customerPhone ? `<p>${sale.customerPhone}</p>` : ''}
          <div class="customer-label" style="margin-top: 8px;">Payment Method</div>
          <p>${sale.paymentMethod?.toUpperCase() || 'CASH'}</p>
        </div>
      </div>

      <div class="section">
        <table>
          <thead>
            <tr>
              <th style="width: 50%;">Item</th>
              <th style="width: 20%;" class="product-qty">Qty</th>
              <th style="width: 30%; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td class="product-name">${item.name}</td>
                <td class="product-qty">${item.quantity}</td>
                <td class="product-price">₦${(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="totals">
        <div class="total-row">
          <span class="total-label">Subtotal</span>
          <span class="total-value">₦${subtotal.toLocaleString()}</span>
        </div>
        <div class="total-paid">
          <span class="total-paid-label">Total Paid</span>
          <span class="total-paid-value">₦${subtotal.toLocaleString()}</span>
        </div>
      </div>

      <div class="payment-method">
        Paid via ${sale.paymentMethod?.toUpperCase() || 'CASH'}
      </div>

      <div class="footer">
        <div class="thank-you">Thank You!</div>
        <div class="warranty">
          All items covered under 30-day warranty. 
          For support, visit our office or call the number above.
        </div>
        <div class="timestamp" style="margin-top: 16px;">
          ${new Date().toLocaleString()}
        </div>
      </div>
    `;
  };

  const subtotal = sale.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  return (
    <div className="space-y-4">
      {/* Receipt Display */}
      <div
        id="receipt-content"
        className="mx-auto bg-white rounded-2xl shadow-lg p-8 max-w-md print:shadow-none print:rounded-none print:p-4"
      >
        {/* Header */}
        <div className="text-center border-b border-gray-200 pb-6 mb-6">
          <h1 className="text-2xl font-bold text-black">
            {business?.name || 'BENOVERTECH'}
          </h1>
          <p className="text-xs text-gray-600 mt-2">
            {business?.address || 'Lagos, Nigeria'}
            <br />
            {business?.phone || 'Call: 0800-000-0000'}
          </p>
          <p className="text-xs text-gray-500 mt-3">Receipt #{sale.id || 'DRAFT'}</p>
        </div>

        {/* Customer Info */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
            Customer
          </p>
          <p className="text-sm text-black font-medium">
            {sale.customerName || 'Walk-in Customer'}
          </p>
          {sale.customerPhone && (
            <p className="text-xs text-gray-600">{sale.customerPhone}</p>
          )}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
              Payment Method
            </p>
            <p className="text-sm text-black font-medium capitalize">
              {sale.paymentMethod || 'Cash'}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6 border-y border-gray-200 py-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 pb-2 mb-3">
                <th className="text-left text-gray-600 font-semibold pb-2">Item</th>
                <th className="text-center text-gray-600 font-semibold pb-2">Qty</th>
                <th className="text-right text-gray-600 font-semibold pb-2">Price</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {sale.items?.map((item, idx) => (
                <tr key={idx} className="text-xs">
                  <td className="text-black font-medium">{item.name}</td>
                  <td className="text-center text-gray-600">{item.quantity}</td>
                  <td className="text-right text-black font-medium">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Subtotal</span>
            <span className="text-sm text-gray-600">₦{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-baseline pt-3 border-t-2 border-gray-200">
            <span className="text-xs text-gray-600 font-semibold">TOTAL PAID</span>
            <span className="text-2xl font-bold text-black">
              ₦{subtotal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2 pt-4 border-t border-gray-200">
          <p className="text-sm font-semibold text-black">Thank You!</p>
          <p className="text-xs text-gray-600 leading-relaxed">
            All items covered under 30-day warranty. For support, visit our office
            or call the number above.
          </p>
          <p className="text-xs text-gray-500 pt-2">
            {new Date().toLocaleString()}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      {onPrint && (
        <div className="flex gap-2 justify-center print:hidden flex-wrap">
          <Button
            variant="accent"
            size="md"
            onClick={handlePrint}
            className="flex items-center"
          >
            <Printer size={16} className="mr-2" /> Print
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={handleDownloadPDF}
            className="flex items-center"
          >
            <Download size={16} className="mr-2" /> PDF
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={handleWhatsAppShare}
            className="flex items-center"
          >
            <MessageCircle size={16} className="mr-2" /> WhatsApp
          </Button>
          {onClose && (
            <Button variant="ghost" size="md" onClick={onClose}>
              <X size={16} />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
