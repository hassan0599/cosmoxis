import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Cosmoxis',
  description:
    'Terms of Service for Cosmoxis - The rules and guidelines for using our receipt scanning service.',
}

export default function TermsOfServicePage() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
      <div className='container mx-auto px-4 py-16 max-w-4xl'>
        <h1 className='text-4xl font-bold text-slate-900 mb-4'>
          Terms of Service
        </h1>
        <p className='text-slate-600 mb-8'>Last updated: February 15, 2026</p>

        <div className='prose prose-slate max-w-none'>
          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-4'>
              1. Agreement to Terms
            </h2>
            <p className='text-slate-700 mb-4'>
              By accessing or using Cosmoxis ("the Service"), you agree to be
              bound by these Terms of Service ("Terms"). If you disagree with
              any part of these terms, you do not have permission to access the
              Service.
            </p>
            <p className='text-slate-700 mb-4'>
              These Terms constitute a legally binding agreement between you and
              Cosmoxis Inc. ("Company," "we," "us," or "our") concerning your
              access to and use of the Service.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-4'>
              2. Description of Service
            </h2>
            <p className='text-slate-700 mb-4'>
              Cosmoxis provides an AI-powered receipt scanning and expense
              tracking platform that allows users to:
            </p>
            <ul className='list-disc list-inside text-slate-700 mb-4 space-y-2'>
              <li>Scan and digitize receipts using AI technology</li>
              <li>Organize and categorize expenses</li>
              <li>Track spending and generate reports</li>
              <li>Export data in various formats</li>
              <li>Manage budgets and financial goals</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-4'>
              3. User Accounts
            </h2>
            <h3 className='text-xl font-medium text-slate-900 mb-3'>
              Account Registration
            </h3>
            <p className='text-slate-700 mb-4'>
              To use certain features of the Service, you must register for an
              account. When you register:
            </p>
            <ul className='list-disc list-inside text-slate-700 mb-4 space-y-2'>
              <li>You must provide accurate and complete information</li>
              <li>
                You must maintain the security of your account credentials
              </li>
              <li>You are responsible for all activities under your account</li>
              <li>You must notify us immediately of any unauthorized access</li>
            </ul>

            <h3 className='text-xl font-medium text-slate-900 mb-3'>
              Account Termination
            </h3>
            <p className='text-slate-700 mb-4'>
              We may suspend or terminate your account at our sole discretion
              if:
            </p>
            <ul className='list-disc list-inside text-slate-700 mb-4 space-y-2'>
              <li>You violate these Terms</li>
              <li>You engage in fraudulent or illegal activity</li>
              <li>Your account remains inactive for an extended period</li>
              <li>We discontinue the Service</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-4'>
              4. Subscription and Payments
            </h2>
            <h3 className='text-xl font-medium text-slate-900 mb-3'>Pricing</h3>
            <p className='text-slate-700 mb-4'>
              We offer both free and paid subscription plans. Paid plans are
              billed on a monthly or yearly basis, depending on your selection.
              All prices are displayed in USD unless otherwise noted.
            </p>

            <h3 className='text-xl font-medium text-slate-900 mb-3'>Payment</h3>
            <p className='text-slate-700 mb-4'>
              Payment is processed securely through Stripe. By subscribing to a
              paid plan, you authorize us to charge your chosen payment method
              for the subscription fees.
            </p>

            <h3 className='text-xl font-medium text-slate-900 mb-3'>
              Renewal and Cancellation
            </h3>
            <p className='text-slate-700 mb-4'>
              Subscriptions automatically renew at the end of each billing
              period unless you cancel before the renewal date. You may cancel
              your subscription at any time through your account settings or by
              contacting support. Upon cancellation:
            </p>
            <ul className='list-disc list-inside text-slate-700 mb-4 space-y-2'>
              <li>
                Your access continues until the end of the current billing
                period
              </li>
              <li>
                No prorated refunds are provided for partial billing periods
              </li>
              <li>Your data will be retained for 30 days after cancellation</li>
            </ul>

            <h3 className='text-xl font-medium text-slate-900 mb-3'>Refunds</h3>
            <p className='text-slate-700 mb-4'>
              All payments are non-refundable except as required by law. If you
              believe you have been charged in error, please contact our support
              team within 7 days of the charge.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-4'>
              5. Acceptable Use
            </h2>
            <p className='text-slate-700 mb-4'>
              You agree not to use the Service to:
            </p>
            <ul className='list-disc list-inside text-slate-700 mb-4 space-y-2'>
              <li>Upload, store, or process illegal or harmful content</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the intellectual property rights of others</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use the Service for any fraudulent purpose</li>
              <li>Share your account credentials with others</li>
              <li>
                Reverse engineer or attempt to extract source code from the
                Service
              </li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-4'>
              6. User Data
            </h2>
            <p className='text-slate-700 mb-4'>
              You retain ownership of all data you upload to the Service,
              including receipt images and extracted information. By using the
              Service, you grant us a limited license to process your data
              solely for the purpose of providing the Service.
            </p>
            <p className='text-slate-700 mb-4'>
              You are responsible for ensuring that you have the right to upload
              any receipts or documents to the Service and that doing so does
              not violate any applicable laws or third-party rights.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-4'>
              7. Intellectual Property
            </h2>
            <p className='text-slate-700 mb-4'>
              The Service, including its original content, features, and
              functionality, is owned by Cosmoxis Inc. and is protected by
              international copyright, trademark, and other intellectual
              property laws.
            </p>
            <p className='text-slate-700 mb-4'>
              Our trademarks and trade dress may not be used without our prior
              written consent. You may not reproduce, distribute, or create
              derivative works from our Service without explicit permission.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-4'>
              8. Limitation of Liability
            </h2>
            <p className='text-slate-700 mb-4'>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul className='list-disc list-inside text-slate-700 mb-4 space-y-2'>
              <li>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
                WARRANTIES OF ANY KIND
              </li>
              <li>
                WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
                ERROR-FREE, OR SECURE
              </li>
              <li>
                WE ARE NOT LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR
                CONSEQUENTIAL DAMAGES
              </li>
              <li>
                OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN
                THE 12 MONTHS PRECEDING THE CLAIM
              </li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-4'>
              9. Indemnification
            </h2>
            <p className='text-slate-700 mb-4'>
              You agree to indemnify and hold harmless Cosmoxis Inc. and its
              officers, directors, employees, and agents from any claims,
              damages, losses, or expenses arising from:
            </p>
            <ul className='list-disc list-inside text-slate-700 mb-4 space-y-2'>
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Content you upload to the Service</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-4'>
              10. Dispute Resolution
            </h2>
            <p className='text-slate-700 mb-4'>
              Any disputes arising from these Terms or your use of the Service
              shall be resolved through binding arbitration in accordance with
              the rules of the ADR Institute of Canada (ADRIC). The arbitration
              shall take place in Toronto, Ontario, Canada.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-4'>
              11. Changes to Terms
            </h2>
            <p className='text-slate-700 mb-4'>
              We reserve the right to modify these Terms at any time. We will
              notify you of any material changes by posting the updated Terms on
              our website and updating the "Last updated" date. Your continued
              use of the Service after such modifications constitutes acceptance
              of the updated Terms.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-4'>
              12. Governing Law
            </h2>
            <p className='text-slate-700 mb-4'>
              These Terms shall be governed by and construed in accordance with
              the laws of Canada and the Province of Ontario, without regard to
              its conflict of law provisions. Any legal actions arising from
              these Terms shall be brought exclusively in the courts of the
              Province of Ontario.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-4'>
              13. Severability
            </h2>
            <p className='text-slate-700 mb-4'>
              If any provision of these Terms is found to be unenforceable or
              invalid, that provision shall be limited or eliminated to the
              minimum extent necessary, and the remaining provisions shall
              remain in full force and effect.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-4'>
              14. Contact Us
            </h2>
            <p className='text-slate-700 mb-4'>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className='text-slate-700'>
              Email: info@cosmoxis.com
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
