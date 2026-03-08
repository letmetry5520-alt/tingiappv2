# Tingiapp 🚀
### Sari-Sari Store Distribution Management System

Tingiapp is a modern, premium, and mobile-optimized web application designed for small-scale distribution businesses. It streamlines the management of sari-sari store partners, inventory tracking, sales recording, and credit (utang) management.

---

## 🌟 Key Features

- **📱 Mobile-First Dashboard**: Premium glassmorphic UI designed for delivery personnel on the go.
- **📊 Real-time Analytics**: Visualize sales, profit, and expense trends with interactive charts.
- **🤝 Customer Ecosystem**: Complete CRM for managing store partners, contact details, and route settings.
- **📦 Inventory & Package Builder**: Track individual stock levels and create product bundles (packages) for faster checkout.
- **💳 Credit (Utang) Management**: Specialized ledger for tracking customer balances, partially paid orders, and payment history.
- **🛣️ Route Optimization**: View and navigate to customer locations directly via integrated maps.
- **💸 Finance Ledger**: Record business expenses and track categorized spending.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15/16](https://nextjs.org/) (App Router)
- **Frontend**: React 19, [TailwindCSS 4](https://tailwindcss.com/), [Base UI](https://base-ui.com/)
- **Database**: [Prisma](https://www.prisma.io/) with [MongoDB](https://www.mongodb.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Charts**: [Recharts](https://recharts.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📂 Project Structure

```bash
├── prisma/               # Database schema and migration files
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js App Router (Pages, Layouts, APIs)
│   │   ├── (dashboard)/  # Authenticated dashboard routes
│   │   ├── actions/      # Next.js Server Actions (DB Logic)
│   │   ├── api/          # API Endpoints (Auth, etc.)
│   │   └── login/        # Authentication pages
│   ├── components/       # Reusable UI components
│   │   ├── layout/       # Navigation, Topbar, Sidebar
│   │   └── ui/           # Base UI primitives and styled components
│   ├── lib/              # Shared utilities (Auth config, Prisma client)
│   └── store/            # Zustand state stores
└── .env                  # Environment variables (Sensitive)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- A MongoDB Connection String

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/rebiorti-max/tingiapp.git
cd tingiapp

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
DATABASE_URL="mongodb+srv://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Initialization
```bash
# Generate Prisma Client
npx prisma generate

# (Optional) Seed the database
node prisma/seed.js
```

### 5. Run the App
```bash
npm run dev
```

---

## 🧠 AI Integration Guide

For future AI agents working on this project:

- **Component Pattern**: This project uses **Base UI** for primitive logic and custom Tailwind styling. Avoid nesting `<button>` tags inside triggers; use the `render` prop or style triggers directly.
- **Data Hydration**: Route parameters (`params`) and search parameters (`searchParams`) are **Asynchronous** (Next.js 15+). Always `await` them before use.
- **Database**: Prisma with MongoDB. Ensure `@db.ObjectId` is used for all ID fields.
- **Aesthetics**: Maintain the "Premium Glassmorphism" look—high contrast, rounded corners (`rounded-3xl`+), and subtle backdrops.

---

## 📄 License
This project is private and intended for internal use.
