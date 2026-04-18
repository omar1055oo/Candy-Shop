# Candy Shop 🍬

A full-featured e-commerce web app for selling candy products, built for real-world usage with a smooth customer journey and a complete admin experience.

## Overview

Candy Shop delivers a seamless flow from product discovery to order placement:
- browse products by categories
- add/update items in cart
- complete checkout with clear order summary
- track and manage orders through customer-facing flows

The platform is fully dynamic through an admin dashboard that controls products, orders, categories, and banners.

## Core Features

- **Storefront UX:** responsive product listing, category filtering, cart management, and checkout flow.
- **Admin Dashboard:** manage products, order statuses, banners, and catalog structure without code changes.
- **Dynamic Content:** storefront content is database-driven, so updates are reflected immediately.
- **Data Reliability:** database-level logic (including triggers) helps maintain consistency for pricing, stock, and timestamps.

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **UI System:** Tailwind CSS + component-based architecture
- **State & Data:** Zustand + TanStack Query
- **Backend Platform:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)

## Why This Stack

- **Performance ⚡**: Vite + React provide fast startup, hot reload, and efficient rendering.
- **Scalability 📈**: Supabase supports growth with managed database and backend services.
- **Reliability ✅**: core business rules are reinforced in the data layer to protect consistency.
- **Clean Code:** modular project structure with TypeScript-based type safety.

## Project Structure

- `src/pages` - storefront and admin pages
- `src/components` - reusable UI and domain components
- `src/hooks` - data fetching and mutation logic
- `src/store` - application state (cart and related flows)
- `supabase/migrations` - schema, policies, and database logic
- `supabase/functions` - edge functions and backend utilities

## Quick Start

### Prerequisites

- Node.js 18+
- npm
- A Supabase project

### Setup

```bash
npm install
cp .env.example .env
```

Update `.env` with:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Run

```bash
npm run dev
```

Default local URL:
`http://localhost:8080`

## Scripts

- `npm run dev` - start development server
- `npm run build` - build production bundle
- `npm run preview` - preview production build
- `npm run lint` - run lint checks
- `npm run test` - run tests

## Deployment Ready

The project is ready for deployment once environment variables are configured.  
Set up `.env`, apply Supabase migrations, and deploy the frontend build.

## License

This project is for educational or internal use unless specified otherwise by the owner.
