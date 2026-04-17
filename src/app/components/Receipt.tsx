import React, { forwardRef } from 'react';

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

export interface ReceiptProps {
  orderId: string;
  date: Date;
  customerName: string;
  tableNumber: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
  (
    {
      orderId,
      date,
      customerName,
      tableNumber,
      items,
      subtotal,
      tax,
      total,
      paymentMethod,
    },
    ref
  ) => {
    const formatDate = (date: Date) => {
      return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const formatCurrency = (amount: number) => {
      return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    return (
      <div
        ref={ref}
        className="bg-white text-black p-4 font-mono text-sm w-[300px] mx-auto print:w-full print:p-0"
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="font-bold text-xl mb-1">KOPIKITA</h2>
          <p className="text-xs text-gray-600">Jl. Kopi Kita No. 1, Jakarta</p>
          <p className="text-xs text-gray-600">Telp: 0812-3456-7890</p>
        </div>

        <div className="border-t border-dashed border-gray-400 my-2"></div>

        {/* Order Info */}
        <div className="mb-2 text-xs">
          <div className="flex justify-between">
            <span>Tgl:</span>
            <span>{formatDate(date)}</span>
          </div>
          <div className="flex justify-between">
            <span>Order ID:</span>
            <span>#{orderId.split('-')[0].toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span>Pelanggan:</span>
            <span>{customerName || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span>Meja:</span>
            <span>{tableNumber || '-'}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-400 my-2"></div>

        {/* Items */}
        <div className="mb-2">
          {items.map((item, index) => (
            <div key={index} className="mb-2 text-xs">
              <div className="font-medium">{item.name}</div>
              <div className="flex justify-between text-gray-600">
                <span>
                  {item.quantity} x {formatCurrency(item.price)}
                </span>
                <span>{formatCurrency(item.quantity * item.price)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-gray-400 my-2"></div>

        {/* Totals */}
        <div className="mb-4 text-xs">
          <div className="flex justify-between mb-1">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Pajak (10%):</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="border-t border-dashed border-gray-400 my-1"></div>
          <div className="flex justify-between font-bold text-sm">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Payment */}
        <div className="mb-6 text-xs text-center">
          <p>
            Pembayaran: <span className="uppercase font-medium">{paymentMethod}</span>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs">
          <p className="font-bold">Terima Kasih</p>
          <p className="text-gray-600">Silakan datang kembali</p>
        </div>
      </div>
    );
  }
);

Receipt.displayName = 'Receipt';
