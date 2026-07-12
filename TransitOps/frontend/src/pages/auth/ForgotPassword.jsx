import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('If account exists, reset instructions sent.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        {sent ? (
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">Check your email for reset instructions.</p>
            <Link to="/login" className="text-primary-600 hover:underline">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field mb-4"
              required
            />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div className="mt-4 text-center">
              <Link to="/login" className="text-sm text-primary-600 hover:underline">Back to Login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}