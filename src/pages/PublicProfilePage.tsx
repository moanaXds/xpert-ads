import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Zap, 
  Youtube, 
  Instagram, 
  Twitter, 
  Globe, 
  ExternalLink, 
  ArrowLeft,
  Loader2,
  Share2,
  Heart
} from 'lucide-react';

interface PublicUser {
  fullName: string;
  username: string;
  profileImage?: string;
  bio?: string;
  platform?: string;
  category?: string;
  credits: number;
  totalPromotions?: number;
}

const PublicProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/u/${username}`);
        if (!res.ok) throw new Error('User not found');
        const data = await res.json();
        setUser(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-brand-lime" size={48} />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-light-gray p-6 text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-500 mb-8">Oops! This creator doesn't exist yet.</p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Profile link copied!");
    } catch (err) {
      console.error(err);
    }
  };

  const handlePromote = async () => {
    try {
        const res = await fetch('/api/user/promote', { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
            alert("Promotion successful! (10 credits used)");
            if (user) setUser({ ...user, totalPromotions: data.totalPromotions, credits: data.credits });
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error(err);
    }
  };

  const getPlatformIcon = (platform?: string) => {
    switch (platform?.toLowerCase()) {
      case 'youtube': return <Youtube size={20} />;
      case 'instagram': return <Instagram size={20} />;
      case 'twitter': return <Twitter size={20} />;
      default: return <Globe size={20} />;
    }
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl flex flex-col items-center text-center"
      >
        {/* Profile Image */}
        <div className="w-32 h-32 md:w-40 md:h-40 bg-light-gray rounded-full border-4 border-brand-lime shadow-xl mb-8 overflow-hidden">
          {user.profileImage ? (
            <img src={user.profileImage} className="w-full h-full object-cover" alt={user.fullName} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-gray-300">
              {user.fullName[0]}
            </div>
          )}
        </div>

        {/* Name & Username */}
        <h1 className="text-4xl font-bold mb-2 tracking-tight">{user.fullName}</h1>
        <p className="text-xl text-gray-500 mb-6">@{user.username}</p>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-deep-blue text-white rounded-full text-sm font-bold">
            {getPlatformIcon(user.platform)}
            {user.platform || 'Creator'}
          </div>
          <div className="px-4 py-2 bg-brand-lime text-black rounded-full text-sm font-bold">
            {user.category || 'General'}
          </div>
          <div className="px-4 py-2 bg-light-pink text-black rounded-full text-sm font-bold flex items-center gap-2">
            <Zap size={14} /> {user.credits} Credits
          </div>
        </div>

        {/* Bio */}
        <p className="text-lg text-gray-600 max-w-lg leading-relaxed mb-12">
          {user.bio || "This creator hasn't added a bio yet, but they're definitely awesome!"}
        </p>

        {/* Action Buttons (Linktree Style) */}
        <div className="w-full space-y-4">
          <button className="w-full py-5 bg-[#1A1A1A] text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-lg">
            <Heart size={20} className="text-brand-pink" /> Support this Creator
          </button>
          
          <button 
            onClick={handlePromote}
            className="w-full py-5 border-2 border-[#1A1A1A] text-[#1A1A1A] rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <Zap size={20} className="text-brand-lime" /> Promote Content (10 Credits)
          </button>

          <Link 
            to={`/u/${user.username}/content`}
            className="w-full py-5 bg-cream text-[#1A1A1A] rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"
          >
            Latest Content <ExternalLink size={20} />
          </Link>
        </div>

      </motion.div>
    </div>
  );
};

export default PublicProfilePage;
