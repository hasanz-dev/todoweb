# Todo Web (Frontend)

A React-based frontend application for the Todo List system.

## Summary

This single-page application provides a user interface for managing personal tasks. Users can register, login, and manage their todos with features like drag-and-drop reordering, search, and priority management.

## Tech Stack

- **React 19** - UI library
- **React Router DOM 7** - Client-side routing
- **Axios** - HTTP client
- **@hello-pangea/dnd** - Drag and drop functionality
- **React Toastify** - Toast notifications
- **CSS3** - Styling with responsive design

## Features

- User registration and login
- Protected routes (dashboard requires authentication)
- Create, edit, delete tasks
- Mark tasks as complete/incomplete
- Search tasks by title
- Drag and drop to reorder tasks
- Priority levels (Low, Medium, High)
- Due date management
- Responsive UI (mobile, tablet, desktop)
- Toast notifications for user feedback

## Project Structure

```
src/
├── api/                 # API service layer (axios config)
├── components/          # Reusable UI components
│   ├── common/          # Shared components (Navbar, ProtectedRoute)
│   └── tasks/           # Task-related components
├── context/             # React Context (auth state)
├── pages/               # Page components (Login, Register, Dashboard)
├── styles/              # CSS files
└── App.js               # Main application with routing
```

## Prerequisites

- Node.js 18+ (`node -v`)
- npm 9+ (`npm -v`)

## Running the Application

### Development Mode

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The application will start at `http://localhost:3000`

### Production Build

```bash
# Create optimized build
npm run build

# Serve production build (requires serve package)
npx serve -s build
```

## Environment Configuration

Create environment files for different environments:

**`.env.development`** (local development):
```
REACT_APP_API_BASE_URL=http://localhost:8080
```

**`.env.production`** (production deployment):
```
REACT_APP_API_BASE_URL=https://api.yourdomain.com
```

See `.env.example` for reference.

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode)
CI=true npm test

# Run with coverage
npm test -- --coverage
```

## API Integration

This frontend connects to the Todo Service backend API. Ensure the backend is running before using the application.

### Configuration

The API base URL is configured via environment variables:
- Default: `http://localhost:8080`
- API Version: `/api/v1`

### Authentication

- JWT tokens are stored in `localStorage`
- Tokens are automatically attached to requests via Axios interceptors
- 401 responses trigger automatic logout and redirect to login

## Architecture Decisions

1. **Context API**: Used for auth state management (simple, no external dependencies)
2. **Axios Interceptors**: Centralized request/response handling
3. **Component-based CSS**: Each component has its own styles
4. **Protected Routes**: HOC pattern for route authentication
5. **Environment Variables**: Build-time configuration for different environments

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start development server |
| `npm test` | Run tests in watch mode |
| `npm run build` | Create production build |
| `npm run eject` | Eject from Create React App |

## Cloud Deployment (AWS S3 + CloudFront)

### Architecture Overview

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                        AWS Cloud                         │
                    │  ┌─────────────┐    ┌─────────────────────────────────┐ │
    Users ────────────►│   Route 53   │───►│        CloudFront CDN           │ │
                    │  │ (DNS)       │    │   (Edge Locations Worldwide)    │ │
                    │  └─────────────┘    └───────────────┬─────────────────┘ │
                    │                                      │                   │
                    │                          ┌───────────▼───────────┐       │
                    │                          │      S3 Bucket        │       │
                    │                          │  (Static Website)     │       │
                    │                          │  - index.html         │       │
                    │                          │  - static/js/*.js     │       │
                    │                          │  - static/css/*.css   │       │
                    │                          └───────────────────────┘       │
                    └─────────────────────────────────────────────────────────┘
```

### Step 1: Build for Production

```bash
# Set production API URL
echo "REACT_APP_API_BASE_URL=https://api.yourdomain.com" > .env.production

# Build optimized production bundle
npm run build
```

### Step 2: Create S3 Bucket

```bash
# Create S3 bucket
aws s3 mb s3://todo-web-frontend --region us-east-1

# Enable static website hosting
aws s3 website s3://todo-web-frontend \
  --index-document index.html \
  --error-document index.html

# Set bucket policy for public read
aws s3api put-bucket-policy --bucket todo-web-frontend --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::todo-web-frontend/*"
    }
  ]
}'
```

### Step 3: Deploy to S3

```bash
# Sync build folder to S3
aws s3 sync build/ s3://todo-web-frontend --delete

# Set cache headers for static assets
aws s3 cp s3://todo-web-frontend/static s3://todo-web-frontend/static \
  --recursive \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=31536000"

# Set no-cache for index.html
aws s3 cp s3://todo-web-frontend/index.html s3://todo-web-frontend/index.html \
  --metadata-directive REPLACE \
  --cache-control "no-cache, no-store, must-revalidate"
```

### Step 4: Create CloudFront Distribution

```bash
aws cloudfront create-distribution --distribution-config '{
  "CallerReference": "todo-web-'$(date +%s)'",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-todo-web-frontend",
        "DomainName": "todo-web-frontend.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-todo-web-frontend",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {"Forward": "none"}
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "DefaultRootObject": "index.html",
  "Enabled": true,
  "Comment": "Todo Web Frontend"
}'
```

### Step 5: Configure Custom Domain (Optional)

```bash
# Create Route 53 record pointing to CloudFront
aws route53 change-resource-record-sets --hosted-zone-id ZXXXXX --change-batch '{
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "todo.yourdomain.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "dxxxxx.cloudfront.net",
          "EvaluateTargetHealth": false
        }
      }
    }
  ]
}'
```

### CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: CI=true npm test

      - name: Build
        run: npm run build
        env:
          REACT_APP_API_BASE_URL: ${{ secrets.API_BASE_URL }}

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to S3
        run: aws s3 sync build/ s3://todo-web-frontend --delete

      - name: Invalidate CloudFront cache
        run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

### Environment Variables

| Variable | Description | Where to Set |
|----------|-------------|--------------|
| `REACT_APP_API_BASE_URL` | Backend API URL | `.env.production` or CI/CD secrets |

## Related Repositories

- **Backend (todo-service)**: Spring Boot REST API that this frontend consumes
