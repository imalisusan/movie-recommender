# Deployment Guide

## Overview

This project includes a complete CI/CD pipeline using GitHub Actions that automatically:
- Runs linting and unit tests on every push and pull request
- Deploys to production when changes are merged to the main branch
- Supports deployment to both Vercel and Firebase Hosting

## CI/CD Pipeline

### Continuous Integration (CI)

The CI pipeline (`/.github/workflows/ci.yml`) runs on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**CI Jobs:**
1. **Lint and Test** - Runs on Node.js 18.x and 20.x
   - Code linting with ESLint
   - Unit tests with code coverage
   - Production build verification
   - Test coverage upload to Codecov

2. **Security Scan**
   - NPM security audit
   - Dependency vulnerability check

### Continuous Deployment (CD)

The CD pipeline (`/.github/workflows/cd.yml`) runs on:
- Push to `main` branch
- Successful completion of CI workflow

**CD Jobs:**
1. **Deploy to Vercel** - Primary deployment target
2. **Deploy to Firebase Hosting** - Alternative deployment option

## Setup Instructions

### 1. GitHub Repository Setup

1. Push your code to a GitHub repository
2. Ensure the repository has the following structure:
   ```
   ├── .github/workflows/
   │   ├── ci.yml
   │   └── cd.yml
   ├── src/environments/
   │   ├── environment.ts (template)
   │   └── environment.prod.ts (template)
   └── ...
   ```

### 2. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

#### Required for All Deployments
```
TMDB_API_KEY=your_tmdb_api_key
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
```

#### For Vercel Deployment
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

#### For Firebase Hosting Deployment
```
FIREBASE_TOKEN=your_firebase_token
FIREBASE_SERVICE_ACCOUNT=your_firebase_service_account_json
```

### 3. Vercel Setup

1. **Create Vercel Account**
   - Sign up at [vercel.com](https://vercel.com)
   - Connect your GitHub account

2. **Create New Project**
   - Import your GitHub repository
   - Framework: Angular
   - Build Command: `npm run build:prod`
   - Output Directory: `dist/movie-recommender/browser`

3. **Get Vercel Credentials**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and get token
   vercel login
   vercel --token  # This will show your token
   
   # Get project and org IDs
   vercel project ls
   vercel teams ls
   ```

4. **Configure Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add all the Firebase and TMDB environment variables

### 4. Firebase Hosting Setup

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login and Initialize**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Get Firebase Token**
   ```bash
   firebase login:ci
   ```

4. **Get Service Account Key**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - Copy the entire JSON content for `FIREBASE_SERVICE_ACCOUNT` secret

### 5. Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment Files**
   ```bash
   # Follow ENVIRONMENT_SETUP.md instructions
   cp src/environments/environment.ts src/environments/environment.local.ts
   # Edit environment.local.ts with your actual credentials
   ```

3. **Run Development Server**
   ```bash
   npm start
   ```

4. **Run Tests**
   ```bash
   npm test          # Interactive testing
   npm run test:ci   # CI testing with coverage
   ```

5. **Run Linting**
   ```bash
   npm run lint      # Check for issues
   npm run lint:fix  # Auto-fix issues
   ```

## Deployment Workflow

### Automatic Deployment

1. **Development**
   - Create feature branch from `develop`
   - Make changes and commit
   - Push branch and create pull request
   - CI pipeline runs automatically

2. **Testing**
   - Merge PR to `develop` branch
   - CI pipeline runs on develop
   - Manual testing on development environment

3. **Production**
   - Merge `develop` to `main` branch
   - CI pipeline runs
   - CD pipeline deploys to production automatically

### Manual Deployment

```bash
# Vercel
vercel --prod

# Firebase
firebase deploy --only hosting
```

## Monitoring and Troubleshooting

### GitHub Actions
- Monitor workflow runs in GitHub Actions tab
- Check logs for build failures
- Verify all secrets are properly configured

### Vercel
- Monitor deployments in Vercel dashboard
- Check function logs and analytics
- Review build logs for errors

### Firebase
- Monitor hosting in Firebase Console
- Check usage and performance metrics
- Review deployment history

### Common Issues

1. **Build Failures**
   - Check environment variables are set
   - Verify all dependencies are installed
   - Review linting errors

2. **Deployment Failures**
   - Verify deployment secrets are correct
   - Check output directory configuration
   - Ensure build artifacts are generated

3. **Runtime Errors**
   - Check browser console for errors
   - Verify API keys are working
   - Test Firebase authentication

## Security Considerations

- All secrets are stored in GitHub Secrets (encrypted)
- Environment files with secrets are gitignored
- CSP headers are configured for security
- HTTPS is enforced on all deployments
- Regular dependency security audits

## Performance Optimization

- Static assets are cached with long expiration
- Gzip compression enabled
- Bundle size monitoring
- Code splitting implemented
- Lazy loading for routes