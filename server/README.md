# Cookie Haven - Stripe Payment Server

This is the backend server for handling Stripe payments in the Cookie Haven mobile app.

## 🚀 Quick Deploy to Vercel (Recommended)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Navigate to server folder

```bash
cd server
```

### Step 3: Install dependencies

```bash
npm install
```

### Step 4: Deploy to Vercel

```bash
vercel
```

Follow the prompts:

- Set up and deploy? **Yes**
- Which scope? Choose your account
- Link to existing project? **No**
- Project name? `cookie-haven-stripe-server` (or any name)
- Directory? `./` (current directory)

### Step 5: Add Environment Variable

After deployment, add your Stripe secret key:

```bash
vercel env add STRIPE_SECRET_KEY
```

Paste your Stripe secret key when prompted.

### Step 6: Redeploy with environment variable

```bash
vercel --prod
```

### Step 7: Update Your App

Copy the production URL (e.g., `https://cookie-haven-stripe-server.vercel.app`)

Update `.env.production` in the root of your project:

```
VITE_STRIPE_SERVER_URL=https://your-vercel-url.vercel.app
```

### Step 8: Rebuild Your App

```bash
npm run build
npx cap sync android
```

---

## 🧪 Local Testing

### Start the server locally:

```bash
cd server
npm install
npm start
```

Server will run on http://localhost:4242

---

## 📱 Alternative: Deploy to Railway

1. Go to https://railway.app
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variable: `STRIPE_SECRET_KEY`
6. Railway will auto-deploy your server
7. Copy the public URL and update `.env.production`

---

## 🔑 Get Your Stripe Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Secret key** (starts with `sk_test_`)
3. Add it to your deployment environment variables

---

## ✅ Testing

Test your deployed server:

```bash
curl https://your-server-url.vercel.app/
```

You should see:

```json
{
  "status": "ok",
  "message": "Cookie Haven Stripe Server is running!",
  "timestamp": "..."
}
```

---

## 📞 Support

If you have issues, check:

- ✅ Stripe secret key is correctly set
- ✅ Server is deployed and accessible
- ✅ `.env.production` has the correct URL
- ✅ App is rebuilt after updating environment variables
