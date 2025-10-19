# Vercel Deployment Guide for Arisan OC Frontend

This guide will help you deploy the Arisan OC frontend to Vercel using React Router v7 with SSR.

## Prerequisites

1. A Vercel account (free tier available)
2. Git repository with your code
3. Node.js 18+ installed locally (for testing)

## Deployment Steps

### 1. Prepare Your Repository

Ensure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Select the `arisan-oc-frontend` folder as the root directory

### 3. Configure Build Settings

In your Vercel project settings, configure:

- **Framework Preset**: Other
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`
- **Node.js Version**: 18.x

### 4. Set Environment Variables

In your Vercel project settings, add the following environment variables:

#### Required Variables:
```
VITE_CONTRACT_ID=CCXDGXVLP6JJ4MS36NXMPLVNGB5TNRB6PRTFETY46F3RF5QMHYIXYDNN
VITE_WASM_HASH=302c3c32188077aca2cc531b65eee68abef5460341e4ca05961e214c065e00f8
VITE_NETWORK=testnet
VITE_RPC_URL=https://soroban-testnet.stellar.org:443
NODE_ENV=production
```

#### Optional Variables:
```
VITE_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id_here
VITE_ANALYTICS_ID=your_analytics_id_here
```

### 5. Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your app will be available at the provided Vercel URL

## Configuration Files

The following files have been created for Vercel deployment:

- `api/index.js` - Serverless function entry point for React Router SSR
- `.vercelignore` - Files to exclude from deployment
- `vercel-env.example` - Environment variables template

**Note**: No `vercel.json` is needed - Vercel will auto-detect the project settings.

## How It Works

1. **Build Process**: Vercel runs `npm run build` which creates the `build/` directory
2. **API Route**: The `api/index.js` file imports the built server and creates a request handler
3. **Routing**: Static assets are served from `build/client/`, all other requests go to the SSR server
4. **SSR**: React Router handles server-side rendering for all routes

## Troubleshooting

### Build Failures

If the build fails, check:

1. **Node.js Version**: Ensure you're using Node.js 18+
2. **Dependencies**: Run `npm install` locally to verify all dependencies install correctly
3. **Build Command**: Verify `npm run build` works locally
4. **Environment Variables**: Ensure all required environment variables are set

### Runtime Issues

If the app doesn't work after deployment:

1. **Environment Variables**: Double-check all VITE_* variables are set correctly
2. **Network Configuration**: Verify RPC URL and network settings
3. **Contract ID**: Ensure the contract ID matches your deployed contract
4. **API Route**: Check that `api/index.js` is properly importing the built server

### Common Issues

1. **404 Errors**: Usually means the build didn't complete or the API route isn't working
2. **Import Errors**: Make sure the build directory exists and contains the server files
3. **Environment Variables**: Ensure all VITE_* variables are set in Vercel project settings

## Performance Optimization

For better performance:

1. **Edge Functions**: Consider using Vercel Edge Functions for better global performance
2. **Caching**: Configure appropriate cache headers
3. **CDN**: Vercel automatically provides global CDN

## Custom Domain (Optional)

To use a custom domain:

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS records as instructed by Vercel

## Monitoring

Vercel provides built-in monitoring:

1. **Analytics**: View page views and performance metrics
2. **Functions**: Monitor serverless function performance
3. **Logs**: Access deployment and runtime logs

## Updates

To update your deployment:

1. Push changes to your Git repository
2. Vercel will automatically trigger a new deployment
3. Preview deployments are created for pull requests

## Support

For issues specific to:
- **Vercel**: Check [Vercel Documentation](https://vercel.com/docs)
- **React Router**: Check [React Router Documentation](https://reactrouter.com)
- **Stellar/Soroban**: Check [Stellar Documentation](https://developers.stellar.org)
