# MacroMentor - Phase 1: Planning & Specification

## 1. MVP Core Features (Must Have)

### Authentication & Onboarding
- Email/password authentication
- 4-step onboarding flow:
  1. Basic info (name, age, gender, height, weight)
  2. Health goals (lose/gain/maintain weight)
  3. Health conditions
  4. Dietary preferences & budget

### Nutrition Calculator
- Daily calorie calculation based on BMR + activity level
- Macronutrient breakdown (protein, carbs, fats)
- Goal-based adjustments
- Health condition considerations

### Meal Planning
- AI-generated daily meal plans
- Recipe details with ingredients
- Nutritional information per meal
- Shopping list generation

### Workout Module
- Condition-specific exercise recommendations
- 10-20 minute routines
- Exercise instructions
- Simple workout tracking

### Dashboard & Progress
- Daily calorie progress visualization
- Weight tracking over time
- Streak counters
- Achievement badges
- Today's meal and workout overview

### AI Chat Assistant
- Nutrition queries
- Food substitution suggestions
- Motivational support

## 2. Later Enhancements (Post-MVP)

### Phase 2 Features
- Social features (share progress)
- Advanced analytics and insights
- Custom recipe creation
- Meal prep planning
- Integration with fitness trackers
- Push notifications
- Photo progress comparison
- Water intake detailed tracking
- Multiple language support

### Phase 3 Features
- Community features
- Nutritionist consultation booking
- Grocery delivery integration
- Meal plan marketplace
- Premium subscription features

## 3. User Stories & Acceptance Criteria

### Epic 1: User Onboarding

**US-1.1: As a new user, I want to create an account so I can access personalized features**
- AC: User can sign up with email/password
- AC: Email verification is sent
- AC: Error handling for duplicate emails
- AC: Password strength requirements enforced

**US-1.2: As a new user, I want to complete my profile so the app can personalize recommendations**
- AC: User completes 4-step onboarding wizard
- AC: All required fields validated
- AC: User can go back to edit previous steps
- AC: Profile saved to database upon completion

**US-1.3: As a returning user, I want to sign in easily**
- AC: User can log in with email/password
- AC: Session persists across app visits
- AC: User redirected to dashboard after login

### Epic 2: Nutrition Planning

**US-2.1: As a user, I want to see my daily calorie target**
- AC: Calorie target calculated from profile data
- AC: Display includes macronutrient breakdown
- AC: Updates when user modifies goals

**US-2.2: As a user, I want personalized meal suggestions**
- AC: AI generates breakfast, lunch, dinner, snacks
- AC: Meals match dietary preferences
- AC: Budget constraints respected
- AC: Can view recipe details

**US-2.3: As a user, I want a shopping list for my meals**
- AC: List generated from weekly meal plan
- AC: Ingredients categorized
- AC: Can check off purchased items
- AC: Cost estimate displayed

### Epic 3: Fitness & Workouts

**US-3.1: As a user, I want workout recommendations based on my health conditions**
- AC: Workouts filtered by health conditions
- AC: Difficulty levels appropriate for user
- AC: Duration 10-20 minutes
- AC: Can view exercise demonstrations

**US-3.2: As a user, I want to track completed workouts**
- AC: Can mark workout as complete
- AC: Completion tracked in progress
- AC: Streak counter updates

### Epic 4: Progress Tracking

**US-4.1: As a user, I want to log my weight regularly**
- AC: Can enter weight with date
- AC: View weight trend chart
- AC: See progress toward goal

**US-4.2: As a user, I want to see my achievements**
- AC: Badges displayed for milestones
- AC: Streak counters visible
- AC: Celebration on achievement unlock

### Epic 5: AI Assistance

**US-5.1: As a user, I want to ask nutrition questions**
- AC: Chat interface accessible from any screen
- AC: AI provides personalized responses
- AC: Can ask about food substitutions
- AC: Chat history saved

## 4. Database Schema (Supabase)

