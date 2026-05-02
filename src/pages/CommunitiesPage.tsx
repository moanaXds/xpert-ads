import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Cpu, 
  Heart, 
  Rocket, 
  Smartphone, 
  Gamepad2, 
  GraduationCap, 
  Video, 
  Clapperboard,
  Zap,
  ChevronRight,
  Users
} from 'lucide-react';

export const COMMUNITIES = [
  { id: 'technologies', name: 'Technologies', icon: <Cpu />, color: 'bg-deep-blue', desc: 'Latest in software, AI, and dev tools.' },
  { id: 'lifestyle', name: 'Lifestyle', icon: <Heart />, color: 'bg-brand-pink', desc: 'Fitness, travel, and daily inspiration.' },
  { id: 'startups', name: 'Startups', icon: <Rocket />, color: 'bg-brand-purple', desc: 'Entrepreneurship and business growth.' },
  { id: 'electronics', name: 'Electronics', icon: <Smartphone />, color: 'bg-dark-maroon', desc: 'Gadgets, hardware, and tech reviews.' },
  { id: 'gaming', name: 'Gaming', icon: <Gamepad2 />, color: 'bg-emerald-500', desc: 'E-sports, walkthroughs, and reviews.' },
  { id: 'education', name: 'Education', icon: <GraduationCap />, color: 'bg-orange-500', desc: 'Tutorials, courses, and learning.' },
  { id: 'vlogs', name: 'Vlogs', icon: <Video />, color: 'bg-rose-500', desc: 'Personal stories and daily life.' },
  { id: 'entertainment', name: 'Entertainment', icon: <Clapperboard />, color: 'bg-indigo-600', desc: 'Movies, music, and pop culture.' },
];

const CommunitiesPage = () => {
  return (
    <div className="min-h-screen bg-bg-base p-6 md:p-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tighter mb-6">
            <div className="w-8 h-8 bg-brand-lime rounded-lg flex items-center justify-center">
              <Zap size={20} className="text-black" />
            </div>
            Xpert Ads
          </Link>
          <h1 className="text-5xl font-bold tracking-tight mb-4">Explore Communities</h1>
          <p className="text-xl text-gray-500 dark:text-gray-400">Join a community to discover and promote targeted content.</p>
        </header>
 
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {COMMUNITIES.map((community, i) => (
            <motion.div
              key={community.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link 
                to={`/community/${community.id}`}
                className="group block card-base p-8 hover:shadow-xl hover:border-brand-lime/20 h-full flex flex-col"
              >
                <div className={`w-14 h-14 ${community.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                  {React.cloneElement(community.icon as React.ReactElement, { size: 28 })}
                </div>
                <h3 className="text-2xl font-bold mb-3">{community.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 flex-1">{community.desc}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border-subtle">
                  <span className="text-sm font-bold text-gray-400 flex items-center gap-1">
                    <Users size={16} /> 2.4k Members
                  </span>
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-brand-lime group-hover:text-black transition-colors">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunitiesPage;
