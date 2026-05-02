import React from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User as UserIcon, 
  PlusCircle, 
  Settings, 
  LogOut, 
  Zap, 
  TrendingUp, 
  Award,
  ExternalLink,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="p-12 bg-bg-base transition-colors duration-300 min-h-screen">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user.fullName}!</h1>
          <p className="text-gray-500">Here's what's happening with your content.</p>
        </div>
      </header>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="card-base p-8">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-brand-lime/20 rounded-2xl text-brand-lime">
                <Zap size={24} />
              </div>
              <span className="text-emerald-500 font-bold flex items-center text-sm">
                <TrendingUp size={16} className="mr-1" /> +12%
              </span>
            </div>
            <div className="text-3xl font-bold mb-1 text-text-base">{user.credits}</div>
            <div className="flex justify-between items-center">
              <div className="text-gray-400 font-medium">Available Credits</div>
              <Link to="/credits/history" className="text-brand-lime text-xs font-bold hover:underline">View History</Link>
            </div>
          </div>
          <div className="card-base p-8">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-deep-blue/20 rounded-2xl text-deep-blue">
                <Award size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1 text-text-base">{user.totalPromotions || 0}</div>
            <div className="text-gray-400 font-medium">Total Promotions</div>
          </div>
          <div className="card-base p-8">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-brand-pink/20 rounded-2xl text-brand-pink">
                <Users size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1 text-text-base">0</div>
            <div className="text-gray-400 font-medium">Community Rank</div>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card-base p-10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-text-base">Profile Summary</h3>
              <Link to="/profile" className="text-deep-blue dark:text-blue-400 font-bold flex items-center gap-1 hover:underline">
                Edit Profile <ExternalLink size={16} />
              </Link>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-bg-input rounded-2xl overflow-hidden border border-border-subtle shadow-inner">
                  {user.profileImage ? (
                    <img src={user.profileImage} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-300 dark:text-gray-700">
                      {user.fullName[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-text-base">{user.fullName}</h4>
                  <p className="text-gray-500">@{user.username}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-bg-input rounded-2xl border border-border-subtle">
                  <div className="text-xs text-gray-400 uppercase font-bold mb-1">Platform</div>
                  <div className="font-bold text-text-base">{user.platform || 'Not set'}</div>
                </div>
                <div className="p-4 bg-bg-input rounded-2xl border border-border-subtle">
                  <div className="text-xs text-gray-400 uppercase font-bold mb-1">Category</div>
                  <div className="font-bold text-text-base">{user.category || 'Not set'}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase font-bold mb-2">Bio</div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{user.bio || 'No bio added yet.'}</p>
              </div>
            </div>
          </div>

          <div className="bg-brand-purple p-10 rounded-3xl text-white flex flex-col justify-center items-center text-center shadow-xl shadow-brand-purple/20">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-6">
              <PlusCircle size={40} className="text-brand-lime" />
            </div>
            <h3 className="text-3xl font-bold mb-4">Start Promoting</h3>
            <p className="text-white/70 mb-8 max-w-xs">Promote your brand to the community. Each promotion session costs 10 credits.</p>
            <Link to="/communities" className="btn-primary w-full max-w-xs block text-center">Go to Communities</Link>
          </div>
        </div>
    </div>
  );
};

export default Dashboard;
