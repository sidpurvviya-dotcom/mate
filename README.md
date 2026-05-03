# Mate - Find Your Perfect Room & Roommate

Mate is a modern MERN-stack (Next.js, Prisma, SQLite) application designed to help users find rental properties and compatible roommates.

## ✨ Features

- **Property Listings**: Post and browse rental rooms with detailed information, photos, and location mapping.
- **Roommate Matching**: Find roommates based on lifestyle, budget, and work schedule.
- **Interactive Dashboard**: Manage your property listings and roommate requirements in one place.
- **Google OAuth**: Secure login and registration using Google accounts.
- **Smart Map Integration**: Pin and search for properties using an interactive map interface.
- **Real-time Filters**: Search for rooms or roommates by city, budget, amenities, and lifestyle habits.

## 🚀 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Database**: [Prisma](https://www.prisma.io/) with [SQLite](https://sqlite.org/)
- **Styling**: Vanilla CSS (Custom Premium Design System)
- **Authentication**: Custom Google OAuth Integration
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js 18+
- npm or yarn

### 2. Installation
```bash
git clone https://github.com/your-username/mate.git
cd mate
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and copy the contents from `.env.example`. Fill in your Google OAuth credentials and SMTP settings.

### 4. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📦 Deployment

The project is ready for deployment on platforms like **Vercel**.
1. Push your code to GitHub.
2. Connect your repository to Vercel.
3. Configure the environment variables in the Vercel dashboard.
4. Vercel will automatically handle the build and deployment.

---
Created with ❤️ by Siddhant Vishwakarma
