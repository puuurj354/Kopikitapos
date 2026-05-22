# Kopikita POS

A modern Point of Sale (POS) system for coffee shops and cafes, built with React, Vite, and Supabase.

## Features

- **POS Terminal**: Quick order processing with a visual menu interface
- **Cart Management**: Add, remove, and modify items in real-time
- **Payment Processing**: Multiple payment methods with receipt generation
- **Dashboard**: Sales analytics and hourly revenue charts
- **Menu Management**: Add, edit, and categorize menu items
- **Order Tracking**: View and manage customer orders
- **Reports**: Sales reports and business insights
- **Staff Management**: Manage team members and permissions
- **Authentication**: Secure login with Supabase Auth

## Tech Stack

- **Frontend Framework**: React 19 with Vite
- **Styling**: Tailwind CSS 4, MUI Material, Emotion
- **UI Components**: Radix UI primitives, Lucide icons
- **State Management**: React Context API
- **Data Fetching**: TanStack Query (React Query)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Routing**: React Router v7
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Notifications**: Sonner

## Prerequisites

- [Bun](https://bun.sh/) runtime installed
- A Supabase project with the following environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd kopikita-pos
```

### 2. Install dependencies

```bash
bun install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up the database

Run the seed script to populate your Supabase database with initial menu data:

```bash
bun run seed.ts
```

### 5. Start the development server

```bash
bun run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
kopikita-pos/
├── src/
│   ├── app/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context providers (Auth, POS)
│   │   ├── data/           # Static data (menu items)
│   │   ├── pages/          # Page components (views)
│   │   └── types/          # TypeScript type definitions
│   ├── lib/                # Utility functions
│   ├── styles/             # Global styles
│   └── main.tsx            # Application entry point
├── index.html              # HTML template
├── seed.ts                 # Database seeding script
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json            # Project dependencies
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run preview` | Preview production build |
| `bun run seed.ts` | Seed the database with initial data |

## Database Schema

The application expects the following tables in Supabase:

- `categories` - Menu categories
- `products` - Menu items with prices and images
- `orders` - Customer orders
- `order_items` - Items within orders
- `users` - Staff accounts (managed by Supabase Auth)

## Deployment

### Build for Production

```bash
bun run build
```

The built files will be in the `dist/` directory, ready to be deployed to any static hosting service like Vercel, Netlify, or Cloudflare Pages.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
