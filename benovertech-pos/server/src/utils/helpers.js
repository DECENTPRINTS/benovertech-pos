import { v4 as uuidv4 } from 'uuid';

export const generateSaleNo = () => {
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-6);
  return `SALE-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${timestamp}`;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
};

export const calculateTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const discount = items.reduce((sum, item) => sum + item.discount, 0);
  const total = subtotal - discount;
  
  return { subtotal, discount, total };
};
