import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Users, BarChart3, ChevronRight } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="pt-40 pb-20 bg-brand-lime relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6 text-gray-900">
              Grow Your Content <br />
              <span className="italic">Without Paid Ads</span>
            </h1>
            <p className="text-xl text-black/70 mb-10 max-w-lg leading-relaxed">
              The community-driven marketplace where creators promote each other. Engage, earn credits, and skyrocket your reach.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={user ? "/upload" : "/signup"} className="btn-primary text-lg px-10 py-5">
                {user ? "Upload New Ad" : "Get Started Free"} <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link to="/communities" className="btn-outline text-lg px-10 py-5 bg-transparent">
                View Marketplace
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 animate-float">
              <img 
                src="https://picsum.photos/seed/saas/800/1000" 
                alt="Dashboard Preview" 
                className="rounded-2xl shadow-2xl border-8 border-black/5"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-purple rounded-full blur-3xl opacity-20"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-deep-blue rounded-full blur-3xl opacity-20"></div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 bg-bg-base border-y border-border-subtle">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold tracking-tight mb-4">How It Works</h2>
            <p className="text-xl text-gray-500">Three simple steps to viral growth.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Zap className="text-brand-lime" />, title: "Engage", desc: "Interact with other creators' content to earn valuable credits." },
              { icon: <Users className="text-deep-blue" />, title: "Earn", desc: "Accumulate credits for every genuine engagement you provide." },
              { icon: <BarChart3 className="text-brand-pink" />, title: "Promote", desc: "Use your credits to feature your own content to the community." }
            ].map((step, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-10 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-border-subtle"
              >
                <div className="w-16 h-16 bg-bg-base rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Bento Grid */}
      <section id="features" className="py-32 bg-bg-base">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-deep-blue p-12 rounded-3xl text-white flex flex-col justify-between min-h-[400px]">
              <div>
                <h3 className="text-4xl font-bold mb-6">Free Promotion for Beginners</h3>
                <p className="text-xl text-white/80">No budget? No problem. Earn your way to the top by being an active community member.</p>
              </div>
              <Link to="/signup" className="btn-primary w-fit mt-8 text-black">Start Now</Link>
            </div>
            <div className="bg-dark-maroon p-12 rounded-3xl text-white flex flex-col justify-between min-h-[400px]">
              <div>
                <h3 className="text-4xl font-bold mb-6">Community Driven Engagement</h3>
                <p className="text-xl text-white/80">Real people, real views. Our algorithm ensures genuine interest and high retention.</p>
              </div>
              <div className="flex -space-x-4 mt-8">
                {[1,2,3,4].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-12 h-12 rounded-full border-4 border-dark-maroon" />
                ))}
                <div className="w-12 h-12 rounded-full bg-brand-lime text-black flex items-center justify-center font-bold border-4 border-dark-maroon">+2k</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-brand-purple text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-8">Ready to explode your reach?</h2>
          <p className="text-xl text-white/70 mb-12">Join 10,000+ creators growing their audience every day.</p>
          <Link to="/signup" className="btn-primary text-lg px-12 py-5">
            Join Xpert Ads Now
          </Link>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
