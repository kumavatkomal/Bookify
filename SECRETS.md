# 🔐 SECRETS.md - Environment Setup Guide

> **⚠️ IMPORTANT**: Never commit `.env.local` to Git! This file contains sensitive credentials.

This guide walks you through obtaining all required API keys, secrets, and credentials for the AppointEase project.

---

## 📋 Table of Contents
1. [Environment Variables Overview](#environment-variables-overview)
2. [Database Setup (Neon.tech)](#1-database-setup-neontech)
3. [NextAuth Secret](#2-nextauth-secret)
4. [Groq AI API Key](#3-groq-ai-api-key)
5. [Email Setup (Gmail)](#4-email-setup-gmail)
6. [Alternative Email (Resend)](#5-alternative-email-resend)
7. [Complete .env.local Template](#complete-envlocal-template)
8. [Verification Checklist](#verification-checklist)

---

## 🌍 Environment Variables Overview

| Variable | Purpose | Required | Where to Get |
|----------|---------|----------|--------------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes | Neon.tech |
| `NEXTAUTH_SECRET` | JWT signing secret | ✅ Yes | Generate locally |
| `NEXTAUTH_URL` | App URL | ✅ Yes | `http://localhost:3000` (dev) |
| `GROQ_API_KEY` | AI chat functionality | ✅ Yes | Groq Console |
| `EMAIL_HOST` | SMTP server | ✅ Yes | Gmail/Resend |
| `EMAIL_PORT` | SMTP port | ✅ Yes | 587 (Gmail) |
| `EMAIL_SECURE` | Use TLS | ✅ Yes | false (Gmail) |
| `EMAIL_USER` | Email address | ✅ Yes | Your Gmail |
| `EMAIL_PASS` | Email password | ✅ Yes | Gmail App Password |
| `EMAIL_FROM` | Sender name | ✅ Yes | "AppointEase <your@email.com>" |
| `NEXT_PUBLIC_APP_URL` | Public app URL | ⚠️ Optional | Same as NEXTAUTH_URL |
| `NEXT_PUBLIC_APP_NAME` | App display name | ⚠️ Optional | "AppointEase" |

---

## 1. 🗄️ Database Setup (Neon.tech)

### Why Neon?
- ✅ Free tier with 0.5GB storage
- ✅ Serverless PostgreSQL
- ✅ Instant setup, no credit card required
- ✅ Perfect for hackathons

### Step-by-Step Setup

#### Step 1: Create Account
1. Go to [neon.tech](https://neon.tech)
2. Click **"Sign Up"**
3. Sign up with GitHub (fastest) or email

#### Step 2: Create Project
1. After login, click **"Create Project"**
2. Fill in:
   - **Project Name**: `appointment-app` (or any name)
   - **Region**: Choose closest to you (e.g., `US East (Ohio)`)
   - **PostgreSQL Version**: `15` (default)
3. Click **"Create Project"**

#### Step 3: Get Connection String
1. On the project dashboard, you'll see **"Connection Details"**
2. Click **"Connection string"** tab
3. Copy the connection string that looks like:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. **Important**: Make sure to select **"Pooled connection"** for better performance

#### Step 4: Add to .env.local
```env
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### Troubleshooting
- **Connection timeout**: Check if your IP is whitelisted (Neon allows all IPs by default)
- **SSL error**: Ensure `?sslmode=require` is at the end of the URL
- **Authentication failed**: Regenerate password in Neon dashboard

---

## 2. 🔑 NextAuth Secret

### What is it?
A random string used to sign and encrypt JWT tokens. Must be kept secret!

### How to Generate

#### Option 1: Using OpenSSL (Mac/Linux)
```bash
openssl rand -base64 32
```

#### Option 2: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### Option 3: Online Generator
1. Go to [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)
2. Copy the generated string

### Add to .env.local
```env
NEXTAUTH_SECRET="your_generated_32_character_secret_here"
```

### Example Output
```env
NEXTAUTH_SECRET="Xk8vN2pQ9mL5wR7tY3uI1oP4aS6dF8gH"
```

---

## 3. 🤖 Groq AI API Key

### Why Groq?
- ✅ **Free tier**: 14,400 requests/day
- ✅ **Fast inference**: 300+ tokens/second
- ✅ **llama-3.3-70b-versatile**: Powerful, accurate
- ✅ No credit card required

### Step-by-Step Setup

#### Step 1: Create Account
1. Go to [console.groq.com](https://console.groq.com)
2. Click **"Sign Up"**
3. Sign up with Google/GitHub or email

#### Step 2: Create API Key
1. After login, click **"API Keys"** in left sidebar
2. Click **"Create API Key"**
3. Give it a name: `appointment-app-hackathon`
4. Click **"Create"**
5. **IMPORTANT**: Copy the key immediately! It starts with `gsk_`
   - You won't be able to see it again
   - If you lose it, you'll need to create a new one

#### Step 3: Add to .env.local
```env
GROQ_API_KEY="gsk_your_actual_groq_api_key_here"
```

### Example
```env
GROQ_API_KEY="gsk_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
```

### Rate Limits (Free Tier)
- **Requests per day**: 14,400
- **Requests per minute**: 30
- **Tokens per minute**: 6,000

### Troubleshooting
- **401 Unauthorized**: Check if key is correct and starts with `gsk_`
- **429 Rate Limit**: You've exceeded free tier limits (unlikely in hackathon)
- **Model not found**: Use `llama-3.3-70b-versatile` (check spelling)

---

## 4. 📧 Email Setup (Gmail)

### Why Gmail?
- ✅ Free and reliable
- ✅ Easy to set up
- ✅ Works with Nodemailer
- ✅ Most team members already have Gmail

### Step-by-Step Setup

#### Step 1: Enable 2-Step Verification
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **"Security"** in left sidebar
3. Scroll to **"2-Step Verification"**
4. Click **"Get Started"** and follow the setup
5. **Important**: You MUST enable 2-Step Verification to create App Passwords

#### Step 2: Create App Password
1. After enabling 2-Step Verification, go back to **Security**
2. Scroll to **"2-Step Verification"** section
3. At the bottom, click **"App passwords"**
4. You might need to sign in again
5. In the "Select app" dropdown, choose **"Mail"**
6. In the "Select device" dropdown, choose **"Other (Custom name)"**
7. Type: `AppointEase Hackathon`
8. Click **"Generate"**
9. **IMPORTANT**: Copy the 16-character password (no spaces)
   - Example: `abcd efgh ijkl mnop` → use as `abcdefghijklmnop`

#### Step 3: Add to .env.local
```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="your.email@gmail.com"
EMAIL_PASS="abcdefghijklmnop"
EMAIL_FROM="AppointEase <your.email@gmail.com>"
```

### Complete Gmail Example
```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="yashodip.more@gmail.com"
EMAIL_PASS="xyzw abcd efgh ijkl"
EMAIL_FROM="AppointEase <yashodip.more@gmail.com>"
```

### Troubleshooting
- **"Invalid login"**: Make sure you're using App Password, NOT your Gmail password
- **"Less secure app"**: This error shouldn't appear with App Passwords
- **"Connection timeout"**: Check if port 587 is blocked by firewall
- **Emails going to spam**: Add SPF/DKIM records (not needed for hackathon)

---

## 5. 📨 Alternative Email (Resend)

### Why Resend?
- ✅ Easier setup than Gmail
- ✅ Better deliverability
- ✅ Free tier: 100 emails/day
- ✅ No 2-Step Verification needed

### Step-by-Step Setup

#### Step 1: Create Account
1. Go to [resend.com](https://resend.com)
2. Click **"Sign Up"**
3. Sign up with email

#### Step 2: Get API Key
1. After login, go to **"API Keys"** in sidebar
2. Click **"Create API Key"**
3. Name it: `appointment-app`
4. Copy the key (starts with `re_`)

#### Step 3: Add to .env.local
```env
EMAIL_HOST="smtp.resend.com"
EMAIL_PORT="465"
EMAIL_SECURE="true"
EMAIL_USER="resend"
EMAIL_PASS="re_your_resend_api_key_here"
EMAIL_FROM="AppointEase <onboarding@resend.dev>"
```

### Complete Resend Example
```env
EMAIL_HOST="smtp.resend.com"
EMAIL_PORT="465"
EMAIL_SECURE="true"
EMAIL_USER="resend"
EMAIL_PASS="re_abc123def456"
EMAIL_FROM="AppointEase <onboarding@resend.dev>"
```

### Note on Sender Email
- Free tier only allows sending from `onboarding@resend.dev`
- To use custom domain, you need to verify it (takes time)
- For hackathon, `onboarding@resend.dev` is fine

---

## 📄 Complete .env.local Template

Create a file named `.env.local` in the project root and paste this:

```env
# ─────────────────────────────────────────────
# DATABASE (Neon.tech)
# ─────────────────────────────────────────────
DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require"

# ─────────────────────────────────────────────
# NEXTAUTH
# ─────────────────────────────────────────────
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your_random_32_char_secret_here"

# Local dev URL (change for production)
NEXTAUTH_URL="http://localhost:3000"

# ─────────────────────────────────────────────
# GROQ AI API KEY
# ─────────────────────────────────────────────
# Get from: https://console.groq.com
GROQ_API_KEY="gsk_your_groq_api_key_here"

# ─────────────────────────────────────────────
# EMAIL (Gmail)
# ─────────────────────────────────────────────
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="your.email@gmail.com"
EMAIL_PASS="your_16char_app_password"
EMAIL_FROM="AppointEase <your.email@gmail.com>"

# ─────────────────────────────────────────────
# EMAIL (Resend Alternative)
# ─────────────────────────────────────────────
# Uncomment these and comment Gmail if using Resend
# EMAIL_HOST="smtp.resend.com"
# EMAIL_PORT="465"
# EMAIL_SECURE="true"
# EMAIL_USER="resend"
# EMAIL_PASS="re_your_resend_api_key"
# EMAIL_FROM="AppointEase <onboarding@resend.dev>"

# ─────────────────────────────────────────────
# APP CONFIG (Optional)
# ─────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="AppointEase"
```

---

## ✅ Verification Checklist

After setting up all environment variables, verify each one:

### Database Connection
```bash
# Test Prisma connection
npx prisma db push
```
✅ Should create tables without errors

### NextAuth
```bash
# Start dev server
npm run dev
```
✅ Should start without "NEXTAUTH_SECRET missing" error

### Groq API
```bash
# Test in Node.js
node -e "
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
groq.chat.completions.create({
  messages: [{ role: 'user', content: 'Hi' }],
  model: 'llama-3.3-70b-versatile'
}).then(r => console.log('✅ Groq works!', r.choices[0].message.content))
.catch(e => console.error('❌ Groq error:', e.message));
"
```
✅ Should print "✅ Groq works!" with AI response

### Email (Nodemailer)
```bash
# Test email sending
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});
transporter.sendMail({
  from: process.env.EMAIL_FROM,
  to: process.env.EMAIL_USER,
  subject: 'Test Email',
  text: 'If you receive this, email setup works!'
}).then(() => console.log('✅ Email sent!'))
.catch(e => console.error('❌ Email error:', e.message));
"
```
✅ Should send test email to your inbox

---

## 🚨 Common Issues & Solutions

### Issue: "DATABASE_URL is not defined"
**Solution**: Make sure `.env.local` is in the project root (same level as `package.json`)

### Issue: "Invalid connection string"
**Solution**: Check for typos, ensure `?sslmode=require` is at the end

### Issue: "GROQ_API_KEY invalid"
**Solution**: 
- Make sure key starts with `gsk_`
- No extra spaces or quotes
- Regenerate key if needed

### Issue: "Email authentication failed"
**Solution**:
- Gmail: Use App Password, not regular password
- Resend: Make sure key starts with `re_`
- Check for typos in EMAIL_USER and EMAIL_PASS

### Issue: "Port 587 connection refused"
**Solution**: 
- Check firewall settings
- Try port 465 with `EMAIL_SECURE="true"`
- Use Resend as alternative

---

## 🔒 Security Best Practices

### DO ✅
- Keep `.env.local` in `.gitignore`
- Use different secrets for dev and production
- Rotate API keys after hackathon
- Use environment variables in Vercel for deployment

### DON'T ❌
- Never commit `.env.local` to Git
- Never share API keys in Discord/Slack
- Never hardcode secrets in code
- Never use production DB for testing

---

## 📦 Deployment (Vercel)

When deploying to Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add ALL variables from `.env.local`
3. Update `NEXTAUTH_URL` to your production domain:
   ```env
   NEXTAUTH_URL="https://your-app.vercel.app"
   ```
4. Redeploy

---

## 🆘 Need Help?

### Quick Debugging
```bash
# Check if .env.local is loaded
npm run dev
# Look for "Loaded env from .env.local" in terminal

# Print all env vars (be careful, don't share output!)
node -e "console.log(process.env)"
```

### Contact Team
- **Yashodip**: [Slack/Discord handle]
- **Komal**: [Slack/Discord handle]

---

## 📚 Additional Resources

- [Neon.tech Docs](https://neon.tech/docs)
- [Groq API Docs](https://console.groq.com/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Nodemailer Docs](https://nodemailer.com)
- [Resend Docs](https://resend.com/docs)

---

<div align="center">

**🔐 Keep your secrets safe! 🔐**

*Last updated: Hackathon Day 1*

</div>
