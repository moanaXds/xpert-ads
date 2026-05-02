import React from 'react';
import { motion } from 'motion/react';
import { Scale, Zap, AlertCircle, CheckCircle } from 'lucide-react';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-bg-base py-20 px-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-deep-blue/10 text-deep-blue dark:text-blue-400 rounded-full mb-6 font-bold text-sm tracking-wider uppercase">
            <Scale size={16} /> Terms of Service
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6">Terms and Conditions</h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed">
            Please read these terms carefully before using the Xpert Ads platform. By using our service, you agree to follow these rules.
          </p>
        </motion.div>

        <div className="space-y-12">
          <section className="card-base p-10">
            <h2 className="text-2xl font-bold mb-6">1. Usage Rules</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-brand-lime shrink-0 mt-1" size={20} />
                  <p className="text-gray-600 dark:text-gray-400">Users must provide accurate information during profile setup and verification.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-brand-lime shrink-0 mt-1" size={20} />
                  <p className="text-gray-600 dark:text-gray-400">One account per individual or business entity is allowed.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-500 shrink-0 mt-1" size={20} />
                  <p className="text-gray-600 dark:text-gray-400">Spamming, botting, or artificial engagement manipulation is strictly prohibited.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="card-base p-10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Zap size={24} className="text-brand-lime" />
              2. Credit System Policies
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>Credits are the lifeblood of Xpert Ads exposure. Note that:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Credits have no cash value and cannot be exchanged for currency outside the platform.</li>
                <li>We reserve the right to revoke credits earned through fraudulent activity.</li>
                <li>Credit requirements for promotions may fluctuate based on community demand.</li>
              </ul>
            </div>
          </section>

          <section className="card-base p-10">
            <h2 className="text-2xl font-bold mb-6">3. Content Policies</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              You retain all ownership rights to the content you upload, but you grant Xpert Ads a license to host and promote this content within our selected communities.
            </p>
            <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
               <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">Prohibited Content:</h4>
               <p className="text-sm text-red-500 dark:text-red-400/80">
                 Illegal material, hate speech, explicit content, or content targeting minors with inappropriate ads will result in immediate account termination.
               </p>
            </div>
          </section>

          <div className="text-center pt-8">
            <p className="text-sm text-gray-400">
              By continuing to use Xpert Ads, you acknowledge that you have read and understood these terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
