import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password, remember);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">TransitOps Login</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded mb-4 dark:bg-gray-700" required />
          <label className="block mb-2 text-sm">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded mb-4 dark:bg-gray-700" required />
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center text-sm">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="mr-2" /> Remember me
            </label>
            <Link to="/forgot-password" className="text-sm text-primary-600">Forgot password?</Link>
          </div>
          <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700">Sign In</button>
        </form>
      </div>
    </div>
  );
}