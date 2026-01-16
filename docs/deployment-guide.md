# Deployment Guide

**Version:** 20.0.0
**Last Updated:** January 15, 2026

## Overview

This guide covers building and deploying the Sakai-ng Angular UI Template to various hosting platforms.

## Build Process

### Prerequisites
- Node.js 18+ and npm 9+
- Angular CLI 20
- Git (optional, for version control)

### Development Build

```bash
npm install
npm start
```

Opens development server at `http://localhost:4200` with live reload.

### Production Build

```bash
npm run build
# or: ng build --configuration production
```

Build artifacts are output to `dist/sakai-ng/` directory.

### Build Configurations

#### Development Build
```bash
npm run build:dev
```
- Faster build time
- Source maps enabled
- No optimizations
- Useful for testing before production

#### Production Build
```bash
npm run build:prod
# or: npm run build
```
- Optimized for performance
- Minification & tree-shaking
- CSS/JS compression
- Asset optimization

### Build Output Structure

```
dist/sakai-ng/
├── index.html              # Main HTML entry point
├── browser/                # JavaScript bundles
│   ├── main-*.js          # Main application bundle
│   ├── chunk-*.js         # Lazy-loaded chunks
│   ├── polyfills-*.js     # Polyfills
│   └── styles-*.css       # Global styles
├── assets/                 # Static assets
│   ├── layout/            # Layout SCSS compiled to CSS
│   └── demo/              # Demo data & images
└── favicon.ico            # Favicon
```

### Build Performance

```
Development: ~15-30 seconds
Production: ~60 seconds
Output size: ~2-3 MB uncompressed
           ~500 KB gzipped
```

## Deployment Platforms

### Static Hosting (Recommended)

#### Vercel
1. Connect GitHub repository
2. Configure build settings:
   ```
   Build Command: npm run build
   Output Directory: dist/sakai-ng
   ```
3. Environment variables (if needed): Configure via dashboard
4. Deploy: Automatically on push to main branch

#### Netlify
1. Connect GitHub repository
2. Configure build settings:
   ```
   Build command: npm run build
   Publish directory: dist/sakai-ng
   ```
3. Environment variables: Add via Site settings > Environment
4. Deploy: Automatically on push

#### AWS S3 + CloudFront
```bash
# Build locally
npm run build

# Upload to S3
aws s3 sync dist/sakai-ng s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

#### Azure Static Web Apps
```bash
# Install Azure CLI
npm install -g @azure/static-web-apps-cli

# Deploy
swa deploy
```

#### GitHub Pages
1. Update `angular.json` baseHref:
   ```json
   {
     "build": {
       "options": {
         "baseHref": "/repository-name/"
       }
     }
   }
   ```
2. Build: `npm run build`
3. Deploy to gh-pages branch:
   ```bash
   ng deploy --base-href=/repository-name/
   ```

### Server-Based Deployment

#### Express.js Server
```javascript
// server.js
const express = require('express');
const path = require('path');

const app = express();

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist/sakai-ng')));

// Serve index.html for all routes (SPA)
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/sakai-ng/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

#### Docker Deployment
```dockerfile
# Multi-stage build
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=builder /app/dist/sakai-ng /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

nginx.conf:
```nginx
server {
  listen 80;

  location / {
    root /usr/share/nginx/html;
    index index.html index.htm;
    try_files $uri $uri/ /index.html;
  }

  # Cache busting for assets with hash
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # Don't cache HTML
  location ~* \.html$ {
    expires -1;
    add_header Cache-Control "public, must-revalidate, proxy-revalidate";
  }
}
```

Build and run:
```bash
docker build -t sakai-ng .
docker run -p 80:80 sakai-ng
```

#### Kubernetes
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sakai-ng
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sakai-ng
  template:
    metadata:
      labels:
        app: sakai-ng
    spec:
      containers:
      - name: sakai-ng
        image: sakai-ng:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "256Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: sakai-ng-service
spec:
  selector:
    app: sakai-ng
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer
```

Deploy:
```bash
kubectl apply -f deployment.yaml
```

## Environment Configuration

### Build-Time Variables

Edit `src/environments/environment.ts` and `src/environments/environment.prod.ts`:

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com',
  apiTimeout: 30000,
  logLevel: 'error',
  enableAnalytics: true,
  version: '20.0.0'
};
```

### Runtime Variables

For variables that need to change without rebuilding, use a config service:

```typescript
// config.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config: any;

  constructor(private http: HttpClient) {}

  loadConfig(): Promise<any> {
    return this.http.get('/assets/config.json')
      .toPromise()
      .then(config => {
        this.config = config;
        return config;
      });
  }

  get(key: string): any {
    return this.config?.[key];
  }
}
```

In `main.ts`:
```typescript
import { ConfigService } from './app/core/services/config.service';

const configService = inject(ConfigService);
await configService.loadConfig();

bootstrapApplication(AppComponent, appConfig);
```

Create `public/assets/config.json`:
```json
{
  "apiUrl": "https://api.example.com",
  "environment": "production"
}
```

### Environment Variables (CI/CD)

```bash
# .env file (for local development)
NG_APP_API_URL=https://api.example.com
NG_APP_ENVIRONMENT=production
NG_APP_VERSION=20.0.0

