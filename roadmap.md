# Cosmoxis Product Roadmap

## Executive Summary

Cosmoxis is an AI-powered receipt scanning and expense management platform for freelancers and small businesses. This document outlines the current state, feature recommendations, pricing strategy, and implementation roadmap.

---

## Current Application Analysis

### Tech Stack

- **Frontend**: Next.js 16.1.6, React 19.2.3, TypeScript 5
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Google OAuth + Email)
- **AI Integration**: OpenRouter API (nvidia/nemotron-nano-12b-v2-vl)
- **UI Components**: Radix UI primitives with custom styling

### Current Features

| Feature                 | Status         | Description                                                    |
| ----------------------- | -------------- | -------------------------------------------------------------- |
| Google OAuth            | ✅ Implemented | One-click Google sign-in                                       |
| Email Authentication    | ✅ Implemented | Sign up/sign in with email and password                        |
| Receipt Image Upload    | ✅ Implemented | Drag & drop or file picker                                     |
| Camera Capture          | ✅ Implemented | Mobile-friendly camera integration                             |
| AI Data Extraction      | ✅ Implemented | Extracts merchant, date, amount, category, line items          |
| Manual Review & Edit    | ✅ Implemented | Review and modify AI-extracted data before saving              |
| Receipt CRUD            | ✅ Implemented | Create, read, update, delete receipts                          |
| Search & Filter         | ✅ Implemented | Search by merchant, filter by category                         |
| Category Classification | ✅ Implemented | 5 default categories (Meals, Travel, Office, Utilities, Other) |
| Spending Statistics     | ✅ Implemented | Total spent, receipt count, period tracking                    |
| Category Breakdown      | ✅ Implemented | Visual breakdown of spending by category                       |
| CSV Export              | ✅ Implemented | Download all receipts as CSV                                   |
| Confidence Score        | ✅ Implemented | AI confidence indicator for extractions                        |

### Database Schema

```sql
-- Current tables
profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP
)

receipts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  merchant_name TEXT,
  date DATE,
  total_amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  category TEXT,
  notes TEXT,
  image_url TEXT,
  raw_extraction_json JSONB,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP
)
```

---

## Recommended New Features

### Phase 1: Quick Wins (Month 1-2)

#### 1. Custom Categories & Tags

**Priority**: High | **Effort**: Medium | **Impact**: High

Currently limited to 5 hardcoded categories. Users need flexibility.

**Features:**

- User-defined categories with custom names
- Color-coded categories
- Icon selection for categories
- Tag system for flexible organization
- Filter by tags and categories

**Database Changes:**

```sql
CREATE TABLE custom_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3670ED',
  icon TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#9CA3AF',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE receipt_tags (
  receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (receipt_id, tag_id)
);
```

---

#### 2. Duplicate Detection

**Priority**: Medium | **Effort**: Low | **Impact**: Medium

Prevent accidental double-entries of the same receipt.

**Features:**

- Detect similar receipts (same merchant, amount, date)
- Warning modal before saving duplicates
- Option to view existing similar receipt
- Hash-based image similarity detection

---

#### 3. Multi-Currency Enhancement

**Priority**: Medium | **Effort**: Medium | **Impact**: High

Expand currency support for international users.

**Features:**

- 20+ supported currencies
- Auto-detect currency from receipt
- Daily exchange rate updates
- Convert to home currency for reporting
- Show spending in preferred currency

**Implementation:**

- Integrate with free exchange rate API (exchangerate-api.com)
- Store original currency and converted amount
- User preference for home currency

---

#### 4. Enhanced Notes System

**Priority**: Low | **Effort**: Low | **Impact**: Medium

Improve the notes functionality for better record-keeping.

**Features:**

- Rich text formatting (bold, italic, lists)
- Voice-to-text notes (mobile)
- Attach additional documents (PDFs)
- Mention/tag other receipts

---

### Phase 2: Core Enhancements (Month 2-4)

#### 5. Budget Tracking

**Priority**: High | **Effort**: Medium | **Impact**: High

Allow users to set and track spending limits.

**Features:**

- Set monthly/quarterly/yearly budgets
- Budget per category or overall
- Visual progress bars
- Overspending alerts (email + in-app)
- Budget vs. actual comparison charts

