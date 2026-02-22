# Cosmoxis

**Cosmoxis** is a modern receipt management and expense tracking application designed to simplify how individuals and businesses manage their receipts, track expenses, and gain valuable insights into their spending habits.

## Features

### Core Functionality

- **Receipt Scanning**: Upload and scan receipts using advanced OCR technology
- **Expense Tracking**: Automatically extract and categorize expense data from receipts
- **Budget Management**: Set budgets and track spending against financial goals
- **Analytics & Reporting**: Visualize spending patterns with interactive charts and reports
- **Data Export**: Export receipts and expense data in CSV format
- **Cloud Storage**: Securely store all receipt data in the cloud
- **Search & Filter**: Quickly find receipts by merchant, date, amount, or category

### Advanced Features

- **Smart Categorization**: AI-powered suggestions for expense categories
- **Duplicate Detection**: Identify and prevent duplicate receipt entries
- **Multi-Currency Support**: Handle expenses in various currencies
- **Tags & Notes**: Add custom tags and notes to receipts for better organization
- **Subscription Management**: Flexible pricing plans with Stripe integration
- **User Authentication**: Secure login with email/password or Google OAuth

## Technology Stack

### Frontend

- **Next.js 16.1.6**: React framework for server-side rendering and static site generation
- **React 19.2.3**: UI library for building the user interface
- **Tailwind CSS 4**: Utility-first CSS framework for styling
- **Radix UI**: Accessible UI components
- **Lucide React**: Beautiful icons library

### Backend

- **Next.js API Routes**: Serverless API endpoints
- **Supabase**: PostgreSQL database and authentication
- **Stripe**: Payment processing and subscription management
- **OpenRouter**: AI integration for receipt processing

### Development & Deployment

- **TypeScript**: Type-safe development
- **ESLint**: Code quality assurance
- **Vercel**: Recommended deployment platform

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun package manager
- Supabase account and project
- Stripe account (for payment processing)
- OpenRouter API key (for AI features)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd Cosmoxis
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
Cosmoxis/
├── app/                      # Next.js app router
│   ├── page.tsx             # Home page
│   ├── layout.tsx           # Root layout
│   ├── login/               # Login and authentication
│   ├── (dashboard)/         # Dashboard routes
│   └── api/                 # API routes
├── components/              # Reusable UI components
│   ├── ui/                  # Radix UI based components
│   └── [feature]/           # Feature-specific components
├── lib/                     # Utility functions and helpers
│   ├── supabase/            # Supabase client utilities
│   ├── stripe/              # Stripe integration
│   └── pdf/                 # PDF processing utilities
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript type definitions
├── plans/                   # Pricing plans documentation
├── supabase/                # Supabase migrations and config
└── public/                  # Static assets
```

## Key Components

- **Receipt Scanner**: `components/receipt-scanner.tsx` - Handles receipt scanning and OCR
- **Receipt List**: `components/receipt-list.tsx` - Displays and manages receipt list
- **Receipt Detail**: `components/receipt-detail.tsx` - Shows detailed receipt information
- **Receipt Form**: `components/receipt-form.tsx` - Form for manual receipt entry
- **Stats Chart**: `components/stats-chart.tsx` - Visualizes expense statistics
- **Category Manager**: `components/category-manager.tsx` - Manages expense categories

## API Endpoints

### Receipts

- `GET /api/receipts` - List all receipts
- `POST /api/receipts` - Create a new receipt
- `GET /api/receipts/[id]` - Get receipt details
- `PUT /api/receipts/[id]` - Update receipt
- `DELETE /api/receipts/[id]` - Delete receipt
- `POST /api/upload-receipt` - Upload receipt image
- `POST /api/save-receipt` - Save receipt data
- `POST /api/receipts/check-duplicate` - Check for duplicate receipts

### Categories

- `GET /api/categories` - List all categories
- `POST /api/categories` - Create a new category
- `GET /api/categories/[id]` - Get category details
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

### Tags

- `GET /api/tags` - List all tags
- `POST /api/tags` - Create a new tag
- `GET /api/tags/[id]` - Get tag details
- `PUT /api/tags/[id]` - Update tag
- `DELETE /api/tags/[id]` - Delete tag

### Reports & Analytics

- `GET /api/stats` - Get expense statistics
- `GET /api/export-csv` - Export receipts to CSV
- `GET /api/reports` - Generate expense reports

### Subscriptions

- `GET /api/subscriptions` - Get user subscriptions
- `GET /api/subscriptions/limits` - Get subscription limits
- `POST /api/webhooks/stripe` - Stripe webhook handler

## Database

The application uses Supabase PostgreSQL database with the following main tables:

- `receipts` - Stores receipt information
- `categories` - Expense categories
- `tags` - Custom tags for receipts
- `budgets` - Budget tracking
- `profiles` - User profile information
- `subscriptions` - Subscription details

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set up the required environment variables
3. Deploy with Vercel's automatic build process

### Other Platforms

Follow Next.js deployment documentation for your chosen platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and feature requests, please create an issue in the repository.

## Roadmap

Check out our [roadmap](./roadmap.md) to see what features are planned.
