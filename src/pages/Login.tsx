import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Lock } from 'lucide-react';

const Login = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const login = useStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(pin)) {
      navigate('/');
    } else {
      setError('PIN Salah. Coba 1234 (Admin) atau 0000 (Kasir)');
      setPin('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 p-4 rounded-full">
            <Lock className="text-primary w-8 h-8" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Login POS</h2>
        <p className="text-center text-gray-500 mb-8">Masukkan PIN untuk akses kasir</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full text-center text-3xl tracking-widest py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
              placeholder="••••"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
          >
            Masuk
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          Hint: 1234 (Admin) | 0000 (Kasir)
        </div>
      </div>
    </div>
  );
};

export default Login;
