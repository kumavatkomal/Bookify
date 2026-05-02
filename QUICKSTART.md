# ⚡ Quick Start Guide - 24 Hour Hackathon

> **Team Sarthak** | Yashodip More & Komal Kumavat  
> **Goal**: Win Odoo Hackathon @ VIT Pune with AI-powered booking system

---

## 🎯 What We're Building

**AppointEase** - An appointment booking system with:
- 🤖 **AI-powered slot suggestions** (Groq llama-3.3-70b)
- 🔒 **Real-time double-booking prevention** (PostgreSQL locking)
- 📧 **Complete email lifecycle** (OTP, confirmations, reminders)
- 📊 **Multi-role dashboards** (Customer, Organiser, Admin)

---

## 🚀 Setup (15 minutes)

### 1. Clone & Install
```bash
cd Bookify
npm install
```

### 2. Get API Keys (See SECRETS.md for details)
- **Database**: [neon.tech](https://neon.tech) - Free PostgreSQL
- **AI**: [console.groq.com](https://console.groq.com) - Free Groq API
- **Email**: Gmail App Password (see SECRETS.md)

### 3. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your keys
```

### 4. Setup Database
```bash
npx prisma db push
npx prisma generate
```

### 5. Run Dev Server
```bash
npm run dev
# Open http://localhost:3000
```

---

## 📋 Task Distribution

### Yashodip (Hard Backend Tasks)
- ✅ Database schema & Prisma setup
- ✅ Authentication (NextAuth + JWT)
- ✅ Email system (Nodemailer + OTP)
- ✅ Slot generation engine
- ✅ Booking API with row locking
- ✅ AI integration (Groq)
- ✅ Admin APIs

### Komal (Frontend & UI)
- ✅ Auth pages (Login, Signup, OTP)
- ✅ UI components library
- ✅ Customer booking flow
- ✅ Organiser dashboard
- ✅ Admin panel UI
- ✅ AI chat widget
- ✅ Responsive design

---

## 🌿 Git Workflow

```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# Make changes, then commit
git add .
git commit -m "feat: add your feature"
git push -u origin feature/your-feature-name

# Create PR on GitHub to merge into develop
```

**Branch Strategy:**
```
main (final demo)
  ↓
develop (integration)
  ↓
feature/* (individual features)
```

---

## ⏱️ Timeline (24 Hours)

### Hours 0-6: Foundation
- Database + Auth + Email setup
- Auth UI + Base components
- **Checkpoint**: Can signup, verify OTP, login ✅

### Hours 6-12: Core Features
- Slot engine + Booking API + AI
- Booking flow UI + Home page
- **Checkpoint**: Can book appointments ✅

### Hours 12-18: Dashboards
- Appointment CRUD + Admin API
- Organiser + Admin dashboards
- **Checkpoint**: Full functionality ✅

### Hours 18-22: AI & Polish
- AI refinement + Bug fixes
- AI chat widget + Responsive design
- **Checkpoint**: AI works, UI polished ✅

### Hours 22-24: Demo Prep
- Integration testing
- Demo data seeding
- Presentation prep
- **Checkpoint**: Ready to present! 🎉

---

## 🎬 Demo Script (5 minutes)

### Act 1: Customer Books (2 min)
1. Browse appointment types
2. Select slot from calendar
3. Fill questions
4. Confirm booking
5. Show email confirmation

### Act 2: AI Assistant (1.5 min)
1. Open AI chat
2. Type: "Book me Thursday morning"
3. AI suggests slot
4. Click "Book this slot"
5. **Wow factor!** 🤯

### Act 3: Organiser View (1 min)
1. Create appointment type
2. View bookings table
3. Show analytics charts

### Act 4: Admin Panel (30 sec)
1. User management
2. Role changes

**Closing**: "We solved all challenges + added AI that no other team has!"

---

## 🔑 Key Differentiators

| Feature | Why It Wins |
|---------|-------------|
| **AI Booking** | No other team will have this |
| **Double-Booking Prevention** | Solves spec's explicit challenge |
| **Email Lifecycle** | Most teams skip email |
| **Smart Slots** | Dynamic, not stored |
| **Share Links** | Professional feature |

---

## 📚 Important Files

- **README.md** - Professional project documentation
- **CONTRIBUTION.md** - Git workflow & task distribution
- **SECRETS.md** - API keys setup guide
- **DEV.md** - Complete technical documentation
- **.env.example** - Environment variables template

---

## 🆘 Emergency Contacts

### If Something Breaks
1. Check console/terminal errors
2. Ask teammate immediately
3. Check SECRETS.md for setup issues
4. Revert commit if needed: `git revert <hash>`

### Priority if Running Out of Time
1. Core booking flow (must work)
2. AI integration (our edge)
3. Organiser dashboard
4. Admin panel
5. UI polish

---

## ✅ Pre-Demo Checklist

- [ ] All features work end-to-end
- [ ] Database seeded with demo data
- [ ] No console errors
- [ ] Email sending works
- [ ] AI chat responds correctly
- [ ] Mobile responsive
- [ ] Fast loading times
- [ ] Professional UI

---

## 🏆 Success Metrics

### Must Have (MVP)
- ✅ Signup → OTP → Login works
- ✅ Create appointment types
- ✅ Book appointments
- ✅ No double bookings
- ✅ Email confirmations
- ✅ AI suggests slots

### Nice to Have
- ✅ Analytics dashboard
- ✅ Admin user management
- ✅ Mobile responsive
- ✅ Dark mode

---

## 💡 Pro Tips

1. **Commit often** - Every working feature
2. **Test before pushing** - Avoid breaking develop
3. **Communicate blockers** - Don't stay stuck
4. **Help each other** - We're a team
5. **Stay focused** - 24 hours flies by!

---

## 🎯 Let's Win This!

**Remember:**
- Our AI integration is the **wow factor**
- Double-booking prevention shows **technical depth**
- Complete email system shows **production thinking**
- Clean UI shows **professionalism**

**We've got everything to win! 💪**

---

<div align="center">

**Team Sarthak - Odoo Hackathon @ VIT Pune**

*Built with ❤️, ☕, and 🤖*

[README](./README.md) • [Contribution Guide](./CONTRIBUTION.md) • [Secrets Setup](./SECRETS.md) • [Full Docs](./DEV.md)

</div>