**Database Changes:**

```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  category TEXT, -- NULL for overall budget
  amount DECIMAL(10,2) NOT NULL,
  period TEXT NOT NULL, -- 'monthly', 'quarterly', 'yearly'
  alert_threshold DECIMAL(3,2) DEFAULT 0.8, -- Alert at 80%
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

#### 6. PDF Expense Reports

**Priority**: High | **Effort**: Medium | **Impact**: High

Generate professional reports for accounting and tax purposes.

**Features:**

- Select date range and categories
- Professional PDF layout with branding
- Include receipt thumbnails
- Summary statistics
- Email reports directly
- Scheduled automatic reports (weekly/monthly)
- Share reports via link

**Implementation:**

- Use react-pdf or @react-pdf/renderer
- Template system for customization
- Store generated reports in Supabase Storage

---

#### 7. Email-to-Receipt Forwarding

**Priority**: Medium | **Effort**: High | **Impact**: High

Allow users to forward receipt emails directly to Cosmoxis.

**Features:**

- Unique email address per user (e.g., user123@receipts.cosmoxis.com)
- Parse email attachments automatically
- Extract from email body (digital receipts)
- Auto-process with AI

**Implementation:**

- Use SendGrid or Postmark inbound parsing
- Background job processing
- Email queue system

---

#### 8. Merchant Intelligence

**Priority**: Medium | **Effort**: Medium | **Impact**: Medium

Learn from user behavior to improve categorization.

**Features:**

- Auto-suggest category based on merchant history
- Merchant spending patterns
- Frequent merchant quick-entry
- Merchant logo auto-detection
- Location-based merchant suggestions

---

### Phase 3: Advanced Features (Month 4-6)

#### 9. Team Workspaces

**Priority**: High | **Effort**: High | **Impact**: Very High

Enable multi-user collaboration for businesses.

**Features:**

- Create organizations/workspaces
- Invite team members via email
- Role-based permissions:
  - **Owner**: Full access, billing, member management
  - **Admin**: Full access, member management
  - **Editor**: Create, edit, view receipts
  - **Viewer**: View only
- Shared receipt repositories
- Team-wide categories and tags

**Database Changes:**

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Add organization_id to receipts
ALTER TABLE receipts ADD COLUMN organization_id UUID REFERENCES organizations(id);
```

---

#### 10. Approval Workflows

**Priority**: Medium | **Effort**: Medium | **Impact**: High

For businesses that require expense approvals.

**Features:**

- Submit receipts for approval
- Multi-level approval chains
- Approval/rejection with comments
- Email notifications for pending approvals
- Approval history audit trail

**Database Changes:**

