# 🚀 Deployment Checklist for Buddify

## ⚠️ CRITICAL: Environment Variables

Your deployment has all the required environment variables, but **the VALUES must be correct**!

### 🔴 MUST FIX THESE VALUES:

```bash
# ❌ WRONG (if you have these values):
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ✅ CORRECT (replace with your actual deployment URL):
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

**Example for Vercel:**
- If your app is deployed at `https://buddify-komal.vercel.app`
- Then set: `NEXTAUTH_URL=https://buddify-komal.vercel.app`
- And set: `NEXT_PUBLIC_APP_URL=https://buddify-komal.vercel.app`

---

## 📋 Complete Environment Variables Checklist

### ✅ You Already Have These (verify values):

1. **DATABASE_URL** - Your Neon PostgreSQL connection string
   - Should start with `postgresql://`
   - Should end with `?sslmode=require`

2. **NEXTAUTH_SECRET** - Random 32+ character string
   - Generate with: `openssl rand -base64 32`
   - Should be different from localhost

3. **NEXTAUTH_URL** ⚠️ CRITICAL
   - Must be your production domain
   - Example: `https://buddify.vercel.app`
   - NOT `http://localhost:3000`

4. **GROQ_API_KEY** - Your Groq AI API key
   - Should start with `gsk_`

5. **EMAIL_HOST** - `smtp.gmail.com`

6. **EMAIL_PORT** - `587`

7. **EMAIL_SECURE** - `false`

8. **EMAIL_USER** - Your Gmail address

9. **EMAIL_PASS** - Your Gmail App Password (16 characters)

10. **EMAIL_FROM** - `Buddify <your.email@gmail.com>`

11. **NEXT_PUBLIC_APP_URL** ⚠️ CRITICAL
    - Must match NEXTAUTH_URL
    - Example: `https://buddify.vercel.app`
    - NOT `http://localhost:3000`

12. **NEXT_PUBLIC_APP_NAME** - `Buddify`

---

## 🔍 How to Check Your Deployment URL

### On Vercel:
1. Go to your project dashboard
2. Look for "Domains" section
3. Copy the `.vercel.app` URL
4. Use that URL for `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`

### On Netlify:
1. Go to Site settings
2. Look for "Site information"
3. Copy the `.netlify.app` URL
4. Use that URL for both variables

---

## 🐛 Debugging Login Issues

If login still doesn't work after fixing environment variables:

### 1. Check Browser Console (F12)
Look for errors like:
- `NEXTAUTH_URL` mismatch
- CORS errors
- Session errors

### 2. Check Deployment Logs
Look for:
- Database connection errors
- NextAuth configuration errors
- API route errors

### 3. Test These URLs Manually

Visit these URLs in your browser (replace with your domain):

```
https://your-app.vercel.app/api/auth/session
```
Should return: `{}` (empty object if not logged in)

```
https://your-app.vercel.app/api/auth/providers
```
Should return: `{"credentials": {...}}`

### 4. Clear Browser Data
- Clear cookies for your domain
- Clear cache
- Try in incognito mode

---

## ✅ After Fixing Environment Variables

1. **Redeploy** your application (Vercel will auto-redeploy on env change)
2. **Wait** 1-2 minutes for deployment to complete
3. **Clear** browser cookies and cache
4. **Test** login again

---

## 🆘 Still Not Working?

If login still fails after:
1. ✅ Setting correct `NEXTAUTH_URL` to production domain
2. ✅ Setting correct `NEXT_PUBLIC_APP_URL` to production domain
3. ✅ Redeploying
4. ✅ Clearing browser cache/cookies

Then check:
- Browser console for specific error messages
- Deployment logs for server errors
- Database connection (try to signup new user)

Share the error message from browser console for further debugging.
