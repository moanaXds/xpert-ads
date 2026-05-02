import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader2, Youtube, Instagram, Twitter, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfileSetupPage = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    bio: '',
    platform: 'YouTube',
    category: 'Education',
    profileImage: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const data = await res.json();
        updateUser(data);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-3xl p-12 shadow-xl"
      >
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">Complete your profile</h1>
          <p className="text-gray-500">Tell the community more about your content.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 bg-light-gray rounded-full flex items-center justify-center border-4 border-brand-lime relative group cursor-pointer overflow-hidden">
              {formData.profileImage ? (
                <img src={formData.profileImage} className="w-full h-full object-cover" />
              ) : (
                <Camera size={40} className="text-gray-400" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-bold">Change</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">Upload a profile picture</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">Bio / About Section</label>
              <textarea
                className="input-linktree w-full h-32 py-4 resize-none"
                placeholder="I create tech tutorials for beginners..."
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2">Primary Platform</label>
                <select 
                  className="input-linktree w-full appearance-none"
                  value={formData.platform}
                  onChange={e => setFormData({ ...formData, platform: e.target.value })}
                >
                  <option>YouTube</option>
                  <option>Instagram</option>
                  <option>TikTok</option>
                  <option>Twitter</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Content Category</label>
                <select 
                  className="input-linktree w-full appearance-none"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option>Education</option>
                  <option>Tech</option>
                  <option>Gaming</option>
                  <option>Vlogs</option>
                  <option>Lifestyle</option>
                  <option>Entertainment</option>
                </select>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-5 text-lg"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Save & Continue"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileSetupPage;
