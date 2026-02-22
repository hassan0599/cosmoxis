# Cosmoxis Development Guidelines

## Project Overview

Cosmoxis is a modern, AI-powered receipt management application built with:

- Next.js 16.1.6 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase (PostgreSQL + Auth)
- Stripe (Payments)
- Lucide React (Icons)

The application allows users to:

- Scan receipts using AI
- Manually enter receipt information
- Categorize and tag receipts
- Track spending with statistics and charts
- Export data to CSV
- Manage subscriptions

## Architecture Principles

### 1. SOLID Principles

#### Single Responsibility Principle (SRP)

- Each component should have a single, well-defined responsibility
- Services handle API interactions
- Hooks manage state and business logic
- Utilities contain pure functions for formatting and validation

#### Open/Closed Principle (OCP)

- Components and services should be open for extension but closed for modification
- Use TypeScript interfaces and types for extensibility
- Services provide a consistent API for data operations

#### Liskov Substitution Principle (LSP)

- Ensure type consistency across the application
- Avoid breaking changes to existing interfaces
- Use union types and optional properties carefully

#### Interface Segregation Principle (ISP)

- Services should provide focused interfaces
- Hooks should be specific to their domain (receipts, categories, tags, stats)
- Components should accept only the props they need

#### Dependency Inversion Principle (DIP)

- Dependencies should be abstractions (services) rather than concrete implementations
- Components should use hooks to interact with services
- Services should be reusable across different components

### 2. Project Structure

```
Cosmoxis/
├── app/                     # Next.js app router pages and API routes
│   ├── api/                 # API endpoints
│   ├── (dashboard)/         # Dashboard routes (protected)
│   ├── login/               # Login page
│   ├── pricing/             # Pricing page
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── ui/                  # UI library (shadcn/ui)
│   └── [feature]-*.tsx      # Feature-specific components
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions and helpers
├── services/                # API service layer
├── types/                   # TypeScript type definitions
├── public/                  # Static assets
├── supabase/                # Supabase migrations
└── plans/                   # Pricing plans documentation
```

### 3. Code Style Guidelines

#### Naming Conventions

- **Files & Directories**: Use kebab-case (e.g., `receipt-detail.tsx`, `user-nav.tsx`)
- **Components**: Use PascalCase (e.g., `ReceiptDetail`, `CategoryManager`)
- **Hooks**: Use camelCase with `use` prefix (e.g., `useReceipts`, `useCategories`)
- **Services**: Use PascalCase with `Service` suffix (e.g., `ReceiptService`, `CategoriesService`)
- **Variables & Functions**: Use camelCase (e.g., `handleSaveReceipt`, `formatCurrency`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `CATEGORY_LABELS`, `PRESET_COLORS`)

#### TypeScript

- Always use strict type definitions
- Define interfaces for all data structures
- Use `type` for simple type aliases
- Use `interface` for complex objects and component props
- Avoid `any` type; use `unknown` instead if type is not known

#### React Components

- Use functional components with TypeScript
- Use `useState` and `useEffect` for state management
- Use custom hooks for complex state logic
- Follow the rules of hooks

### 4. Data Management

#### Services Layer

- Services are responsible for API interactions
- Each service should correspond to a single data entity (receipts, categories, tags, stats)
- Services should handle error handling and API responses
- Example service structure:

```typescript
export class ReceiptService {
  private static baseUrl = '/api/receipts'

  static async getReceipts(params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
    startDate?: string
    endDate?: string
  }): Promise<{ receipts: Receipt[]; pagination: Pagination }> {
    // API call implementation
  }

  static async getReceipt(id: string): Promise<Receipt> {
    // API call implementation
  }

  static async createReceipt(
    data: Omit<ReceiptInsert, 'user_id'>,
  ): Promise<Receipt> {
    // API call implementation
  }

  static async updateReceipt(
    id: string,
    data: Partial<ReceiptUpdate>,
  ): Promise<Receipt> {
    // API call implementation
  }

  static async deleteReceipt(id: string): Promise<void> {
    // API call implementation
  }
}
```

#### Hooks Layer

- Hooks manage state and business logic
- Each hook should be focused on a single feature
- Hooks should use services to interact with the API
- Hooks should handle loading states and errors
- Example hook structure:

```typescript
export function useReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchReceipts = useCallback(async (params?: GetReceiptsParams) => {
    setIsLoading(true)
    try {
      const result = await ReceiptService.getReceipts(params)
      setReceipts(result.receipts)
    } catch (error) {
      console.error('Failed to fetch receipts:', error)
      toast({
        title: 'Error',
        description: 'Failed to load receipts. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    receipts,
    isLoading,
    fetchReceipts,
  }
}
```

### 5. Error Handling

- Use try-catch blocks for API calls
- Display user-friendly error messages using toast notifications
- Log errors to console for debugging purposes
- Handle loading states appropriately

### 6. UI Components

#### Layout Components

- Use semantic HTML tags
- Follow Tailwind CSS best practices
- Maintain consistent spacing and styling
- Use responsive design for all components

#### Form Components

- Handle form validation
- Display loading states for form submissions
- Provide clear feedback to users

#### Data Display Components

- Handle loading and error states
- Use appropriate formatting for dates, currency, and numbers
- Display data in a user-friendly format

### 7. API Routes

- API routes are located in `app/api/`
- Each route should handle a specific HTTP method (GET, POST, PUT, DELETE)
- Use Supabase for database operations
- Handle authentication and authorization
- Validate inputs and return appropriate status codes

### 8. Authentication & Authorization

- Use Supabase Auth for user authentication
- Protected routes are located in `app/(dashboard)/`
- Use middleware to check authentication status
- Use `getUser()` to access user information

### 9. Performance Optimization

- Use React.memo for expensive components
- Use useCallback for functions that depend on props
- Optimize images with Next.js Image component
- Use pagination for large datasets

### 10. Testing

- Write unit tests for utility functions
- Write integration tests for components and hooks
- Use mock data for testing API interactions

## Best Practices

1. **Keep components small and focused**: Each component should handle one specific task
2. **Use custom hooks for state management**: Encapsulate complex logic in reusable hooks
3. **Follow the service layer pattern**: Separate API calls from business logic
4. **Maintain type safety**: Use TypeScript to catch errors early
5. **Handle errors gracefully**: Provide user-friendly feedback for errors
6. **Write clean code**: Follow coding conventions and keep code readable
7. **Document your code**: Add comments for complex logic and explanations
8. **Test your code**: Write tests for all critical functionality

## Example Workflow

To add a new feature:

1. Create a new service for the data entity
2. Create a custom hook to manage state
3. Create components to display and interact with the data
4. Implement API routes if needed
5. Update types and interfaces
6. Test the feature
7. Document the changes

By following these guidelines, you'll ensure that the codebase remains maintainable, scalable, and follows best practices for modern React applications.
