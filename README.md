# Wakepon

A household expense tracking application that enables multiple users to share and manage expenses collaboratively.

## Overview

Wakepon is a React-based expense tracking application designed for households where family members or roommates can share expenses, track spending patterns, and manage budgets together. Built with modern web technologies and powered by Supabase backend.

## Features

- **Household Sharing**: Multiple users can join a household and track shared expenses
- **Expense Management**: Record and categorize expenses with customizable categories
- **User Authentication**: Secure OTP-based email authentication
- **Member Invitation**: Invite household members via email
- **Profile Management**: Manage user profiles and household settings
- **Category Management**: Create custom expense categories for your household
- **Real-time Updates**: Leverages Supabase real-time capabilities for collaborative experience

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- React Router DOM
- React Hook Form
- CSS with M Plus 1 font (Japanese support)

### Backend
- Supabase (PostgreSQL + Auth + Storage)
- Row Level Security (RLS) for data protection

### Testing
- Vitest
- React Testing Library

## Getting Started

### Prerequisites

- Node.js (latest LTS version recommended)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wakepon
```

2. Install dependencies:
```bash
npm install
cd frontend
npm install
```

3. Set up environment variables:

Create a `.env` file in the `frontend/` directory with:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
cd frontend
npm run dev
```

## Available Scripts

From the `frontend/` directory:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm test` - Run tests with Vitest
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Run tests with coverage report

## Project Structure

```
wakepon/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   └── ui/           # Base UI components
│   │   ├── contexts/         # React contexts (AuthContext)
│   │   ├── lib/              # External service clients
│   │   ├── pages/            # Route components
│   │   ├── utils/            # Utility functions
│   │   └── types.ts          # TypeScript type definitions
│   ├── public/               # Static assets
│   └── package.json
├── supabase/                 # Supabase configuration
└── README.md
```

## Database Schema

- `users` - User profiles
- `household_members` - User-household relationships
- `expenses` - Expense records
- `categories` - Expense categories (system + custom)
- `household_categories` - Category-household relationships

## Authentication Flow

1. User enters email on sign-in page
2. Supabase sends OTP to email
3. User verifies OTP
4. Session is established and user can access protected routes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Add your license here]

## Support

For issues and questions, please open an issue on GitHub.

---

日本語版のドキュメントは [README_ja.md](./README_ja.md) をご覧ください。
