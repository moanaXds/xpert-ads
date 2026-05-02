import React from 'react';
import { motion } from 'motion/react';
import { Zap, Target, Users, Shield } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-bg-base py-20 px-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-16 bg-brand-lime rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-brand-lime/20">
            <Zap size={32} className="text-black" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6">About Xpert Ads</h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Revolutionizing digital promotion through a community-driven, credit-based ecosystem.
          </p>
        </motion.div>

        <div className="space-y-16">
          <section className="card-base p-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-brand-lime/10 rounded-xl text-brand-lime">
                <Target size={24} />
              </div>
              <h2 className="text-2xl font-bold">Our Vision</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg mb-6">
              Xpert Ads was built on the principle that quality content deserves visibility without the gatekeeping of massive ad budgets. We've created a platform where creators and advertisers can thrive through authentic community engagement.
            </p>
            <div className="grid md:grid-cols-2 gap-8 mt-10">
              <div className="space-y-3">
                <h3 className="font-bold text-xl">Targeted Communities</h3>
                <p className="text-gray-500 dark:text-gray-400">Promote your content in specialized communities where your audience actually lives. No more shouting into the void.</p>
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-xl">Credit System</h3>
                <p className="text-gray-500 dark:text-gray-400">Our innovative credit-based economy allows you to earn exposure through participation or unlock massive reach with ad spent.</p>
              </div>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-8">
            <div className="card-base p-10 border-l-4 border-l-brand-lime">
              <Users className="text-brand-lime mb-6 text-black" size={32} />
              <h2 className="text-2xl font-bold mb-4">User Engagement</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We believe in the power of social proof. Every view, like, and comment on Xpert Ads comes from real people within our verified communities, ensuring your engagement is always authentic.
              </p>
            </div>
            <div className="card-base p-10 border-l-4 border-l-brand-pink">
              <Shield className="text-brand-pink mb-6" size={32} />
              <h2 className="text-2xl font-bold mb-4">Ecosystem Integrity</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Our platform is designed to reward quality. Through our proprietary engagement algorithms, we ensure that the most valuable content rises to the top, creating a better experience for everyone.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
