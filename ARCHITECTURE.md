# System Architecture

## 📡 Data Flow
Tingiapp follows a monolithic Next.js architecture using **Server Actions** for all mutations and **Prisma** for data persistence.

### High-Level Movement
1. **User Interaction**: React components (mostly Client Components) trigger Server Actions.
2. **Logic Layer**: Server Actions validate input and interact with MongoDB via Prisma.
3. **Data Revalidation**: `revalidatePath` or `revalidateTag` is used to ensure the UI stays in sync without page refreshes.

## 🗄️ Database Design (MongoDB)
The schema is designed for relational consistency within a NoSQL environment.

- **Customer**: Root of the ecosystem. Tracks store details and geographic coordinates.
- **Product & Package**: Products are atomic items; Packages are JSON-defined bundles of products with a fixed price.
- **Order**: The central transaction model. Stores items as JSON to "freeze" prices at the time of sale.
- **Payment**: Linked to Orders. Supports multiple payments per order to handle "Utang" (Credit) balances.
- **InventoryLog**: Atomic log of every stock change for auditing.

## 🛡️ Authentication & Authorization
Uses **NextAuth.js** with a `Credentials` provider.

- **Roles**: `Admin`, `Delivery`, `Editor`, `Viewer`.
- **RBAC**: Handled at the layout and action level. Admins have full access, while Delivery roles are optimized for the Route and Order pages.

## 🎨 UI System (Base UI & Tailwind)
The project has transitioned away from generic UI libraries towards a custom implementation using **Base UI** primitives.

- **Constraint**: Base UI components (like `Sheet.Trigger` or `Dropdown.Trigger`) should generally not wrap standard `Button` components to avoid `button-inside-button` HTML validation errors.
- **Style Tokens**:
  - `rounded-[2.5rem]` for main containers.
  - `bg-white/40 border-white/60 backdrop-blur-3xl` for the signature glassmorphic effect.
  - `font-black tracking-tighter` for prominent headers.

## 🚀 Future AI Roadmaps
1. **Offline Support**: Migration to a PWA with local storage sync for delivery personnel in low-signal areas.
2. **Route Optimization**: Integration with Mapbox or Google Distance Matrix API to auto-sort delivery queues.
3. **Automated Reports**: Scheduled PDF generation for weekly profit/loss statements.
