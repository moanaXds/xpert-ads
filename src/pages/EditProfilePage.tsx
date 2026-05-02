import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Loader2, ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EditProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    platform: 'YouTube',
    category: 'Education',
    profileImage: ''
  });
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB");
      return;
    }

    setImgLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const res = await fetch('/api/user/profile-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64String })
        });
        if (res.ok) {
          const updatedUser = await res.json();
          updateUser(updatedUser);
          setFormData(prev => ({ ...prev, profileImage: base64String }));
        }
      } catch (err) {
        console.error("Failed to upload profile image:", err);
      } finally {
        setImgLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        bio: user.bio || '',
        platform: user.platform || 'YouTube',
        category: user.category || 'Education',
        profileImage: user.profileImage || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const data = await res.json();
        updateUser(data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg-base p-6 md:p-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 font-bold mb-8 hover:text-text-base transition-colors">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-base p-10 shadow-xl"
        >
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            {success && (
              <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-bold">
                Profile updated successfully!
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center gap-6">
              <label className="w-48 h-48 bg-bg-input rounded-3xl flex items-center justify-center border-4 border-brand-lime relative group cursor-pointer overflow-hidden">
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={imgLoading} />
                {imgLoading ? (
                  <Loader2 className="animate-spin text-brand-lime" size={32} />
                ) : formData.profileImage ? (
                  <img src={formData.profileImage} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-5xl font-bold text-gray-300 dark:text-gray-700">{user.fullName[0]}</div>
                )}
                {!imgLoading && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold flex-col gap-2">
                    <Camera size={32} />
                    <span className="text-xs">Update Photo</span>
                  </div>
                )}
              </label>
              <p className="text-sm text-gray-400 text-center">Click to upload a new profile picture</p>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-500 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  className="input-linktree w-full"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-500 uppercase tracking-wider">Bio</label>
                <textarea
                  className="input-linktree w-full h-32 py-4 resize-none"
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-500 uppercase tracking-wider">Platform</label>
                  <select 
                    className="input-linktree w-full appearance-none"
                    value={formData.platform}
                    onChange={e => setFormData({ ...formData, platform: e.target.value })}
                  >
                    <option className="bg-bg-card">YouTube</option>
                    <option className="bg-bg-card">Instagram</option>
                    <option className="bg-bg-card">TikTok</option>
                    <option className="bg-bg-card">Twitter</option>
                    <option className="bg-bg-card">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-500 uppercase tracking-wider">Category</label>
                  <select 
                    className="input-linktree w-full appearance-none"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option className="bg-bg-card">Education</option>
                    <option className="bg-bg-card">Tech</option>
                    <option className="bg-bg-card">Gaming</option>
                    <option className="bg-bg-card">Vlogs</option>
                    <option className="bg-bg-card">Lifestyle</option>
                    <option className="bg-bg-card">Entertainment</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full py-5 text-lg mt-4"
              >
                {loading ? <Loader2 className="animate-spin text-[#1A1A1A]" /> : <><Save className="mr-2" size={20} /> Save Changes</>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProfilePage;
