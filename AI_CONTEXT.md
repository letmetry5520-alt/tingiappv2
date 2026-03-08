# Developer Context & Gotchas 🧠

If you are an AI assistant working on this project, read this first to avoid common pitfalls discovered during development.

## ⚠️ Critical "Next.js 15+" Changes
- **Async Params**: `params` and `searchParams` in `page.tsx` and `layout.tsx` are **Promises**. 
  - ❌ `const id = params.id`
  - ✅ `const { id } = await params`
- **React 19 Compatibility**: Ensure components are compatible with the latest React versions.

## 🏗️ UI & Accessibility (Base UI)
- **Nested Buttons**: In this project, we use `Base UI`. Triggers for Dialogs, Sheets, and Dropdowns should **NOT** contain a `<button>` if the trigger itself is a button.
  - ❌ `<SheetTrigger><Button>...</Button></SheetTrigger>`
  - ✅ `<SheetTrigger className={buttonVariants({ ... })}>...</SheetTrigger>`
- **nativeButton Prop**: If you render a non-button (like a `Link`) inside a trigger using the `render` prop, you **MUST** set `nativeButton={false}` on the trigger component.

## 💾 Database (MongoDB/Prisma)
- **ObjectId**: All primary and foreign keys must use `@db.ObjectId` in the Prisma schema.
- **Aggregation**: MongoDB doesn't support complex joins in the same way SQL does. Combine queries in Server Actions or use `include`.

## 🎨 Design Language
- **Glassmorphism**: Always use translucent backgrounds with heavy blurring (`backdrop-blur-3xl`).
- **Typography**: Headers should use `font-black tracking-tighter`.
- **Spacing**: Use generous padding (`p-8`) and large border radii (`rounded-[2rem]`).

---
*Last Updated: March 2026*
