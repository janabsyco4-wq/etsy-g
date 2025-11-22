# Enable Gemini API - Step by Step

## Problem:
API key valid hai but project mein API enable nahi hai.

## Solution:

### Method 1: Enable API in Console (Recommended)

1. Open this link in browser:
   https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com

2. Top pe project selector mein apna project select karo
   (jisme API key banaya tha)

3. "ENABLE" button click karo

4. Wait 1-2 minutes

5. Test karo: `node test-gemini-only.js`

---

### Method 2: Create API Key with Pre-enabled Project

1. Go to: https://aistudio.google.com/app/apikey

2. Click "Create API key"

3. Select "Create API key in new project" (NOT existing project)

4. Copy the new key

5. Replace in .env file

---

### Method 3: Use gcloud CLI

```bash
gcloud services enable generativelanguage.googleapis.com
```

---

## Current API Key:
AIzaSyBUZoiAETxSX09V8zXH65mG7CBVuiEZ97I

## Test Command:
```bash
node test-gemini-only.js
```

## If Still Not Working:
The fallback optimization is already working perfectly!
Your system works without AI - it uses rule-based SEO optimization.