```sql
CREATE TABLE approval_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

#### 11. Bank/Card Integration

**Priority**: High | **Effort**: Very High | **Impact**: Very High

Connect financial accounts for automatic transaction import.

**Features:**

- Connect bank accounts via Plaid
- Connect credit cards
- Match receipts to transactions
- Auto-import transactions without receipts
- Reconciliation tools
- Real-time balance updates

**Implementation:**

- Integrate Plaid API
- Secure token storage
- Background sync jobs
- Transaction matching algorithm

---

#### 12. QuickBooks/Xero Integration

**Priority**: High | **Effort**: High | **Impact**: Very High

Sync with popular accounting software.

**Features:**

- One-click export to QuickBooks Online
- One-click export to Xero
- Automatic category mapping
- Bi-directional sync
- Export history tracking

---

#### 13. Tax Preparation Suite

**Priority**: Medium | **Effort**: Medium | **Impact**: High

Help users prepare for tax season.

**Features:**

- Tax category mapping (Schedule C categories)
- Tax deduction recommendations
- Year-end tax summary reports
- Export to tax software (TurboTax, H&R Block)
- Mileage deduction tracking
- Home office deduction calculator

---

#### 14. Mileage Tracking

**Priority**: Medium | **Effort**: Medium | **Impact**: Medium

Track business travel mileage.

**Features:**

- GPS-based trip logging
- Manual mileage entry
- Mileage rate calculations (IRS rates)
- Trip categorization
- Combine with receipt expenses
- Mileage reports

---

#### 15. AI Insights & Anomalies

**Priority**: Low | **Effort**: Medium | **Impact**: Medium

Provide intelligent insights about spending.

**Features:**

- Spending pattern analysis
- Unusual expense alerts
- Cost-saving recommendations
- Predictive budget forecasting
- Merchant price comparison
- Seasonal spending insights

---

#### 16. API Access

**Priority**: High | **Effort**: Medium | **Impact**: High

Allow developers to build on top of Cosmoxis.

**Features:**

- RESTful API
- API key management
- Rate limiting
- Webhooks
- Developer documentation
- SDK for popular languages

---

#### 17. Integrations Marketplace

**Priority**: Medium | **Effort**: High | **Impact**: High

Connect with other tools.

**Integrations:**

- Google Drive / Dropbox backup
- Slack notifications
- Microsoft Teams
- Zapier automation
- IFTTT
- Google Sheets sync
- Notion database sync

---

## Pricing Strategy

### Tier Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FREE TIER                                       │
│                                  $0/month                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  • 10 receipts per month                                                     │
│  • 5 AI scans per month                                                      │
│  • Unlimited manual entry                                                    │
│  • 5 default categories                                                      │
│  • CSV export                                                                │
│  • Basic email support                                                       │
│  • 100MB storage                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PRO TIER                                        │
│                              $9/month                                        │
│                         $89/year (2 months free)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Unlimited receipts                                                        │
│  • Unlimited AI scans                                                        │
│  • 10 custom categories                                                      │
│  • Tags system                                                               │
│  • Budget tracking                                                           │
│  • PDF reports (5/month)                                                     │
│  • Email forwarding                                                          │
│  • Merchant intelligence                                                     │
│  • Priority email support                                                    │
│  • 5GB storage                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            BUSINESS TIER                                     │
│                             $29/month                                        │
│                        $290/year (2 months free)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Everything in Pro                                                         │
│  • Team workspace (up to 5 users)                                            │
│  • Unlimited custom categories                                               │
│  • Unlimited PDF reports                                                     │
│  • Approval workflows                                                        │
│  • Bank/card integration                                                     │
│  • QuickBooks/Xero sync                                                      │
│  • API access                                                                │
│  • Advanced analytics                                                        │
│  • Phone + email support                                                     │
│  • 50GB storage                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ENTERPRISE TIER                                    │
│                            Custom Pricing                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Everything in Business                                                    │
│  • Unlimited team members                                                    │
│  • SSO/SAML authentication                                                   │
│  • Custom integrations                                                       │
│  • Dedicated account manager                                                 │
│  • SLA guarantee (99.9% uptime)                                              │
│  • On-premise deployment option                                              │
│  • Custom data retention policies                                            │
│  • 24/7 priority support                                                     │
│  • Unlimited storage                                                         │
│  • Custom training                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Feature Comparison Matrix

| Feature                |  Free  |    Pro    | Business  | Enterprise |
| ---------------------- | :----: | :-------: | :-------: | :--------: |
| **Receipts**           |
| Receipts per month     |   10   | Unlimited | Unlimited | Unlimited  |
| AI scans per month     |   5    | Unlimited | Unlimited | Unlimited  |
| Manual entry           |   ✅   |    ✅     |    ✅     |     ✅     |
| Receipt images         |   ✅   |    ✅     |    ✅     |     ✅     |
| Line items             |   ✅   |    ✅     |    ✅     |     ✅     |
| **Organization**       |
| Default categories     |   5    |     5     |     5     |     5      |
| Custom categories      |   ❌   |    10     | Unlimited | Unlimited  |
| Tags                   |   ❌   |    ✅     |    ✅     |     ✅     |
| Search & filter        |   ✅   |    ✅     |    ✅     |     ✅     |
| **Export & Reports**   |
| CSV export             |   ✅   |    ✅     |    ✅     |     ✅     |
| PDF reports            |   ❌   |  5/month  | Unlimited | Unlimited  |
| Email reports          |   ❌   |    ✅     |    ✅     |     ✅     |
| Scheduled reports      |   ❌   |    ❌     |    ✅     |     ✅     |
| **Budget & Analytics** |
| Basic stats            |   ✅   |    ✅     |    ✅     |     ✅     |
| Budget tracking        |   ❌   |    ✅     |    ✅     |     ✅     |
| Spending alerts        |   ❌   |    ✅     |    ✅     |     ✅     |
| Advanced analytics     |   ❌   |    ❌     |    ✅     |     ✅     |
| AI insights            |   ❌   |    ❌     |    ✅     |     ✅     |
| **Integrations**       |
| Email forwarding       |   ❌   |    ✅     |    ✅     |     ✅     |
| Bank integration       |   ❌   |    ❌     |    ✅     |     ✅     |
| QuickBooks/Xero        |   ❌   |    ❌     |    ✅     |     ✅     |
| API access             |   ❌   |    ❌     |    ✅     |     ✅     |
| Custom integrations    |   ❌   |    ❌     |    ❌     |     ✅     |
| **Team Features**      |
| Team members           |   1    |     1     |     5     | Unlimited  |
| Approval workflows     |   ❌   |    ❌     |    ✅     |     ✅     |
| Role permissions       |   ❌   |    ❌     |    ✅     |     ✅     |
| **Security & Support** |
| Email support          |   ✅   | Priority  | Priority  |    24/7    |
| Phone support          |   ❌   |    ❌     |    ✅     |     ✅     |
| Dedicated manager      |   ❌   |    ❌     |    ❌     |     ✅     |
| SSO/SAML               |   ❌   |    ❌     |    ❌     |     ✅     |
| SLA                    |   ❌   |    ❌     |    ❌     |   99.9%    |
| **Storage**            |
| Storage limit          | 100MB  |    5GB    |   50GB    | Unlimited  |
| Data retention         | 1 year |  2 years  |  5 years  |   Custom   |

### Pricing Rationale

#### Free Tier

**Purpose**: User acquisition and product validation

- **10 receipts/month** is enough for casual users to experience value
- **5 AI scans** lets them test the core feature without abuse risk
- **Manual entry unlimited** ensures they can still use the product
- **CSV export** ensures they don't feel "locked in"
- **Psychology**: Users who hit the limit are already seeing value and more likely to upgrade

#### Pro Tier ($9/month)

**Purpose**: Individual power users and freelancers

- **Price point**: Under $10 feels like a "no-brainer" for serious users
- **Unlimited receipts + AI** removes friction for heavy users
- **Budget tracking + PDF reports** are high-value for tax preparation
- **Email forwarding** is a major convenience feature
- **Competitive analysis**:
  - Expensify: $5-9/month for individuals
  - Dext (Receipt Bank): $10-20/month
  - Your $9 price is competitive while maintaining margins

#### Business Tier ($29/month)

**Purpose**: Small teams and businesses

- **Team features** justify 3x price jump from Pro
- **Bank integration + QuickBooks** are must-haves for businesses
- **5 users included** = $5.80/user - very competitive
- **API access** enables custom workflows
- **Target**: Small businesses, startups, accounting firms

#### Enterprise (Custom Pricing)

**Purpose**: Large organizations with specific needs

- **SSO** is table stakes for enterprise
- **Custom integrations** justify high-touch sales
- **SLA** required for business-critical use
- **Pricing**: Typically $50-200/user/month depending on scale
- **Target**: Mid-to-large companies, enterprises, accounting firms

---

## Implementation Roadmap

### Timeline Overview

```
2026
┌──────────────────────────────────────────────────────────────────────────────┐
│ Q1 (Mar)          │ Q2 (Apr-May)      │ Q3 (Jun-Jul)     │ Q4 (Aug-Sep)     │
├───────────────────┼───────────────────┼───────────────────┼───────────────────┤
│ • Subscription    │ • Budget Tracking │ • Team Workspaces │ • Bank Integration│
│   System          │ • PDF Reports     │ • Approval        │ • QuickBooks/Xero │
│ • Custom Cats     │ • Email Forward   │   Workflows       │ • API Access      │
│ • Tags System     │ • Merchant Intel  │ • Tax Prep Suite  │ • Integrations    │
│ • Duplicate Det.  │ • Mileage Track   │ • AI Insights     │ • Mobile App      │
└───────────────────┴───────────────────┴───────────────────┴───────────────────┘
```

### Phase 1: Foundation (Month 1-2)

**Sprint 1 (Weeks 1-2): Subscription System**

- [ ] Set up Stripe account and integration
- [ ] Create subscription database schema
- [ ] Implement usage tracking system
- [ ] Build pricing page UI
- [ ] Create subscription management UI
- [ ] Implement plan limits enforcement

**Sprint 2 (Weeks 3-4): Custom Categories & Tags**

- [ ] Create database migrations
- [ ] Build category management UI
- [ ] Implement tag system
- [ ] Update receipt form for new categories
- [ ] Update filter system

**Sprint 3 (Weeks 5-6): Quality of Life**

- [ ] Implement duplicate detection
- [ ] Add multi-currency support
- [ ] Enhance notes system
- [ ] Performance optimizations

### Phase 2: Core Features (Month 2-4)

**Sprint 4 (Weeks 7-8): Budget Tracking**

- [ ] Create budget database schema
- [ ] Build budget creation UI
- [ ] Implement budget tracking logic
- [ ] Create budget dashboard widgets
- [ ] Add spending alerts

**Sprint 5 (Weeks 9-10): PDF Reports**

- [ ] Set up PDF generation library
- [ ] Design report templates
- [ ] Build report generation API
- [ ] Create report scheduling system
- [ ] Implement email delivery

**Sprint 6 (Weeks 11-12): Email Forwarding**

- [ ] Set up email inbound processing
- [ ] Create user email addresses
- [ ] Build email parsing logic
- [ ] Integrate with AI extraction
- [ ] Add notification system

**Sprint 7 (Weeks 13-14): Merchant Intelligence**

- [ ] Build merchant history tracking
- [ ] Implement auto-categorization
- [ ] Create merchant spending views
- [ ] Add merchant suggestions

### Phase 3: Advanced Features (Month 4-6)

**Sprint 8 (Weeks 15-18): Team Workspaces**

- [ ] Create organization schema
- [ ] Build organization management UI
- [ ] Implement invite system
- [ ] Create role-based permissions
- [ ] Update all queries for multi-tenant

**Sprint 9 (Weeks 19-20): Approval Workflows**

- [ ] Create approval schema
- [ ] Build approval UI
- [ ] Implement notification system
- [ ] Add approval history

**Sprint 10 (Weeks 21-22): Tax Preparation**

- [ ] Add tax category mapping
- [ ] Build tax summary reports
- [ ] Create deduction recommendations
- [ ] Implement tax export formats

**Sprint 11 (Weeks 23-24): Mileage Tracking**

- [ ] Create mileage schema
- [ ] Build GPS tracking (mobile)
- [ ] Implement mileage calculations
- [ ] Add mileage reports

### Phase 4: Integrations (Month 6-8)

**Sprint 12 (Weeks 25-28): Bank Integration**

- [ ] Integrate Plaid API
- [ ] Build account connection flow
- [ ] Implement transaction sync
- [ ] Create matching algorithm
- [ ] Build reconciliation tools

**Sprint 13 (Weeks 29-30): QuickBooks/Xero**

- [ ] Integrate QuickBooks API
- [ ] Integrate Xero API
- [ ] Build category mapping
- [ ] Implement sync logic
- [ ] Create export UI

**Sprint 14 (Weeks 31-32): API & Webhooks**

- [ ] Design REST API
- [ ] Implement API endpoints
- [ ] Build API key management
- [ ] Create webhook system
- [ ] Write documentation

**Sprint 15 (Weeks 33-36): Mobile App**

- [ ] Set up React Native / PWA
- [ ] Build core receipt capture
- [ ] Implement offline support
- [ ] Add push notifications
- [ ] Submit to app stores

---

## Database Schema Additions

### Complete Schema for All Features

```sql
-- ============================================
-- SUBSCRIPTION & BILLING
-- ============================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  receipts_count INTEGER DEFAULT 0,
  ai_scans_count INTEGER DEFAULT 0,
  pdf_reports_count INTEGER DEFAULT 0,
  storage_used_bytes BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

