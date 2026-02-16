# E-commerce Platform

A production-ready, full-stack E-commerce platform built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## Features

### 🛍️ Customer Storefront
- Browse and search products
- Advanced filtering and sorting
- Shopping cart with persistent state
- Secure checkout with Razorpay
- Order tracking and history
- User authentication

### 👨‍💼 Admin Dashboard
- Complete product management (CRUD)
- Category management
- Order management and fulfillment
- User management
- Manager role assignment and permissions
- Real-time analytics with Recharts
- Revenue tracking and KPIs
- Inventory management

### 👔 Manager Dashboard
- Permission-based access control
- Limited order management
- Limited product management
- Activity tracking

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

### Backend
- **API**: Next.js API Routes / Server Actions
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Payments**: Razorpay

### Deployment
- **Platform**: Vercel
- **Database**: Vercel Postgres / Railway / Supabase

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Razorpay account (for payments)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd "E commerce store"
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
- Database URL
- NextAuth secret and URL
- Razorpay credentials
- OAuth provider credentials (optional)

4. **Setup database**
```bash
# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

5. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (storefront)/      # Customer-facing pages
│   ├── admin/             # Admin dashboard
│   ├── manager/           # Manager dashboard
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── storefront/       # Customer components
│   ├── admin/            # Admin components
│   └── manager/          # Manager components
├── lib/                  # Utilities and configurations
├── actions/              # Server actions
├── store/                # Zustand stores
├── types/                # TypeScript types
└── hooks/                # Custom React hooks
```

## Database Schema

The application uses the following main models:
- **User**: Customer, Manager, and Admin accounts
- **Product**: Product catalog with inventory
- **Category**: Hierarchical product categories
- **Order**: Customer orders with status tracking
- **OrderItem**: Individual items in orders
- **Payment**: Razorpay payment records
- **Cart**: Persistent shopping carts
- **Address**: Customer shipping/billing addresses
- **ManagerPermissions**: Role-based access control

## User Roles

### Customer
- Browse and purchase products
- Manage cart and orders
- View order history

### Manager (Limited Access)
- View orders
- Update order status
- Manage products (if permitted)
- View analytics (if permitted)

### Admin (Full Access)
- All manager permissions
- User management
- Manager permission assignment
- Site settings
- Full analytics access

## Payment Integration

The platform uses Razorpay for payment processing:
- Secure payment gateway
- Multiple payment methods (Cards, UPI, Net Banking, Wallets)
- Webhook support for payment verification
- Refund handling

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database Hosting Options
- Vercel Postgres
- Railway
- Supabase
- Neon
- PlanetScale

## Environment Variables

See `.env.example` for all required environment variables.

## Security

- Passwords hashed with bcrypt
- JWT-based authentication
- Role-based access control
- CSRF protection
- SQL injection prevention (Prisma)
- XSS protection

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