# Access in code
const apiUrl = process.env['NG_APP_API_URL'];
```

## Performance Optimization

### Pre-Deployment Checklist

- [ ] Run production build locally
- [ ] Test all features in built app
- [ ] Check browser console for errors
- [ ] Verify routing works (especially catch-all route)
- [ ] Test dark mode
- [ ] Test on mobile device
- [ ] Check loading times
- [ ] Verify API endpoints

### Build Optimization

#### Reduce Bundle Size
```bash
# Analyze bundle
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/sakai-ng/browser/stats.json
```

#### Enable Gzip Compression
Most hosting platforms automatically gzip static files.

For custom servers:
```javascript
// Express with compression
const compression = require('compression');
app.use(compression());
```

#### Lazy Load Routes
Already configured in `app.routes.ts`. Verify no unwanted eager loading.

#### Tree Shake Unused Code
- Remove unused imports
- Use barrel exports efficiently
- Check for dead code

### CDN Caching Strategy

```
Recommended cache headers:
├── index.html       → No cache (must-revalidate)
├── *.js (hashed)    → 1 year (immutable)
├── *.css (hashed)   → 1 year (immutable)
├── assets/          → 1 year
└── images/          → 1 year
```

## HTTPS & Security

### SSL/TLS Certificate

**Recommended:** Use free Let's Encrypt certificates

Vercel, Netlify, and AWS handle HTTPS automatically.

For custom servers:
```bash
# Using Certbot
certbot certonly --standalone -d example.com
```

### Security Headers

```nginx
# In nginx config
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

## API Backend Integration

### Development

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### Production

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com'
};
```

### CORS Configuration (Backend)

```javascript
// Express example
const cors = require('cors');

app.use(cors({
  origin: ['https://example.com'],
  credentials: true
}));
```

## Monitoring & Logging

### Error Tracking (Sentry)

```typescript
// main.ts
import * as Sentry from "@sentry/angular";

Sentry.init({
  dsn: "https://xxx@xxx.ingest.sentry.io/xxx",
  environment: environment.production ? 'production' : 'development',
  tracesSampleRate: 0.1
});
```

### Application Insights (Azure)

```typescript
import { ApplicationInsightsService } from '@core/services/application-insights.service';

constructor(private appInsights: ApplicationInsightsService) {
  this.appInsights.trackPageView('Dashboard');
}
```

### Google Analytics

```typescript
// Add to app.config.ts
import { GoogleAnalyticsService } from '@core/services/google-analytics.service';

// In component
constructor(private ga: GoogleAnalyticsService) {
  this.ga.trackEvent('product_viewed', { product_id: 123 });
}
```

## Database Considerations

### Connection

If backend needs to store data:
```typescript
// API call example
this.productService.create(product).subscribe({
  next: (result) => console.log('Saved', result),
  error: (err) => console.error('Error', err)
});
```

### Scalability

- Use connection pooling
- Implement caching
- Optimize queries
- Consider read replicas
- Use CDN for static content

## Backup & Recovery

### Automated Backups
- Code: Git repository (GitHub, GitLab, Azure DevOps)
- Database: Platform-specific backups
- CDN: Cached versions

### Recovery Process
1. Revert to previous Git commit
2. Rebuild and redeploy
3. Restore database from backup

## Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Routing Issues
- Ensure catch-all route `{path: '**', redirectTo: '/notfound'}`
- Configure server to serve index.html for all routes

#### API Connection Issues
- Verify environment variables set correctly
- Check CORS configuration on backend
- Verify API URL is accessible

#### Performance Issues
- Check bundle size (should be ~500KB gzipped)
- Enable gzip compression
- Implement caching headers
- Use CDN

## Post-Deployment

### Verification Checklist
- [ ] Application loads at root URL
- [ ] All routes work (navigate to different pages)
- [ ] API calls work (if connected to backend)
- [ ] Dark mode toggle works
- [ ] Theme switching works
- [ ] Forms submit properly
- [ ] Images load correctly
- [ ] No console errors
- [ ] Lighthouse score > 90

### Monitoring
- Monitor error tracking service
- Check analytics for traffic
- Monitor performance metrics
- Set up alerts for critical errors

### Updates
- Set up automated dependency updates (Dependabot)
- Plan quarterly version upgrades
- Schedule security audits
- Test major version upgrades in staging

## Rollback Procedure

```bash
# If deployment causes issues:

# 1. Check previous working version
git log --oneline | head -5

# 2. Checkout previous version
git checkout <commit-hash>

# 3. Rebuild
npm install
npm run build

# 4. Redeploy (platform-specific)
# For Vercel: Revert deployment in dashboard
# For Docker: Pull previous image tag
# For Git-based: Force push to main (caution!)
```

## Conclusion

The Sakai-ng template is designed to deploy easily to any modern hosting platform. Follow this guide to ensure smooth deployments and optimal performance.

For platform-specific help:
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com/)
- [AWS Docs](https://docs.aws.amazon.com/)
- [Azure Docs](https://learn.microsoft.com/azure/)
- [Docker Docs](https://docs.docker.com/)
