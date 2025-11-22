# 🛍️ Etsy Automation - AI-Powered Listing Creator

Complete automation workflow that takes product info, optimizes it with AI, saves to Google Sheets, creates Etsy listings, and sends email notifications.

## ✨ Features

- 📝 Beautiful web form for product input
- 🤖 AI-powered SEO optimization (Google Gemini)
- 📊 Automatic Google Sheets logging
- 🏪 Etsy listing creation with image upload
- 📧 Email notifications on success
- 🚀 Free hosting on Vercel

## 🎯 Tech Stack

- **Frontend:** HTML/CSS/JavaScript
- **Backend:** Node.js (Vercel Serverless)
- **AI:** Google Gemini API (Free)
- **Storage:** Google Sheets API (Free)
- **Marketplace:** Etsy API
- **Email:** Resend (Free tier)
- **Hosting:** Vercel (Free)

## 📋 Prerequisites

You'll need free accounts and API keys from:

1. **Google Gemini** - AI optimization
2. **Google Cloud** - Sheets API
3. **Etsy Developer** - Listing creation
4. **Resend** - Email notifications
5. **Vercel** - Hosting

## 🚀 Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Get API Keys

#### A. Google Gemini API (Free)
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy your API key

#### B. Google Sheets API (Free)
1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable "Google Sheets API"
4. Create Service Account:
   - Go to "Credentials" → "Create Credentials" → "Service Account"
   - Download JSON key file
5. Create a Google Sheet and share it with the service account email
6. Copy the Sheet ID from the URL

#### C. Etsy API (Free, but $0.20 per listing)
1. Go to https://www.etsy.com/developers/register
2. Create an app
3. Get your API Key
4. Set up OAuth 2.0 to get Access Token:
   - Follow: https://developers.etsy.com/documentation/essentials/authentication
5. Get your Shop ID from your Etsy shop URL

#### D. Resend API (Free - 3,000 emails/month)
1. Go to https://resend.com/signup
2. Verify your email
3. Create API key from dashboard
4. Add your notification email

#### E. Vercel Account (Free)
1. Go to https://vercel.com/signup
2. Sign up with GitHub/GitLab/Bitbucket

### 3. Configure Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Fill in your API keys:

```env
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CREDENTIALS={"type":"service_account",...}
GOOGLE_SHEET_ID=your_sheet_id
ETSY_API_KEY=your_etsy_key
ETSY_SHOP_ID=your_shop_id
ETSY_ACCESS_TOKEN=your_access_token
RESEND_API_KEY=your_resend_key
NOTIFICATION_EMAIL=your@email.com
```

### 4. Test Locally

```bash
npm run dev
```

Visit http://localhost:3000

### 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Or deploy via Vercel Dashboard:
1. Go to https://vercel.com/new
2. Import your Git repository
3. Add environment variables in Settings
4. Deploy!

## 📖 How It Works

1. **User fills form** → Product details + images
2. **AI optimization** → Gemini generates SEO-optimized content
3. **Google Sheets** → Logs original + optimized data
4. **Etsy API** → Creates listing with images
5. **Email sent** → Notification with listing link

## 🔧 Customization

### Change AI Model
Edit `api/submit.js` line 67:
```javascript
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
```

### Modify Email Template
Edit `api/submit.js` starting at line 280

### Adjust Form Fields
Edit `index.html` form section

## 💰 Cost Breakdown

- **Hosting:** FREE (Vercel)
- **AI:** FREE (Gemini 60 req/min)
- **Sheets:** FREE (Google)
- **Email:** FREE (3,000/month)
- **Etsy:** $0.20 per listing published

## 🐛 Troubleshooting

### "Gemini API Error"
- Check API key is valid
- Ensure you're within rate limits (60/min)

### "Google Sheets Error"
- Verify service account has access to sheet
- Check GOOGLE_CREDENTIALS JSON is valid

### "Etsy API Error"
- Confirm OAuth token is not expired
- Check shop ID is correct
- Ensure shipping/return policies are set

### "Email Not Sending"
- Verify Resend API key
- Check email address is valid
- Confirm you're within free tier limits

## 📚 Resources

- [Etsy API Docs](https://developers.etsy.com/documentation)
- [Google Gemini API](https://ai.google.dev/docs)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Resend Docs](https://resend.com/docs)
- [Vercel Docs](https://vercel.com/docs)

## 🤝 Support

Need help? Check:
1. Environment variables are set correctly
2. All API keys are valid and active
3. Services are within free tier limits
4. Console logs for detailed errors

## 📝 License

MIT - Free to use and modify!

---

Built with ❤️ using Node.js + Vercel
