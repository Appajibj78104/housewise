# HouseWise Deployment Guide

## 🚀 Deployment Overview

This guide will help you deploy the HouseWise application using:
- **Backend**: Render.com (Free tier)
- **Frontend**: Vercel.com (Free tier)
- **Database**: MongoDB Atlas (Already configured)

## 📋 Prerequisites

1. GitHub account
2. Render.com account
3. Vercel.com account
4. MongoDB Atlas database (already set up)

## 🔧 Backend Deployment (Render)

### Step 1: Push to GitHub
1. Create a new repository on GitHub
2. Push your code to the repository

### Step 2: Deploy on Render
1. Go to [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `housewise-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

### Step 3: Set Environment Variables
Add these environment variables in Render dashboard:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://AppajiB:appubj@cluster0.tb3q7cy.mongodb.net/housewife-services
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_123456789
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-app-name.vercel.app
```

**Important**: Replace `your-app-name` with your actual Vercel app name after frontend deployment.

## 🎨 Frontend Deployment (Vercel)

### Step 1: Deploy on Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 2: Set Environment Variables
Add this environment variable in Vercel dashboard:

```
VITE_API_URL=https://your-backend-name.onrender.com/api
```

**Important**: Replace `your-backend-name` with your actual Render service name.

## 🔄 Update CORS Configuration

After both deployments, update the backend environment variables:

1. Go to your Render dashboard
2. Update `FRONTEND_URL` with your actual Vercel URL
3. Redeploy the backend service

## ✅ Verification Steps

1. **Backend Health Check**: Visit `https://your-backend.onrender.com/api/health`
2. **Frontend**: Visit your Vercel URL
3. **Test Registration/Login**: Try creating an account and logging in

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure FRONTEND_URL is correctly set in Render
2. **API Connection**: Verify VITE_API_URL is correct in Vercel
3. **Database Connection**: Check MongoDB Atlas whitelist (allow all IPs: 0.0.0.0/0)

### Logs:
- **Render**: Check logs in Render dashboard
- **Vercel**: Check function logs in Vercel dashboard

## 📱 Post-Deployment

1. Test all major features
2. Update any hardcoded URLs
3. Set up monitoring (optional)
4. Configure custom domain (optional)

## 🔐 Security Notes

- Never commit `.env` files
- Use strong JWT secrets
- Keep environment variables secure
- Regularly update dependencies
