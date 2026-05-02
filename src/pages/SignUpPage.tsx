import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      
      login(data.user);
      navigate('/setup');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-bg-base flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full card-base p-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tighter mb-6 text-text-base">
            <div className="w-8 h-8 bg-brand-lime rounded-lg flex items-center justify-center">
              <Zap size={20} className="text-black" />
            </div>
            Xpert Ads
          </Link>
          <h1 className="text-3xl font-bold mb-2 text-text-base">Create an account</h1>
          <p className="text-gray-500">Start growing your content today.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="input-linktree w-full"
            required
            value={formData.fullName}
            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
          />
          <input
            type="text"
            placeholder="Username"
            className="input-linktree w-full"
            required
            value={formData.username}
            onChange={e => setFormData({ ...formData, username: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email Address"
            className="input-linktree w-full"
            required
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="input-linktree w-full"
            required
            minLength={6}
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="input-linktree w-full"
            required
            value={formData.confirmPassword}
            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
          />
          
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-4 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Sign Up <ArrowRight className="ml-2" size={18} /></>}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-500">
          Already have an account? <Link to="/login" className="text-deep-blue font-bold">Login</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