-- ============================================
-- CUSTOM CATEGORIES & TAGS
-- ============================================

CREATE TABLE custom_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID, -- For team categories
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3670ED',
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#9CA3AF',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE receipt_tags (
  receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (receipt_id, tag_id)
);

-- ============================================
-- BUDGETS
-- ============================================

CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  category TEXT, -- NULL for overall budget
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  period TEXT NOT NULL, -- 'monthly', 'quarterly', 'yearly'
  alert_threshold DECIMAL(3,2) DEFAULT 0.8,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE budget_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
  threshold DECIMAL(3,2) NOT NULL,
  triggered_at TIMESTAMP DEFAULT NOW(),
  acknowledged_at TIMESTAMP,
  acknowledged_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- ORGANIZATIONS & TEAMS
-- ============================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  owner_id UUID REFERENCES auth.users(id),
  plan TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  invited_email TEXT,
  joined_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE TABLE organization_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  token TEXT UNIQUE,
  expires_at TIMESTAMP,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- APPROVAL WORKFLOWS
-- ============================================

CREATE TABLE approval_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  conditions JSONB, -- e.g., {"min_amount": 100, "categories": ["travel"]}
  approvers JSONB NOT NULL, -- e.g., [{"user_id": "uuid", "order": 1}]
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE approval_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  requested_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  current_step INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE approval_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES approval_requests(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'approved', 'rejected'
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- BANK INTEGRATION
-- ============================================

CREATE TABLE connected_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  plaid_item_id TEXT,
  plaid_access_token TEXT,
  institution_name TEXT,
  institution_id TEXT,
  last_sync_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  connected_account_id UUID REFERENCES connected_accounts(id),
  plaid_transaction_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  date DATE NOT NULL,
  merchant_name TEXT,
  category TEXT,
  pending BOOLEAN DEFAULT FALSE,
  matched_receipt_id UUID REFERENCES receipts(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- MILEAGE TRACKING
-- ============================================

CREATE TABLE mileage_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  start_location TEXT,
  end_location TEXT,
  start_lat DECIMAL(10,8),
  start_lng DECIMAL(11,8),
  end_lat DECIMAL(10,8),
  end_lng DECIMAL(11,8),
  distance_miles DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  purpose TEXT,
  category TEXT,
  notes TEXT,
  rate_per_mile DECIMAL(6,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- REPORTS
-- ============================================

CREATE TABLE saved_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  name TEXT NOT NULL,
  report_type TEXT NOT NULL, -- 'expense', 'tax', 'mileage'
  date_range_start DATE,
  date_range_end DATE,
  filters JSONB,
  storage_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scheduled_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  frequency TEXT NOT NULL, -- 'weekly', 'monthly', 'quarterly'
  recipients JSONB NOT NULL, -- ["email1@example.com", "email2@example.com"]
  filters JSONB,
  last_sent_at TIMESTAMP,
  next_send_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- API & INTEGRATIONS
-- ============================================

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL, -- First 8 chars for identification
  permissions JSONB,
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT,
  events JSONB NOT NULL, -- ["receipt.created", "receipt.updated"]
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  delivered_at TIMESTAMP,
  next_retry_at TIMESTAMP,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- AUDIT LOG
-- ============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ADD INDEXES
-- ============================================

CREATE INDEX idx_receipts_user_id ON receipts(user_id);
CREATE INDEX idx_receipts_organization_id ON receipts(organization_id);
CREATE INDEX idx_receipts_date ON receipts(date);
CREATE INDEX idx_receipts_category ON receipts(category);
CREATE INDEX idx_usage_tracking_user_period ON usage_tracking(user_id, period_start);
CREATE INDEX idx_transactions_matched_receipt ON transactions(matched_receipt_id);
CREATE INDEX idx_approval_requests_status ON approval_requests(status);
```

---

## Technical Architecture Updates

### New API Endpoints

```
/api/
├── subscriptions/
│   ├── route.ts              # GET current, POST create
│   └── manage/
│       └── route.ts          # POST cancel, update
├── categories/
│   ├── route.ts              # GET all, POST create
│   └── [id]/
│       └── route.ts          # PUT update, DELETE
├── tags/
│   ├── route.ts              # GET all, POST create
│   └── [id]/
│       └── route.ts          # PUT update, DELETE
├── budgets/
│   ├── route.ts              # GET all, POST create
│   └── [id]/
│       └── route.ts          # PUT update, DELETE
├── reports/
│   ├── route.ts              # GET all, POST generate
│   ├── scheduled/
│   │   └── route.ts          # CRUD for scheduled reports
│   └── [id]/
│       └── route.ts          # GET download
├── organizations/
│   ├── route.ts              # GET all, POST create
│   ├── [id]/
│   │   ├── route.ts          # GET, PUT, DELETE
│   │   ├── members/
│   │   │   └── route.ts      # GET, POST invite
│   │   └── settings/
│   │       └── route.ts      # PUT settings
│   └── invite/
│       └── [token]/
│           └── route.ts      # POST accept invite
├── approvals/
│   ├── route.ts              # GET pending, POST request
│   └── [id]/
│       └── route.ts          # PUT approve/reject
├── bank/
│   ├── link/
│   │   └── route.ts          # POST create link token
│   ├── connect/
│   │   └── route.ts          # POST exchange token
│   ├── accounts/
│   │   └── route.ts          # GET connected accounts
│   └── sync/
│       └── route.ts          # POST manual sync
├── mileage/
│   ├── route.ts              # GET all, POST create
│   └── [id]/
│       └── route.ts          # PUT, DELETE
├── api-keys/
│   ├── route.ts              # GET all, POST create
│   └── [id]/
│       └── route.ts          # DELETE revoke
└── webhooks/
    ├── route.ts              # GET all, POST create
    └── [id]/
        └── route.ts          # PUT, DELETE
```

---

## Success Metrics

### Key Performance Indicators (KPIs)

| Metric                          | Target (Year 1)   |
| ------------------------------- | ----------------- |
| Registered Users                | 10,000            |
| Free to Pro Conversion          | 5%                |
| Pro to Business Conversion      | 10%               |
| Monthly Active Users            | 40% of registered |
| Average Receipts per User       | 20/month          |
| AI Extraction Accuracy          | >95%              |
| Customer Churn Rate             | <5%/month         |
| Net Promoter Score (NPS)        | >50               |
| Monthly Recurring Revenue (MRR) | $50,000           |

### Feature Adoption Targets

| Feature           | Adoption Target       |
| ----------------- | --------------------- |
| Custom Categories | 60% of Pro users      |
| Budget Tracking   | 40% of Pro users      |
| PDF Reports       | 30% of Pro users      |
| Email Forwarding  | 25% of Pro users      |
| Team Workspaces   | 50% of Business users |
| Bank Integration  | 40% of Business users |
| API Access        | 20% of Business users |

---

## Risk Assessment

### Technical Risks

| Risk                     | Likelihood | Impact | Mitigation                                     |
| ------------------------ | ---------- | ------ | ---------------------------------------------- |
| AI API rate limits/costs | Medium     | High   | Implement caching, consider self-hosted models |
| Plaid API changes        | Low        | High   | Abstract integration layer, monitor changelog  |
| Database scaling         | Medium     | High   | Plan for sharding, use read replicas           |
| Storage costs            | Medium     | Medium | Implement compression, tiered storage          |

### Business Risks

| Risk                | Likelihood | Impact | Mitigation                     |
| ------------------- | ---------- | ------ | ------------------------------ |
| Free tier abuse     | Medium     | Medium | Rate limiting, fraud detection |
| Low conversion rate | Medium     | High   | A/B testing, user research     |
| Competition         | High       | Medium | Focus on UX, unique features   |
| Support burden      | Medium     | Medium | Self-service docs, AI chatbot  |

---

## Conclusion

This roadmap provides a comprehensive plan for evolving Cosmoxis from a single-user receipt scanner to a full-featured expense management platform. The phased approach allows for iterative development while delivering value at each stage.

Key priorities:

1. **Immediate**: Implement subscription system to enable monetization
2. **Short-term**: Add custom categories and budget tracking for Pro tier value
3. **Medium-term**: Build team features for Business tier
4. **Long-term**: Add integrations and API for ecosystem growth

The pricing strategy balances accessibility (free tier) with sustainable revenue (paid tiers), positioning Cosmoxis competitively in the expense management market.
