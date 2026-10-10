# Ionic Appflow Deployment Guide for Cookie App

## Overview

This guide will help you deploy your Cookie App to iOS TestFlight using Ionic Appflow - no Mac required!

---

## Prerequisites Checklist

- [x] GitHub Desktop installed
- [x] Ionic CLI installed (`npm install -g @ionic/cli`)
- [ ] Ionic Appflow account (free tier)
- [ ] Apple Developer Account ($99/year)
- [ ] Git repository published to GitHub

---

## Step 1: Create Ionic Appflow Account

1. Go to: https://dashboard.ionicframework.com/signup
2. Sign up with your email or GitHub account
3. Choose the **Free (Hobby)** plan to start
   - Free tier includes: Limited builds per month
   - You can upgrade later if needed

---

## Step 2: Publish Your Code to GitHub

### Using GitHub Desktop:

1. **Open GitHub Desktop**
2. **Add this repository:**

   - File → Add Local Repository
   - Select: `C:\Users\PaulB\cookie_app`
   - If not initialized, click "Create a repository"

3. **Make your first commit:**

   - Review the changes shown
   - Write a commit message: "Initial commit - Cookie App"
   - Click **Commit to main**

4. **Publish to GitHub:**
   - Click **"Publish repository"**
   - Set name: `cookie_app`
   - Choose: **Private** (recommended)
   - Click **Publish repository**

---

## Step 3: Link Your App to Ionic Appflow

### Option A: Via Ionic Dashboard (Easiest)

1. Go to: https://dashboard.ionicframework.com/
2. Click **"New App"**
3. Choose **"Import Existing App"**
4. Connect your GitHub account
5. Select the `cookie_app` repository
6. Click **"Import"**

### Option B: Via Command Line (if you have Git installed)

```powershell
# Login to Ionic
ionic login

# Link this app to Appflow
ionic link

# Follow the prompts to connect your app
```

---

## Step 4: Configure App Settings in Appflow

1. In the Appflow dashboard, go to your app
2. Navigate to **Settings → App**
3. Verify these settings:
   - **App Name:** Cookie App
   - **App ID:** `com.cookieapp.app` (or your chosen Bundle ID)
   - **Package Name:** Same as App ID for iOS

---

## Step 5: Set Up iOS Build Configuration

### 5.1: Get Apple Developer Credentials

**You'll need:**

- Apple Developer Account (sign up at https://developer.apple.com - $99/year)
- App Store Connect access

### 5.2: Create iOS Certificates (Appflow can help!)

1. In Appflow dashboard, go to **Build → Certificates**
2. Click **"Add Certificate"**
3. Choose **"iOS"**
4. Appflow offers **automated certificate generation**:
   - Click **"Generate Certificate"**
   - Sign in with your Apple Developer credentials
   - Appflow will automatically create and manage certificates

**OR manually upload:**

- Development Certificate (.p12)
- Distribution Certificate (.p12)
- Provisioning Profiles

### 5.3: Create App ID in Apple Developer Portal

1. Go to: https://developer.apple.com/account
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+ (Add)**
4. Select **App IDs** → **Continue**
5. Enter:
   - Description: `Cookie App`
   - Bundle ID: `com.cookieapp.app` (use your Bundle ID from capacitor.config.ts)
6. Select capabilities your app needs:
   - [ ] Push Notifications (if needed)
   - [ ] In-App Purchase (if needed)
   - [ ] Associated Domains (if needed)
7. Click **Continue** → **Register**

---

## Step 6: Build Your iOS App

1. In Appflow dashboard, navigate to **Build → Builds**
2. Click **"New Build"**
3. Configure build:
   - **Platform:** iOS
   - **Build Type:**
     - Choose **"App Store"** for TestFlight/production
     - Or **"Development"** for local testing
   - **Commit:** Select latest commit
   - **Certificate:** Select the certificate you created
   - **Profile Type:** App Store or Development
4. Click **"Build"**

**Build Time:** Usually takes 5-15 minutes

---

## Step 7: Download or Deploy to TestFlight

### Option A: Download .ipa file

1. Once build completes, click **"Download"**
2. You'll get an `.ipa` file
3. Upload manually to App Store Connect

### Option B: Direct TestFlight Deploy (if available in your plan)

1. After build completes, click **"Deploy"**
2. Select **"Apple App Store"**
3. Enter your App Store Connect credentials
4. Appflow will upload directly to TestFlight!

---

## Step 8: Configure TestFlight in App Store Connect

1. Go to: https://appstoreconnect.apple.com
2. Click **"My Apps"**
3. Click **"+" → New App**
4. Fill in details:
   - **Platform:** iOS
   - **Name:** Cookie App
   - **Primary Language:** English
   - **Bundle ID:** Select `com.cookieapp.app`
   - **SKU:** Any unique identifier (e.g., `cookie-app-001`)
5. Click **"Create"**

6. Navigate to **TestFlight** tab
7. Once your build appears (uploaded from Appflow):
   - Add test information
   - Add internal/external testers
   - Submit for Beta Review (for external testers)

---

## Step 9: Add Testers and Test!

### Internal Testers (no review needed):

1. In App Store Connect → TestFlight
2. Click **"Internal Testing"**
3. Add testers by email
4. They'll receive an invite to test via TestFlight app

### External Testers (requires Apple review):

1. Click **"External Testing"**
2. Create a new group
3. Add testers
4. Submit for Beta Review
5. Once approved (1-2 days), testers can install

---

## Common Issues & Solutions

### Build Fails:

- Check that all dependencies are in package.json
- Ensure capacitor.config.ts has correct Bundle ID
- Verify certificates are not expired

### Certificate Issues:

- Use Appflow's automatic certificate generation
- Make sure Bundle ID matches everywhere
- Check that provisioning profiles match certificates

### App Won't Install on Device:

- Ensure device UDID is in provisioning profile (for Development builds)
- Use App Store build for TestFlight (doesn't need UDID)

---

## Updating Your App

1. Make changes to your code
2. Commit and push to GitHub (using GitHub Desktop)
3. In Appflow, trigger a new build with the latest commit
4. Deploy to TestFlight
5. Testers will get automatic update notification

---

## Cost Breakdown

- **Ionic Appflow Free Tier:** Free (limited builds)
- **Ionic Appflow Starter Plan:** ~$29/month (more builds)
- **Apple Developer Account:** $99/year (required)
- **Total to start:** $99/year + free Appflow tier

---

## Useful Links

- Ionic Appflow Dashboard: https://dashboard.ionicframework.com/
- Ionic Appflow Docs: https://ionic.io/docs/appflow
- Apple Developer Portal: https://developer.apple.com/
- App Store Connect: https://appstoreconnect.apple.com/
- TestFlight Guide: https://developer.apple.com/testflight/

---

## Next Steps

1. ✅ Update app Bundle ID (already done: `com.cookieapp.app`)
2. ✅ Update app display name (already done: `Cookie App`)
3. ⬜ Create Ionic Appflow account
4. ⬜ Publish code to GitHub
5. ⬜ Link app to Appflow
6. ⬜ Get Apple Developer account
7. ⬜ Configure certificates
8. ⬜ Trigger first build
9. ⬜ Deploy to TestFlight
10. ⬜ Test on device!

---

## Support

If you run into issues:

- Ionic Appflow Support: https://ionic.io/support
- Ionic Community Forum: https://forum.ionicframework.com/
- Stack Overflow: Tag with `ionic-framework` and `appflow`

Good luck with your deployment! 🚀
