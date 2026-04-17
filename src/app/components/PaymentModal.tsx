import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePOS } from '../context/POSContext';
import type { PaymentMethod } from '../types/pos';

interface PaymentModalProps {
  total: number;
  onClose: () => void;
}

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'cash', label: 'Tunai', icon: '💵' },
  { id: 'debit', label: 'Debit', icon: '💳' },
  { id: 'qris', label: 'QRIS', icon: '📱' },
];

export function PaymentModal({ total, onClose }: PaymentModalProps) {
  const { clearCart } = usePOS();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickAmounts = [
    total,
    Math.ceil(total / 10000) * 10000,
    Math.ceil(total / 50000) * 50000,
    100000,
    200000,
    500000,
  ];

  const parsedCash = parseInt(cashAmount) || 0;
  const change = paymentMethod === 'cash' ? Math.max(0, parsedCash - total) : 0;

  const handlePay = () => {
    try {
      if (paymentMethod === 'cash' && parsedCash < total) {
        setError('Jumlah uang kurang dari total pembayaran');
        return;
      }
      setError(null);
      setShowSuccess(true);
      setTimeout(() => {
        clearCart();
        onClose();
      }, 2000);
    } catch {
      setError('Terjadi kesalahan saat memproses pembayaran');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {showSuccess ? (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-4"
            >
              ✅
            </motion.div>
            <h3 className="text-xl font-bold text-[#3E2723]">Pembayaran Berhasil!</h3>
            <p className="text-[#8B5E3C] mt-2">Transaksi telah tercatat</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#3E2723]">Pembayaran</h3>
              <button onClick={onClose} className="text-[#A0826D] hover:text-[#6F4E37] text-2xl">×</button>
            </div>

            <div className="bg-[#F5E6D3] rounded-2xl p-4 mb-6 text-center">
              <p className="text-sm text-[#8B5E3C]">Total Pembayaran</p>
              <p className="text-3xl font-bold text-[#3E2723] mt-1">Rp {total.toLocaleString()}</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 mb-6">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => { setPaymentMethod(method.id); setError(null); }}
                  className={`p-3 rounded-xl border-2 text-center transition-colors ${
                    paymentMethod === method.id
                      ? 'border-[#6F4E37] bg-[#F5E6D3]'
                      : 'border-[#E8D5C0] hover:border-[#D4A574]'
                  }`}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <p className="text-xs mt-1 font-medium text-[#3E2723]">{method.label}</p>
                </button>
              ))}
            </div>

            {paymentMethod === 'cash' && (
              <div className="mb-6">
                <label className="text-sm text-[#8B5E3C] mb-2 block">Jumlah Uang</label>
                <input
                  type="text"
                  value={cashAmount}
                  onChange={(e) => {
                    setCashAmount(e.target.value.replace(/[^0-9]/g, ''));
                    setError(null);
                  }}
                  placeholder="Masukkan jumlah..."
                  className="w-full p-3 rounded-xl border-2 border-[#E8D5C0] text-[#3E2723] font-medium focus:border-[#6F4E37] outline-none transition-colors"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {quickAmounts.map((amount, i) => (
                    <button
                      key={i}
                      onClick={() => setCashAmount(amount.toString())}
                      className="px-3 py-1.5 bg-[#F5E6D3] text-[#6F4E37] text-xs rounded-lg hover:bg-[#E8D5C0] transition-colors font-medium"
                    >
                      {amount >= 1000000 ? `${(amount / 1000000).toFixed(0)}jt` : `${amount / 1000}k`}
                    </button>
                  ))}
                </div>
                {parsedCash >= total && (
                  <div className="mt-3 p-3 bg-green-50 rounded-xl">
                    <p className="text-sm text-green-700">
                      Kembalian: <span className="font-bold">Rp {change.toLocaleString()}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePay}
              disabled={paymentMethod === 'cash' && parsedCash < total}
              className="w-full py-4 rounded-xl bg-[#6F4E37] text-white font-bold text-lg hover:bg-[#5D4037] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paymentMethod === 'cash' ? `Bayar Rp ${total.toLocaleString()}` : 'Proses Pembayaran'}
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
