# MacroMentor

MacroMentor is a Progressive Web App (PWA) that democratizes personalized nutrition and fitness planning through AI-powered recommendations. The app provides budget-friendly, customized meal plans and simple fitness routines based on individual user profiles, health conditions, and dietary preferences.

## 🎯 Project Status

**Current Phase**: Phase 4 Complete - Frontend Foundations
**Next Phase**: Phase 5 - Core Feature Development

See [docs/IMPLEMENTATION_STATUS.md](./docs/IMPLEMENTATION_STATUS.md) for detailed progress.

## 🚀 Features

### ✅ Completed Features
- **User Authentication**: Email/password sign up and sign in with Supabase Auth
- **Profile Onboarding**: 4-step wizard collecting user info, goals, health conditions, and dietary preferences
- **Design System**: Health-focused UI with semantic color tokens (Fresh Green, Deep Blue, Warm Orange)
- **Secure Database**: 13 tables with Row-Level Security (RLS) policies
- **Responsive Design**: Mobile-first layout with touch-friendly interfaces

### 🚧 In Development
- AI-powered nutrition calculator
- Personalized meal planning with GPT-4
- Customized workout routines
- Progress tracking with analytics
- AI chat assistant

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **UI Components**: Shadcn UI (Radix primitives)
- **Forms**: React Hook Form + Zod validation

## 📁 Key Documentation

- [Planning Document](./docs/PHASE1_PLANNING.md) - Complete requirements and user stories
- [Design System](./docs/DESIGN_SYSTEM.md) - UI/UX guidelines and color system
- [Implementation Status](./docs/IMPLEMENTATION_STATUS.md) - Current progress and next steps

## 🚦 Getting Started

```bash
npm install
npm run dev
```

**Important**: Before testing auth, configure Site URL and Redirect URLs in Supabase dashboard under Authentication > URL Configuration.

## Project Info

**URL**: https://lovable.dev/projects/bf270305-e2fe-41d4-9f58-6c1dc58a03fa
