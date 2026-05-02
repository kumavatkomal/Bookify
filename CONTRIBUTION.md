# 🤝 Contribution Guide - Team Sarthak

> **Hackathon Timeline**: 24 hours  
> **Team Members**: Yashodip More (Lead) | Komal Kumavat  
> **Strategy**: Parallel development with clear task division

---

## 📋 Table of Contents
1. [Branch Strategy](#branch-strategy)
2. [Task Distribution](#task-distribution)
3. [Git Workflow](#git-workflow)
4. [Development Timeline](#development-timeline)
5. [Code Standards](#code-standards)
6. [Testing Checklist](#testing-checklist)

---

## 🌿 Branch Strategy

### Main Branches
```
main (production-ready)
  ↓
develop (integration branch)
  ↓
feature/* (individual features)
```

### Branch Naming Convention
```
feature/auth-system          # Authentication & OTP
feature/appointment-crud     # Appointment type management
feature/booking-engine       # Core booking logic
feature/ai-integration       # Groq AI chat widget
feature/email-system         # Nodemailer setup
feature/organiser-dashboard  # Organiser views
feature/admin-panel          # Admin functionality
feature/ui-components        # Reusable UI components
feature/slot-generation      # Slot engine logic
```

---

## 👨‍💻 Task Distribution

### 🔥 Yashodip More (Lead Developer) - Hard Tasks

#### Phase 1: Core Backend & Infrastructure (Hours 0-6)
- [ ] **Database Setup**
  - Branch: `feature/database-setup`
  - Tasks:
    - Complete Prisma schema implementation
    - Database migrations and seeding
    - Prisma client configuration
  - Files: `prisma/schema.prisma`, `prisma/seed.ts`, `src/lib/prisma.ts`

- [ ] **Authentication System**
  - Branch: `feature/auth-system`
  - Tasks:
    - NextAuth configuration with JWT
    - Credentials provider setup
    - Password hashing with bcrypt
    - Session management
    - Middleware for route protection
  - Files: `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/middleware.ts`

- [ ] **Email System**
  - Branch: `feature/email-system`
  - Tasks:
    - Nodemailer transporter setup
    - OTP generation and verification
    - Email templates (HTML)
    - Async email sending
  - Files: `src/lib/email.ts`, `src/app/api/register/route.ts`, `src/app/api/verify-otp/route.ts`

#### Phase 2: Core Booking Logic (Hours 6-12)
- [ ] **Slot Generation Engine**
  - Branch: `feature/slot-generation`
  - Tasks:
    - Dynamic slot generation algorithm
    - Weekly schedule parsing
    - Capacity calculation
    - Overlap detection
  - Files: `src/lib/slots.ts`, `src/app/api/slots/route.ts`

- [ ] **Booking Engine with Double-Booking Prevention**
  - Branch: `feature/booking-engine`
  - Tasks:
    - Transaction-based booking creation
    - PostgreSQL row-level locking (`SELECT ... FOR UPDATE`)
    - Conflict resolution
    - Status management (PENDING, CONFIRMED, CANCELLED)
  - Files: `src/app/api/bookings/route.ts`, `src/app/api/bookings/[id]/route.ts`

- [ ] **AI Integration (Groq)**
  - Branch: `feature/ai-integration`
  - Tasks:
    - Groq SDK setup
    - Prompt engineering for slot suggestions
    - Natural language parsing
    - Slot recommendation logic
  - Files: `src/lib/groq.ts`, `src/app/api/ai/suggest/route.ts`

#### Phase 3: Advanced Features (Hours 12-18)
- [ ] **Appointment Type API**
  - Branch: `feature/appointment-crud`
  - Tasks:
    - CRUD operations for appointment types
    - Publish/unpublish logic
    - Share token generation
    - Provider assignment
  - Files: `src/app/api/appointment-types/route.ts`, `src/app/api/appointment-types/[id]/route.ts`

- [ ] **Admin Panel Backend**
  - Branch: `feature/admin-panel`
  - Tasks:
    - User management API
    - Role-based access control
    - User activation/deactivation
  - Files: `src/app/api/users/route.ts`, `src/app/api/users/[id]/route.ts`

---

### 🎨 Komal Kumavat (Frontend Developer) - UI/UX Tasks

#### Phase 1: Authentication UI (Hours 0-4)
- [ ] **Auth Pages**
  - Branch: `feature/auth-ui`
  - Tasks:
    - Login page with form validation
    - Signup page with password strength indicator
    - OTP verification page
    - Forgot password page
  - Files: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx`, `src/app/(auth)/verify-otp/page.tsx`

- [ ] **Reusable UI Components**
  - Branch: `feature/ui-components`
  - Tasks:
    - Button, Input, Modal, Badge, Card components
    - Spinner/Loading states
    - Toast notification setup
  - Files: `src/components/ui/*.tsx`

#### Phase 2: Customer Booking Flow (Hours 4-10)
- [ ] **Home Page & Appointment Listing**
  - Branch: `feature/customer-pages`
  - Tasks:
    - Published appointment types grid
    - Search and filter functionality
    - Appointment card component
  - Files: `src/app/(customer)/page.tsx`, `src/components/booking/AppointmentCard.tsx`

- [ ] **Booking Flow UI**
  - Branch: `feature/booking-ui`
  - Tasks:
    - Multi-step booking form
    - Date picker (Calendar component)
    - Slot picker with availability indicators
    - Capacity selector
    - Questions form (dynamic)
    - Booking summary modal
  - Files: `src/app/(customer)/booking/[typeId]/page.tsx`, `src/components/booking/*.tsx`

- [ ] **Confirmation Page**
  - Branch: `feature/confirmation-page`
  - Tasks:
    - Booking confirmation display
    - Add to calendar button
    - Confirmation code display
  - Files: `src/app/(customer)/confirmation/[bookingId]/page.tsx`

#### Phase 3: Dashboards (Hours 10-16)
- [ ] **Organiser Dashboard**
  - Branch: `feature/organiser-dashboard`
  - Tasks:
    - Stats cards (total bookings, pending, etc.)
    - Appointment types list with publish toggle
    - Bookings table with filters
    - Create/Edit appointment type form
  - Files: `src/app/(organiser)/**/*.tsx`, `src/components/dashboard/*.tsx`

- [ ] **Admin Dashboard**
  - Branch: `feature/admin-ui`
  - Tasks:
    - User management table
    - Role badges and filters
    - Activate/deactivate toggle
    - Role change dropdown
  - Files: `src/app/(admin)/**/*.tsx`

#### Phase 4: AI Chat Widget (Hours 16-20)
- [ ] **AI Chat Component**
  - Branch: `feature/ai-chat-ui`
  - Tasks:
    - Floating chat button
    - Chat panel with message history
    - Slot suggestion display
    - "Book this slot" action button
  - Files: `src/components/ai/AIChatWidget.tsx`

#### Phase 5: Polish & Responsive (Hours 20-24)
- [ ] **Final Polish**
  - Branch: `feature/ui-polish`
  - Tasks:
    - Mobile responsiveness
    - Loading states everywhere
    - Error handling UI
    - Accessibility improvements
    - Dark mode (if time permits)

---

## 🔄 Git Workflow

### Step-by-Step Process

#### 1. Start Working on a Task
```bash
# Make sure you're on develop branch
git checkout develop
git pull origin develop

# Create your feature branch
git checkout -b feature/your-feature-name
```

#### 2. Make Changes
```bash
# Make your code changes
# Test locally

# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: add slot generation algorithm with capacity check"
```

#### 3. Push to Remote
```bash
# Push your branch to GitHub
git push -u origin feature/your-feature-name
```

#### 4. Create Pull Request
1. Go to GitHub repository
2. Click "Compare & pull request"
3. Set base branch to `develop`
4. Add description of changes
5. Request review from team member
6. Wait for approval

#### 5. Merge to Develop
```bash
# After PR approval, merge on GitHub
# Then update your local develop
git checkout develop
git pull origin develop

# Delete your feature branch
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

#### 6. Final Merge to Main
```bash
# Only at the end of hackathon
# Merge develop to main
git checkout main
git merge develop
git push origin main
```

---

## ⏱️ Development Timeline

### Hour 0-6: Foundation
- **Yashodip**: Database + Auth + Email
- **Komal**: Auth UI + Base Components
- **Checkpoint**: Can signup, verify OTP, login ✅

### Hour 6-12: Core Features
- **Yashodip**: Slot Engine + Booking API + AI
- **Komal**: Booking Flow UI + Home Page
- **Checkpoint**: Can book appointments end-to-end ✅

### Hour 12-18: Dashboards
- **Yashodip**: Appointment CRUD + Admin API
- **Komal**: Organiser Dashboard + Admin UI
- **Checkpoint**: Full organiser and admin functionality ✅

### Hour 18-22: AI & Polish
- **Yashodip**: AI refinement + Bug fixes
- **Komal**: AI Chat Widget + Responsive design
- **Checkpoint**: AI booking works, UI polished ✅

### Hour 22-24: Testing & Demo Prep
- **Both**: Integration testing, demo data, presentation prep
- **Checkpoint**: Ready to present! 🎉

---

## 📝 Code Standards

### Commit Message Format
```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc.
refactor: code restructuring
test: adding tests
chore: updating build tasks, package manager configs, etc.
```

### TypeScript Rules
- ✅ Always use TypeScript, no `any` types
- ✅ Define interfaces for all data structures
- ✅ Use Zod for runtime validation
- ✅ Export types from `src/types/index.ts`

### Component Structure
```tsx
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

// 2. Types/Interfaces
interface Props {
  title: string
  onSubmit: () => void
}

// 3. Component
export function MyComponent({ title, onSubmit }: Props) {
  // 4. State
  const [loading, setLoading] = useState(false)
  
  // 5. Handlers
  const handleClick = () => {
    setLoading(true)
    onSubmit()
  }
  
  // 6. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick} disabled={loading}>
        Submit
      </Button>
    </div>
  )
}
```

### API Route Structure
```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // 1. Auth check
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // 2. Validation
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }
    
    // 3. Business logic
    const data = await prisma.example.findUnique({ where: { id } })
    
    // 4. Response
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## ✅ Testing Checklist

### Before Each Commit
- [ ] Code compiles without errors (`npm run build`)
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Feature works as expected locally

### Before Pull Request
- [ ] All related files committed
- [ ] Descriptive commit messages
- [ ] No merge conflicts with develop
- [ ] Tested on both desktop and mobile (if UI)

### Before Final Merge to Main
- [ ] All features working end-to-end
- [ ] No broken links or 404 pages
- [ ] All API routes return proper status codes
- [ ] Email sending works
- [ ] AI chat responds correctly
- [ ] Database seeded with demo data
- [ ] Environment variables documented in SECRETS.md

---

## 🚨 Emergency Protocols

### If Something Breaks
1. **Don't panic** - We have version control
2. **Check the error** - Read console/terminal carefully
3. **Ask teammate** - Quick Slack/Discord message
4. **Revert if needed** - `git revert <commit-hash>`

### If Merge Conflicts
```bash
# Update your branch with latest develop
git checkout develop
git pull origin develop
git checkout feature/your-branch
git merge develop

# Resolve conflicts in VS Code
# Test that everything still works
git add .
git commit -m "fix: resolve merge conflicts"
git push
```

### If Running Out of Time
**Priority Order:**
1. Core booking flow (must work)
2. AI integration (our differentiator)
3. Organiser dashboard (judges will check)
4. Admin panel (nice to have)
5. UI polish (last priority)

---

## 📞 Communication

### Quick Sync Points
- **Hour 6**: Check Phase 1 completion
- **Hour 12**: Check Phase 2 completion
- **Hour 18**: Check Phase 3 completion
- **Hour 22**: Final integration test

### Status Updates
Post in team chat:
```
✅ Completed: [feature name]
🚧 In Progress: [feature name]
🔴 Blocked: [issue description]
```

---

## 🎯 Success Criteria

### Must Have (MVP)
- ✅ User can signup, verify OTP, login
- ✅ Organiser can create appointment types
- ✅ Customer can book appointments
- ✅ No double bookings possible
- ✅ Email confirmations sent
- ✅ AI chat suggests slots

### Nice to Have
- ✅ Organiser analytics dashboard
- ✅ Admin user management
- ✅ Mobile responsive
- ✅ Dark mode

### Demo Ready
- ✅ Seeded with realistic data
- ✅ All features work smoothly
- ✅ No console errors
- ✅ Fast loading times
- ✅ Professional UI

---

## 🏆 Let's Win This!

**Remember:**
- Commit often, push regularly
- Test before pushing
- Communicate blockers immediately
- Help each other when stuck
- Stay focused on the goal

**We've got this! 💪**

---

<div align="center">

**Team Sarthak - Odoo Hackathon @ VIT Pune**

*Built with ❤️ and lots of ☕*

</div>