### Table: profiles
```sql
- id (uuid, PK, references auth.users)
- first_name (text)
- last_name (text)
- age (integer)
- gender (text)
- height_cm (numeric)
- weight_kg (numeric)
- activity_level (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### Table: health_goals
```sql
- id (uuid, PK)
- user_id (uuid, FK profiles.id)
- goal_type (text) -- lose_weight, gain_muscle, maintain
- target_weight_kg (numeric, nullable)
- timeline_weeks (integer, nullable)
- created_at (timestamptz)
```

### Table: health_conditions
```sql
- id (uuid, PK)
- user_id (uuid, FK profiles.id)
- condition_name (text)
- severity (text, nullable)
- notes (text, nullable)
- created_at (timestamptz)
```

### Table: dietary_preferences
```sql
- id (uuid, PK)
- user_id (uuid, FK profiles.id)
- diet_type (text) -- vegetarian, non_vegetarian, vegan
- allergies (text[], nullable)
- cuisine_preferences (text[], nullable)
- budget_range (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### Table: nutrition_targets
```sql
- id (uuid, PK)
- user_id (uuid, FK profiles.id)
- daily_calories (integer)
- protein_grams (numeric)
- carbs_grams (numeric)
- fats_grams (numeric)
- calculated_at (timestamptz)
- is_active (boolean)
```

### Table: meal_plans
```sql
- id (uuid, PK)
- user_id (uuid, FK profiles.id)
- date (date)
- meal_type (text) -- breakfast, lunch, dinner, snack
- recipe_name (text)
- recipe_instructions (text)
- ingredients (jsonb)
- calories (integer)
- protein (numeric)
- carbs (numeric)
- fats (numeric)
- is_completed (boolean, default false)
- created_at (timestamptz)
```

### Table: shopping_lists
```sql
- id (uuid, PK)
- user_id (uuid, FK profiles.id)
- items (jsonb)
- estimated_cost (numeric, nullable)
- week_start_date (date)
- created_at (timestamptz)
```

### Table: workouts
```sql
- id (uuid, PK)
- name (text)
- description (text)
- duration_minutes (integer)
- difficulty_level (text)
- exercise_list (jsonb)
- condition_tags (text[])
- created_at (timestamptz)
```

### Table: workout_logs
```sql
- id (uuid, PK)
- user_id (uuid, FK profiles.id)
- workout_id (uuid, FK workouts.id, nullable)
- completed_at (timestamptz)
- duration_minutes (integer)
- notes (text, nullable)
```

### Table: weight_logs
```sql
- id (uuid, PK)
- user_id (uuid, FK profiles.id)
- weight_kg (numeric)
- logged_at (timestamptz)
- notes (text, nullable)
```

### Table: achievements
```sql
- id (uuid, PK)
- user_id (uuid, FK profiles.id)
- badge_type (text)
- badge_name (text)
- description (text)
- earned_at (timestamptz)
```

### Table: chat_history
```sql
- id (uuid, PK)
- user_id (uuid, FK profiles.id)
- message (text)
- role (text) -- user, assistant
- created_at (timestamptz)
```

## 5. App Navigation Structure

```
/
├── /auth (Sign In / Sign Up)
├── /onboarding
│   ├── /basic-info
│   ├── /goals
│   ├── /health-conditions
│   └── /dietary-preferences
├── /dashboard (Main Hub)
├── /meals
│   ├── /recipe/:id
│   └── /shopping-list
├── /workout
│   ├── /exercise/:id
│   └── /session
├── /progress
├── /chat
├── /profile
└── /notifications
```

### Bottom Navigation (Main 5 Tabs)
1. Dashboard (Home)
2. Meals
3. Workout
4. Progress
5. Profile

### Floating Action Button
- AI Chat (accessible from all screens)

## 6. Development Roadmap & Milestones

### Week 1-2: Planning & Setup ✓
- [x] Finalize requirements
- [x] Database schema design
- [x] User stories documentation
- [ ] UI/UX design mockups

### Week 3-4: Authentication & Onboarding
- [ ] Implement Supabase Auth
- [ ] Create sign up/sign in flows
- [ ] Build 4-step onboarding wizard
- [ ] Set up database tables and RLS policies
- [ ] Create profiles table with trigger

### Week 5-6: Core Dashboard & Navigation
- [ ] Build bottom navigation component
- [ ] Create dashboard layout
- [ ] Implement data fetching hooks
- [ ] Add loading states and error handling

### Week 7-8: Nutrition Features
- [ ] Implement nutrition calculator logic
- [ ] AI meal plan generation (GPT-4 integration)
- [ ] Meal planning UI
- [ ] Recipe details pages
- [ ] Shopping list generation

### Week 9-10: Workout Features
- [ ] Seed workout database
- [ ] Workout recommendation algorithm
- [ ] Exercise library UI
- [ ] Workout session timer
- [ ] Workout logging

### Week 11-12: Progress & AI Chat
- [ ] Weight tracking with charts
- [ ] Achievement system
- [ ] Streak counters
- [ ] AI chat interface
- [ ] Chat history persistence

### Week 13-14: Testing & Polish
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] PWA configuration
- [ ] Bug fixes and refinements
- [ ] User acceptance testing

### Week 15: Launch Preparation
- [ ] Final QA
- [ ] Documentation
- [ ] Deployment
- [ ] Marketing materials

## 7. Success Metrics

### Technical Metrics
- Page load time < 1.5s
- API response time < 500ms
- Zero critical security vulnerabilities
- 90%+ test coverage for core features

### User Metrics
- 50%+ user retention after 7 days
- 3+ workout sessions per week average
- 90%+ accuracy in nutrition calculations
- 4/5+ user satisfaction rating

## 8. Technical Stack Confirmation

### Frontend
- React 18 with Vite
- TypeScript
- Tailwind CSS
- React Router DOM
- React Query for data fetching
- React Hook Form for forms

### Backend
- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Storage (for progress photos)
- Supabase Realtime

### AI Integration
- OpenAI GPT-4o for meal planning
- OpenAI GPT-4o for chat assistant

### External APIs
- USDA FoodData Central API (nutrition data)
- Spoonacular API (recipe suggestions)

### PWA Features
- Service Workers
- Web Push Notifications
- Offline capability
- Install prompts

## 9. Risk Assessment

### High Risk
- **AI API costs**: Mitigate with response caching and rate limiting
- **Nutrition accuracy**: Use verified databases, add disclaimers

### Medium Risk
- **User engagement**: Address with gamification and notifications
- **Performance with large datasets**: Implement pagination and lazy loading

### Low Risk
- **Browser compatibility**: Test on major browsers, use polyfills
- **Offline sync conflicts**: Implement conflict resolution strategy

## 10. Next Steps

1. **Review & Approve**: Stakeholder review of this document
2. **Design Phase**: Create UI/UX mockups in Figma
3. **Environment Setup**: Initialize Supabase project, configure secrets
4. **Sprint 1 Start**: Begin Week 3-4 milestone (Authentication)
