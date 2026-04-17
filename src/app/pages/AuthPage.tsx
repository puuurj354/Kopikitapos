import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export function AuthPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Username dan password harus diisi');
      return;
    }

    setLoading(true);
    // Simulate async
    setTimeout(() => {
      const result = login(username, password);
      if (!result.success) {
        setError(result.error ?? 'Login gagal');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3E2723] via-[#5D4037] to-[#6F4E37] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#F5E6D3] rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4">
            ☕
          </div>
          <h1 className="text-2xl font-bold text-[#3E2723]">KopiKita POS</h1>
          <p className="text-[#8B5E3C] mt-1 text-sm">Masuk ke sistem kasir</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label className="text-sm text-[#8B5E3C] mb-1.5 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="barista / admin"
              className="w-full p-3 rounded-xl border-2 border-[#E8D5C0] text-[#3E2723] focus:border-[#6F4E37] outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-sm text-[#8B5E3C] mb-1.5 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="barista123 / admin123"
              className="w-full p-3 rounded-xl border-2 border-[#E8D5C0] text-[#3E2723] focus:border-[#6F4E37] outline-none transition-colors"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#6F4E37] text-white font-medium hover:bg-[#5D4037] transition-colors shadow-lg disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </motion.button>
        </form>

        <div className="mt-6 p-4 bg-[#F5E6D3] rounded-xl">
          <p className="text-xs text-[#8B5E3C] font-medium mb-2">Demo Credentials:</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-[#6F4E37]">
            <div>
              <p className="font-medium">Barista</p>
              <p>barista / barista123</p>
            </div>
            <div>
              <p className="font-medium">Admin</p>
              <p>admin / admin123</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
