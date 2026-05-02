import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-bg-base py-20 px-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-lime/10 text-brand-lime rounded-full mb-6 font-bold text-sm tracking-wider uppercase">
            <Shield size={16} /> Privacy Policy
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6">Your Privacy Matters</h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed">
            At Xpert Ads, we are committed to protecting your personal data and being transparent about how we use it. This policy explains what happens when you use our platform.
          </p>
        </motion.div>

        <div className="space-y-12">
          <section className="card-base p-10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <FileText size={24} className="text-brand-lime" />
              1. Data Collection
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>We collect information that you provide directly to us when you create an account, update your profile, or upload content. This include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account Information: Name, email address, and profile preferences.</li>
                <li>Profile Content: Profile images, bio, and social platform links.</li>
                <li>Content Data: Metadata associated with the videos and images you upload.</li>
              </ul>
            </div>
          </section>

          <section className="card-base p-10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Eye size={24} className="text-brand-pink" />
              2. Content Visibility
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>Xpert Ads is a public platform. When you upload content or join a community:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your profile information (username, bio, and profile image) is visible to other users.</li>
                <li>Any content you promote is visible to users within the relevant communities.</li>
                <li>Engagement metrics (views, likes) are public information used for ranking.</li>
              </ul>
            </div>
          </section>

          <section className="card-base p-10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Lock size={24} className="text-brand-purple text-deep-blue" />
              3. Data Security
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We implement industry-standard security measures to protect your information from unauthorized access, alteration, or destruction. We use secure cloud hosting and encrypted connections for all data transfers.
            </p>
          </section>

          <div className="p-8 bg-brand-lime/5 rounded-3xl border border-brand-lime/10">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center italic">
              Last Updated: April 28, 2026. For privacy concerns, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
