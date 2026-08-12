import { motion } from 'framer-motion';

export function Privacy() {
  return (
    <div className="pt-20">
      <section className="relative py-32 overflow-hidden app-bg-image-fixed">
        <div className="absolute inset-0 bg-gradient-to-br from-premium-dark via-premium-navy to-premium-dark" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Privacy{' '}
              <span className="bg-gradient-to-r from-kaboss-400 to-premium-gold bg-clip-text text-transparent">
                Policy
              </span>
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Last updated: January 2024
            </p>
            <h2>Information We Collect</h2>
            <p>When you use our services, we may collect personal information including your name, email address, phone number, and any documents or files you upload for service processing.</p>
            <h2>How We Use Your Information</h2>
            <p>We use your information to provide and improve our services, communicate with you about your requests, send important updates, and comply with legal obligations.</p>
            <h2>Data Protection</h2>
            <p>We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.</p>
            <h2>Third-Party Services</h2>
            <p>We may share your information with third-party service providers only as necessary to deliver our services (e.g., printing partners, delivery services).</p>
            <h2>Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.</p>
            <h2>Contact Us</h2>
            <p>If you have questions about this privacy policy, please contact us at kabossimage@gmail.com or call +250 788 882 296.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
