# FairCircles Backend API

Express.js backend server that handles FairScale API integration and circle state management for the FairCircles dApp.

## Features

- 🔐 **Secure API Key Management** - FairScale API keys stored in environment variables
- 🔒 **Security Headers** - Helmet.js for secure HTTP headers
- 📝 **Request Logging** - Morgan for development and production logging
- ❌ **Error Handling** - Centralized error handling with proper HTTP status codes
- 🌐 **CORS Support** - Configurable cross-origin resource sharing

## API Endpoints

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health status |
| GET | `/api/health/config` | Non-sensitive configuration info |

### FairScale Integration

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fairscale/score?wallet=<address>` | Get complete FairScore with tier and badges |
| GET | `/api/fairscale/fairScore?wallet=<address>` | Get just the FairScore number |
| POST | `/api/fairscale/batch` | Batch fetch scores for multiple wallets |

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your values
nano .env
```

Required environment variables:
- `FAIRSCALE_API_KEY` - Your FairScale API key
- `PROGRAM_ID` - Your deployed Solana program ID

### 3. Run the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm run build
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `FAIRSCALE_API_URL` | FairScale API base URL | `https://api.fairscale.xyz` |
| `FAIRSCALE_API_KEY` | Your FairScale API key | - |
| `SOLANA_NETWORK` | Solana network | `devnet` |
| `SOLANA_RPC_URL` | Solana RPC endpoint | `https://api.devnet.solana.com` |
| `PROGRAM_ID` | Deployed program ID | - |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173` |

## Project Structure

```
backend/
├── src/
│   ├── config/           # Environment configuration
│   │   └── index.ts
│   ├── middleware/       # Express middleware
│   │   └── errorHandler.ts
│   ├── routes/           # API routes
│   │   ├── fairscale.routes.ts
│   │   └── health.routes.ts
│   ├── services/         # Business logic
│   │   └── fairscale.service.ts
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   └── index.ts          # Entry point
├── .env                  # Environment variables (git-ignored)
├── .env.example          # Example environment file
├── package.json
└── tsconfig.json
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Security Notes

- Never commit `.env` files to version control
- The FairScale API key is only used server-side
- All sensitive operations are proxied through this backend
- CORS is configured to only allow specified origins
