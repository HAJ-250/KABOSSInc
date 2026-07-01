import { motion } from 'framer-motion';

export function Terms() {
  return (
    <div className="pt-20">
      <section className="relative py-32 overflow-hidden app-bg-image-fixed">
        <div className="absolute inset-0 bg-gradient-to-br from-premium-dark via-premium-navy to-premium-dark" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Terms &{' '}
              <span className="bg-gradient-to-r from-kaboss-400 to-premium-gold bg-clip-text text-transparent">
                Conditions
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
            <h2>Acceptance of Terms</h2>
            <p>By using our services, you agree to these terms and conditions. If you do not agree, please do not use our services.</p>
            <h2>Services</h2>
            <p>KABOSS Inc provides printing, graphic design, photography, sound system, digital services, and Irembo assistance. We reserve the right to modify or discontinue any service without prior notice.</p>
            <h2>Pricing and Payment</h2>
            <p>Prices are subject to change without notice. Payment is required before service delivery unless otherwise agreed. We accept cash, mobile money, and bank transfers.</p>
            <h2>Intellectual Property</h2>
            <p>All designs and materials created by KABOSS Inc remain our intellectual property until full payment is received. Upon payment, ownership transfers to the client.</p>
            <h2>Cancellation and Refunds</h2>
            <p>Cancellations must be made within 24 hours of booking. Refunds are evaluated on a case-by-case basis for services not yet rendered.</p>
            <h2>Limitation of Liability</h2>
            <p>KABOSS Inc shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services.</p>
            <h2>Contact</h2>
            <p>For questions about these terms, contact us at info@kabossinc.com.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
