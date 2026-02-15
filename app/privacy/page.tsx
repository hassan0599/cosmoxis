import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Cosmoxis',
  description:
    'Privacy Policy for Cosmoxis - How we collect, use, and protect your data.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
      <div className='container mx-auto px-4 py-16 max-w-4xl'>
        <h1 className='text-4xl font-bold text-slate-900 mb-4'>
          Privacy Policy
        </h1>
        <p className='text-slate-600 mb-8'>Last updated: February 15, 2026</p>

        <div className='prose prose-slate max-w-none'>
          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-4'>
              1. Introduction
            </h2>
            <p className='text-slate-700 mb-4'>
              Welcome to Cosmoxis. We are committed to protecting your personal
              information and your right to privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you visit our website and use our receipt
              scanning and expense tracking services.
            </p>
            <p className='text-slate-700 mb-4'>
              Please read this privacy policy carefully. If you do not agree
              with the terms of this privacy policy, please do not access the
              site or use our services.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-4'>
              2. Information We Collect
            </h2>
            <h3 className='text-xl font-medium text-slate-900 mb-3'>
              Personal Data
            </h3>
            <p className='text-slate-700 mb-4'>
              We collect personal information that you voluntarily provide to us
              when you:
            </p>
            <ul className='list-disc list-inside text-slate-700 mb-4 space-y-2'>
              <li>Register on the platform</li>
              <li>Subscribe to our newsletter</li>
              <li>Contact us through the contact form</li>
              <li>Use our services</li>
            </ul>
            <p className='text-slate-700 mb-4'>This information may include:</p>
            <ul className='list-disc list-inside text-slate-700 mb-4 space-y-2'>
              <li>Name and email address</li>
              <li>Account credentials</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Receipt images and extracted data</li>
              <li>Expense categories and tags you create</li>
            </ul>

            <h3 className='text-xl font-medium text-slate-900 mb-3'>
              Automatically Collected Data
            </h3>
            <p className='text-slate-700 mb-4'>
              When you visit our site, we automatically collect certain
              information about your device, including:
            </p>
            <ul className='list-disc list-inside text-slate-700 mb-4 space-y-2'>
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Referring URLs</li>
              <li>Pages viewed and time spent on pages</li>
              <li>Links clicked</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-4'>
              3. How We Use Your Information
            </h2>
            <p className='text-slate-700 mb-4'>
              We use the information we collect to:
            </p>
            <ul className='list-disc list-inside text-slate-700 mb-4 space-y-2'>
              <li>Provide, operate, and maintain our services</li>
              <li>Process your receipts and manage your expense data</li>
              <li>Improve, personalize, and expand our services</li>
              <li>Understand and analyze how you use our services</li>
              <li>
                Develop new products, services, features, and functionality
              </li>
              <li>Communicate with you for customer service and support</li>
              <li>
                Send you updates and marketing communications (with your
                consent)
              </li>
              <li>Find and prevent fraud</li>
              <li>Process payments and manage your subscription</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-4'>
              4. Data Storage and Security
            </h2>
            <p className='text-slate-700 mb-4'>
              We use Supabase for secure data storage, which employs
              industry-standard security measures including encryption at rest
              and in transit. Your receipt images and extracted data are stored
              securely and are only accessible to you and authorized personnel
              when necessary for support.
            </p>
            <p className='text-slate-700 mb-4'>
              We implement appropriate technical and organizational security
              measures designed to protect the security of any personal
              information we process. However, no electronic transmission over
              the Internet or information storage technology can be guaranteed
              to be 100% secure.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-4'>
              5. Third-Party Services
            </h2>
            <p className='text-slate-700 mb-4'>
              We use the following third-party services that may collect your
              data:
            </p>
            <ul className='list-disc list-inside text-slate-700 mb-4 space-y-2'>
              <li>
                <strong>Stripe</strong> - For payment processing. Stripe
                processes your payment information securely and we do not store
                your full credit card details.
              </li>
              <li>
                <strong>Google</strong> - For authentication via Google Sign-In.
                Google shares only your name and email address with us.
              </li>
              <li>
                <strong>OpenRouter/AI Services</strong> - For AI-powered receipt
                scanning. Images are processed to extract text data.
              </li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-4'>
              6. Data Retention
            </h2>
            <p className='text-slate-700 mb-4'>
              We retain your personal information for as long as your account is
              active or as needed to provide you services. When you delete your
              account, we will delete or anonymize your data within 30 days,
              except:
            </p>
            <ul className='list-disc list-inside text-slate-700 mb-4 space-y-2'>
              <li>
                Information we need for legal, tax, or accounting purposes
              </li>
              <li>Aggregated, anonymized data that cannot be linked to you</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-4'>
              7. Your Rights
            </h2>
            <p className='text-slate-700 mb-4'>
              Depending on your location, you may have the following rights:
            </p>
            <ul className='list-disc list-inside text-slate-700 mb-4 space-y-2'>
              <li>Access to your personal data</li>
              <li>Correction of inaccurate data</li>
              <li>Deletion of your data</li>
              <li>Data portability</li>
              <li>Withdrawal of consent</li>
              <li>Objection to processing</li>
            </ul>
            <p className='text-slate-700 mb-4'>
              To exercise these rights, please contact us at
              privacy@cosmoxis.com.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-4'>
              8. Children's Privacy
            </h2>
            <p className='text-slate-700 mb-4'>
              Our services are not intended for children under 13 years of age.
              We do not knowingly collect personal information from children
              under 13. If you are a parent or guardian and believe your child
              has provided us with personal information, please contact us.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-4'>
              9. Changes to This Policy
            </h2>
            <p className='text-slate-700 mb-4'>
              We may update this privacy policy from time to time. We will
              notify you of any changes by posting the new privacy policy on
              this page and updating the "Last updated" date. You are advised to
              review this privacy policy periodically for any changes.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-4'>
              10. Contact Us
            </h2>
            <p className='text-slate-700 mb-4'>
              If you have questions or comments about this privacy policy,
              please contact us at:
            </p>
            <p className='text-slate-700'>
              Email: privacy@cosmoxis.com
              <br />
              Address: Cosmoxis Inc.
            </p>
          </section>
        </div>

        <div className='mt-12 pt-8 border-t'>
          <a
            href='/login'
            className='text-blue-600 hover:text-blue-700 font-medium'>
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  )
}
