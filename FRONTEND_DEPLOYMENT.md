# 🎨 Frontend Deployment Guide

## **Deployment Options**

### **1. Vercel (Recommended)**
- **Free Tier**: Unlimited deployments
- **Auto-deploy**: From GitHub
- **Custom domains**: Free
- **Performance**: Excellent
- **Next.js**: Native support

### **2. Netlify**
- **Free Tier**: Unlimited deployments
- **Auto-deploy**: From GitHub
- **Custom domains**: Free
- **Performance**: Good

### **3. GitHub Pages**
- **Free Tier**: Unlimited
- **Static hosting**: Only
- **Custom domains**: Free

## **Deploy to Vercel**

### **Step 1: Prepare Your Code**
1. Ensure all code is pushed to GitHub
2. Check that `package.json` has build script
3. Verify API calls use environment variables

### **Step 2: Create Vercel Account**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"

### **Step 3: Import Repository**
1. Select your GitHub repository
2. Choose the repository
3. Vercel will auto-detect Next.js

### **Step 4: Configure Build**
```
Framework Preset: Next.js
Root Directory: client (if your frontend is in a subfolder)
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### **Step 5: Set Environment Variables**
```
NEXT_PUBLIC_API_URL=https://your-api-service.onrender.com/api
```

### **Step 6: Deploy**
1. Click "Deploy"
2. Wait for build to complete
3. Your site will be available at: `https://your-project.vercel.app`

## **Environment Configuration**

### **Development (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

### **Production (Vercel Dashboard)**
```env
NEXT_PUBLIC_API_URL=https://your-api-service.onrender.com/api
```

## **Update API Configuration**

After deploying your server, update the frontend environment:

1. **In Vercel Dashboard**:
   - Go to your project
   - Settings → Environment Variables
   - Add `NEXT_PUBLIC_API_URL`

2. **Redeploy**:
   - Vercel will automatically redeploy
   - Or trigger manual redeploy

## **Testing After Deployment**

### ✅ **Core Functionality**
- [ ] Homepage loads
- [ ] User registration works
- [ ] User login works
- [ ] Product browsing works
- [ ] Cart functionality works
- [ ] Checkout process works

### ✅ **API Integration**
- [ ] All API calls use production URL
- [ ] No CORS errors
- [ ] Authentication works
- [ ] File uploads work

### ✅ **Performance**
- [ ] Page load times are acceptable
- [ ] Images load properly
- [ ] No console errors

## **Common Issues**

### **API URL Not Updated**
- Check environment variables in Vercel
- Ensure `NEXT_PUBLIC_` prefix is used
- Redeploy after changing variables

### **CORS Errors**
- Verify server CORS configuration
- Check `FRONTEND_URL` in server environment
- Ensure frontend URL is allowed

### **Build Failures**
- Check `package.json` scripts
- Verify all dependencies are listed
- Check for syntax errors

## **Custom Domain (Optional)**

1. **In Vercel Dashboard**:
   - Go to your project
   - Settings → Domains
   - Add your custom domain

2. **DNS Configuration**:
   - Add CNAME record pointing to Vercel
   - Wait for DNS propagation

## **Monitoring**

### **Vercel Analytics**
- Page views and performance
- Error tracking
- User behavior

### **Performance Monitoring**
- Core Web Vitals
- Page load times
- API response times

## **Next Steps**

1. **Set up monitoring** for your frontend
2. **Configure custom domain** if desired
3. **Set up analytics** (Google Analytics, etc.)
4. **Monitor performance** regularly
5. **Set up error tracking** (Sentry, etc.)

## **Support Resources**

- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Netlify**: [docs.netlify.com](https://docs.netlify.com)
