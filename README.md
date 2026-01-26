# FairCircles - Reputation-Based Lending Circles (ROSCAs)

[![Solana](https://img.shields.io/badge/Solana-Devnet-blueviolet)](https://solana.com)
[![FairScale](https://img.shields.io/badge/Powered%20by-FairScale-green)](https://fairscale.xyz)
[![Anchor](https://img.shields.io/badge/Anchor-0.32-blue)](https://www.anchor-lang.com/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)

FairCircles brings the centuries-old tradition of Rotating Savings and Credit Associations (ROSCAs) to Solana, powered by [FairScale](https://fairscale.xyz) reputation scoring.

Known globally as **chit funds** (India), **tandas** (Latin America), **susus** (West Africa), and **hui** (China), ROSCAs have served over 1 billion people worldwide. FairCircles makes this financial primitive trustless, transparent, and reputation-aware.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [How It Works](#-how-it-works)
- [FairScale Integration](#-fairscale-integration)
- [Complete User Flow](#-complete-user-flow)
- [Architecture](#-architecture) | [Detailed Diagrams](./Architecture.md)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Smart Contract Details](#-smart-contract-details)
- [Development Guide](#-development-guide)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Security Considerations](#-security-considerations)
- [License](#-license)

---

##  Overview

### What are ROSCAs?

Rotating Savings and Credit Associations (ROSCAs) are informal financial institutions where a group of people agree to:
1. Contribute a fixed amount regularly (e.g., weekly/monthly)
2. Take turns receiving the pooled funds
3. Continue until everyone has received their payout

**Example**: 10 people contribute $100/month. Each month, one person receives $1,000. After 10 months, everyone has contributed $1,000 and received $1,000.

### Why FairCircles?

Traditional ROSCAs rely on social trust and face-to-face accountability. FairCircles brings this to Web3 with:
- ✅ **Trustless execution** via Solana smart contracts
- ✅ **Transparent tracking** of all contributions and payouts
- ✅ **Reputation-based risk management** via FairScale
- ✅ **Programmable rules** enforced on-chain
- ✅ **Global participation** without geographic constraints

---

##  How It Works

### 1. Circle Formation (Forming Phase)
- A **creator** initializes a new circle with:
  - **Name**: e.g., "Weekend Savers Circle"
  - **Contribution Amount**: Fixed SOL per round (e.g., 1 SOL)
  - **Period Length**: Time between rounds in seconds (e.g., 604800 = 7 days)
  - **Minimum FairScore**: Required reputation tier (e.g., 40 for Silver+)
  - **Creator's FairScore**: Their actual FairScore at creation time
- Creator automatically becomes the first member
- Circle is **open for joining** by others who meet the FairScore requirement

### 2. Joining a Circle
- Users **browse available circles** on the discovery page
- Each circle displays:
  - Current member count (e.g., 3/10)
  - Contribution amount
  - Minimum FairScore requirement
  - Period length
- Users can **join** if they meet the FairScore threshold
- Their FairScore is **recorded on-chain** at join time

### 3. Starting the Circle (Active Phase)
- Once enough members join (creator decides when), the **creator starts the circle**
- The smart contract:
  - Sorts members by **FairScore (highest to lowest)**
  - Creates the **payout order array**
  - Sets the circle status to **Active**
  - Records the **start timestamp**
- The circle now enters its first contribution round

### 4. Contributing Each Round
- During each round, **all members must contribute** the fixed SOL amount
- Contributions are sent to the **escrow PDA** controlled by the program
- The smart contract tracks who has contributed via a **2D array**: `contributions[member_index][round_index]`
- Once **all members contribute**, the round is marked complete

### 5. Claiming Payouts
- After a round's contributions are complete, the **current payout recipient** can claim
- The payout order follows the **FairScore ranking** established at start
- The recipient receives the **entire pool** (all members' contributions)
- The smart contract:
  - Transfers SOL from escrow to the claimant
  - Marks them as having claimed
  - Increments the payout index
  - Starts a new round

### 6. Circle Completion
- The cycle continues until **all members have received their payout**
- After the last payout, the circle status changes to **Completed**
- Members can view their **completion history** (future badge integration)

---

##  FairScale Integration

FairCircles uses FairScale in **three meaningful ways**:

### 1. Access Gating 
**Purpose**: Prevent low-reputation wallets from joining high-trust circles

**Implementation**:
- Circle creators set a **minimum FairScore** (0-100 scale)
- Frontend fetches user's FairScore via FairScale API before allowing join
- Smart contract validates and stores the FairScore on-chain during `join_circle`
- Only wallets meeting the threshold can participate

**Example**:
```
Circle: "Platinum Savers"
Min FairScore: 80 (Platinum tier)
User FairScore: 65 (Gold tier) → ❌ Cannot join
User FairScore: 85 (Platinum tier) → ✅ Can join
```

### 2. Payout Order 
**Purpose**: Reward established reputation with priority access to pooled funds

**Implementation**:
- When `start_circle` is called, members are **sorted by FairScore** (descending)
- The `payout_order` array is created: `[member_index_highest_score, ..., member_index_lowest_score]`
- Payouts follow this order throughout the circle's lifecycle

**Example**:
```
Members (at join time):
- Alice: FairScore 85 → Receives payout in Round 1
- Bob: FairScore 70 → Receives payout in Round 2
- Charlie: FairScore 45 → Receives payout in Round 3
```

**Why This Matters**:
- High-reputation users get **early liquidity** (reward for trust)
- Low-reputation users **prove commitment first** (risk mitigation)
- Creates incentive to **build on-chain reputation**

### 3. Risk Management 
**Purpose**: Reduce default risk by requiring low-reputation members to contribute before receiving

**Implementation**:
- Lower FairScore = later in payout queue
- Members must contribute to **multiple rounds** before their payout turn
- If someone defaults (doesn't contribute), the circle can identify them on-chain
- Future enhancement: Default tracking feeds back into FairScale reputation

**Example**:
```
3-member circle:
- High FairScore member: Contributes 1x, receives payout
- Medium FairScore: Contributes 2x before receiving
- Low FairScore: Contributes 3x before receiving (proves commitment)
```

---

##  Complete User Flow

### Scenario: Alice Creates and Manages a Circle

#### Step 1: Connect Wallet
1. Alice visits the FairCircles dApp at `http://localhost:5173`
2. Clicks **"Connect Wallet"** button in the header
3. Selects **Phantom** wallet from the adapter options
4. Approves the connection request in Phantom
5.  Her wallet address and FairScore appear in the header

**Backend Flow**:
- Frontend calls `POST http://localhost:3001/api/fairscale/score?wallet={Alice's address}`
- Backend proxies to FairScale API with API key in header
- Returns FairScore data to frontend
- Zustand store caches the score

#### Step 2: Check SOL Balance
1. Alice sees her **SOL balance** in the sidebar (e.g., 2.5 SOL)
2. If balance is low, she clicks **"Request Airdrop"** button
3. Airdrop request is sent to Solana devnet
4.  After ~30 seconds, balance updates to 4.5 SOL

**Technical Details**:
- `useWallet` hook provides `publicKey` and `connected` state
- `useConnection` provides `connection` to Solana RPC
- `solana.ts` utility handles `requestAirdrop()` function

#### Step 3: View FairScore Card
Alice's FairScore card displays:
- **Overall Score**: 72 (Gold tier)
- **Badges**: "Diamond Hands" (Platinum badge)
- **Key Metrics**:
  - Wallet Age: 245 days
  - Transactions: 1,234
  - Active Days: 187
  - Platform Diversity: 8

**Data Source**: FairScale API `/score` endpoint with full feature breakdown

#### Step 4: Create a New Circle
1. Alice clicks **"Create Circle"** tab
2. Fills out the form:
   - **Name**: "Weekend Savers"
   - **Contribution**: 1 SOL
   - **Period**: 7 days (dropdown)
   - **Min FairScore**: 60 (slider, ensures she meets it)
3. Reviews the preview showing her FairScore (72) meets requirement
4. Clicks **"Create Circle"** button
5. ⏳ Transaction simulation runs
6. Phantom prompts for approval
7. ✅ Transaction confirmed! Circle created

**On-Chain Process**:
```typescript
// Frontend (useCircleProgram.ts)
createCircle(
  name: "Weekend Savers",
  contributionAmount: 1, // SOL
  periodLength: 604800, // 7 days in seconds
  minFairScore: 60,
  creatorFairScore: 72 // Alice's actual score
)

// Smart Contract (lib.rs)
create_circle {
  - Validate inputs
  - Derive Circle PDA from creator's pubkey
  - Initialize Circle account with data
  - Store creator as first member with FairScore 72
  - Set status to Forming
}
```

**Account State After Creation**:
```rust
Circle {
  creator: Alice's PublicKey,
  name: "Weekend Savers",
  contribution_amount: 1_000_000_000, // lamports
  period_length: 604800,
  min_fair_score: 60,
  member_count: 1,
  status: Forming,
  members[0]: Alice's PublicKey,
  fair_scores[0]: 72,
  ...
}
```

#### Step 5: Bob and Charlie Join
1. Bob discovers the circle on **"Discover Circles"** tab
2. He sees:
   - 1/10 members
   - 1 SOL contribution
   - 7 day period
   - Min FairScore: 60
3. His FairScore is 68 (Gold) → ✅ Eligible
4. Clicks **"Join Circle"** button
5. Transaction approved, Bob is added as member 2

Similarly, Charlie (FairScore 55, Silver) joins as member 3.

**On-Chain Process**:
```rust
join_circle {
  - Check circle is in Forming status
  - Validate Bob's FairScore (68) >= min (60) ✅
  - Add Bob to members array at index member_count
  - Store Bob's FairScore in fair_scores array
  - Increment member_count to 2
}
```

#### Step 6: Alice Starts the Circle
1. Alice navigates to **"My Circles"** tab
2. Sees "Weekend Savers" with 3 members
3. Clicks **"Start Circle"** button (only visible to creator)
4. Smart contract sorts members by FairScore and activates the circle

**Payout Order Calculation**:
```rust
Members after sorting:
[0] Alice: FairScore 72 → Payout Round 1
[1] Bob: FairScore 68 → Payout Round 2
[2] Charlie: FairScore 55 → Payout Round 3

payout_order = [0, 1, 2]
status = Active
round_start_time = current_timestamp
```

#### Step 7: Round 1 - Contributions
1. All three members see **"Contribute 1 SOL"** button for Round 1
2. Alice contributes:
   - Clicks **"Contribute"**
   - Phantom prompts for 1 SOL + fees
   - ✅ Contribution recorded
3. Bob contributes (1 SOL)
4. Charlie contributes (1 SOL)
5. **Pool Status**: 3/3 SOL collected → Round complete

**On-Chain State**:
```rust
Circle {
  current_round: 0,
  total_pool: 3_000_000_000, // 3 SOL in lamports
  contributions[0][0]: true, // Alice contributed in round 0
  contributions[1][0]: true, // Bob contributed in round 0
  contributions[2][0]: true, // Charlie contributed in round 0
  round_contributions_complete: true,
}
```

#### Step 8: Round 1 - Alice Claims Payout
1. Alice sees **"Claim Payout"** button (she's first in payout_order)
2. Clicks button
3. Smart contract transfers **3 SOL** from escrow to Alice's wallet
4. Alice's balance increases by 3 SOL (net +2 SOL since she contributed 1)

**Transaction**:
```rust
claim_payout {
  - Verify payout_index = 0, payout_order[0] = Alice ✅
  - Verify round_contributions_complete = true ✅
  - Transfer 3 SOL from escrow PDA to Alice
  - Mark has_claimed[0] = true
  - Increment payout_index to 1
  - Increment current_round to 1
  - Reset round_contributions_complete to false
}
```

#### Step 9: Round 2 - Bob's Turn
Process repeats:
1. All members contribute 1 SOL to Round 2
2. Bob (payout_order[1]) claims 3 SOL payout
3. current_round increments to 2

#### Step 10: Round 3 - Charlie's Turn
1. All members contribute 1 SOL to Round 3
2. Charlie (payout_order[2]) claims 3 SOL payout
3. Circle status changes to **Completed**

**Final State**:
- Each member contributed **3 SOL total** (1 SOL × 3 rounds)
- Each member received **3 SOL total** (1 payout of 3 SOL)
- Circle successfully completed! 🎉

---

## 🏗 Architecture

> 📘 **For comprehensive architecture diagrams, see [Architecture.md](./Architecture.md)** — includes detailed component diagrams, data flows, Solana program account structures, state machines, and deployment architecture.

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    USER (Browser)                                       │
│                              Phantom / Solflare Wallet                                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                          │
              ┌───────────────────────────┴───────────────────────────┐
              │                                                       │
              ▼                                                       ▼
┌──────────────────────────────────┐                 ┌──────────────────────────────────┐
│      FRONTEND (React 19)         │                 │          BACKEND                 │
│      Vite 7 + TypeScript         │                 │    (Express.js 5 + TypeScript)   │
│      http://localhost:5173       │                 │      http://localhost:3001       │
│                                  │    REST API     │                                  │
│  ┌────────────────────────────┐  │   /api/*        │  ┌────────────────────────────┐  │
│  │     Components Layer       │  │◄───────────────►│  │   FairScale Service        │  │
│  │  Dashboard, CircleCard,    │  │                 │  │   Score Proxy & Normalize  │  │
│  │  CircleDetail, CreateForm  │  │                 │  └────────────────────────────┘  │
│  └────────────────────────────┘  │                 │                │                │
│  ┌────────────────────────────┐  │                 │                ▼                │
│  │      Hooks Layer           │  │                 │  ┌────────────────────────────┐  │
│  │  useCircleProgram          │  │                 │  │   FairScale External API   │  │
│  │  useFairScore              │  │                 │  │   api.fairscale.xyz        │  │
│  └────────────────────────────┘  │                 │  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │                 │                                  │
│  │  State (Zustand 5.0)       │  │                 └──────────────────────────────────┘
│  │  Circles, FairScore Cache  │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
              │
              │ RPC Calls (Anchor SDK)
              ▼
┌──────────────────────────────────┐
│   SOLANA BLOCKCHAIN (Devnet)     │
│                                  │
│  ┌────────────────────────────┐  │
│  │  FairCircle Solana Program │  │
│  │  (Anchor 0.32 / Rust)      │  │
│  │                            │  │
│  │  Instructions:             │  │
│  │  • create_circle           │  │
│  │  • join_circle             │  │
│  │  • start_circle            │  │
│  │  • contribute              │  │
│  │  • claim_payout            │  │
│  │  • update_fair_score       │  │
│  │                            │  │
│  │  PDAs:                     │  │
│  │  • Circle Account          │  │
│  │  • Escrow Account          │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

### Data Flow Examples

#### Fetching FairScore
```
User connects wallet
    ↓
Frontend: useFairScore() hook triggered
    ↓
Frontend → Backend: GET /api/fairscale/score?wallet={address}
    ↓
Backend → FairScale API: GET /score?wallet={address}
            (with fairkey header)
    ↓
FairScale API → Backend: JSON response with score, tier, badges, features
    ↓
Backend → Frontend: Normalized FairScoreResponse
    ↓
Frontend: Update Zustand store
    ↓
UI: FairScoreCard.tsx displays data
```

#### Creating a Circle
```
User fills form and clicks "Create Circle"
    ↓
Frontend: createCircle() in useCircleProgram hook
    ↓
Frontend: Validate creator's FairScore meets minimum
    ↓
Frontend → Solana: Build transaction with create_circle instruction
    ↓
Phantom Wallet: User approves transaction
    ↓
Solana: Process create_circle instruction
    ├── Derive Circle PDA
    ├── Derive Escrow PDA
    ├── Initialize Circle account
    └── Transfer rent-exempt SOL
    ↓
Solana → Frontend: Transaction signature
    ↓
Frontend: Poll for confirmation
    ↓
Frontend: Show success notification
    ↓
Frontend: Refresh circles list
```

---

##  Project Structure

### Complete Directory Tree

```
FAIRCIRCLES/
├── README.md                           # This file
├── Architecture.md                     # Detailed architecture diagrams
├── .gitignore
│
├── faircircle-frontend/                # React Frontend Application
│   ├── public/                         # Static assets
│   │   └── vite.svg                    # Favicon
│   ├── src/
│   │   ├── components/                 # React Components
│   │   │   ├── CircleCard.tsx          # Circle preview card with join button
│   │   │   ├── CircleDetail.tsx        # Full circle view (contribute, claim)
│   │   │   ├── CreateCircleForm.tsx    # Circle creation form with validation
│   │   │   ├── Dashboard.tsx           # Main app dashboard (tabs, layout)
│   │   │   ├── FairScoreCard.tsx       # FairScore display with metrics
│   │   │   ├── Header.tsx              # Top nav with wallet connect
│   │   │   ├── LandingPage.tsx         # Landing page before wallet connect
│   │   │   ├── Notifications.tsx       # Toast notification system
│   │   │   ├── WalletBalance.tsx       # SOL balance + airdrop button
│   │   │   └── WalletProvider.tsx      # Solana wallet adapter context
│   │   ├── hooks/                      # Custom React Hooks
│   │   │   ├── useCircleProgram.ts     # Anchor program interactions
│   │   │   │                           # Functions: createCircle, joinCircle,
│   │   │   │                           # startCircle, contribute, claimPayout,
│   │   │   │                           # fetchCircle, fetchAllCircles
│   │   │   └── useFairScore.ts         # FairScore fetching & caching
│   │   ├── lib/                        # Library Code
│   │   │   ├── constants.ts            # App constants (PROGRAM_ID, API_URL)
│   │   │   ├── fairscale.ts            # FairScale API client
│   │   │   ├── idl.ts                  # Anchor IDL for smart contract
│   │   │   └── solana.ts               # Solana utilities (balance, airdrop)
│   │   ├── store/                      # State Management
│   │   │   └── useStore.ts             # Zustand global store
│   │   ├── types/                      # TypeScript Definitions
│   │   │   └── index.ts                # FairScoreResponse, Circle, Member
│   │   ├── App.tsx                     # Root app component
│   │   ├── App.css                     # Global styles
│   │   ├── main.tsx                    # React entry point
│   │   └── index.css                   # Tailwind directives
│   ├── .env.example                    # Environment variables template
│   ├── package.json                    # NPM dependencies
│   ├── package-lock.json
│   ├── tsconfig.json                   # TypeScript config
│   ├── tsconfig.app.json               # App-specific TS config
│   ├── tsconfig.node.json              # Node-specific TS config
│   ├── vite.config.ts                  # Vite bundler config
│   ├── eslint.config.js                # ESLint rules
│   └── README.md                       # Frontend-specific docs
│
├── backend/                            # Express.js Backend API
│   ├── src/
│   │   ├── config/                     # Configuration
│   │   │   └── index.ts                # Config loader (env vars, validation)
│   │   ├── middleware/                 # Express Middleware
│   │   │   └── errorHandler.ts         # Global error handler + 404
│   │   ├── routes/                     # API Routes
│   │   │   ├── fairscale.routes.ts     # /api/fairscale/* endpoints
│   │   │   └── health.routes.ts        # /api/health endpoint
│   │   ├── services/                   # Business Logic
│   │   │   └── fairscale.service.ts    # FairScale API integration
│   │   ├── types/                      # TypeScript Definitions
│   │   │   └── index.ts                # API response types
│   │   └── index.ts                    # Express app entry point
│   ├── dist/                           # Compiled JavaScript (gitignored)
│   ├── .env                            # Environment variables (gitignored)
│   ├── .env.example                    # Env template
│   ├── package.json                    # NPM dependencies
│   ├── package-lock.json
│   ├── tsconfig.json                   # TypeScript config
│   └── README.md                       # Backend-specific docs
│
└── faircircle-solana-program/          # Anchor Solana Program
    ├── programs/
    │   └── faircircle-solana-program/
    │       ├── src/
    │       │   └── lib.rs              # Solana program (Rust)
    │       │                           # Structs: Circle, CircleStatus
    │       │                           # Instructions: create_circle,
    │       │                           # join_circle, start_circle,
    │       │                           # contribute, claim_payout
    │       ├── Cargo.toml              # Rust dependencies
    │       └── Xargo.toml
    ├── tests/
    │   └── faircircle-solana-program.ts # Anchor tests (TypeScript)
    ├── migrations/
    │   └── deploy.ts                   # Deployment script
    ├── target/                         # Compiled program (gitignored)
    │   ├── deploy/
    │   │   └── faircircle_solana_program-keypair.json # Program keypair
    │   └── idl/
    │       └── faircircle_solana_program.json # Generated IDL
    ├── app/                            # Client SDK (auto-generated)
    ├── Anchor.toml                     # Anchor project config
    ├── Cargo.toml                      # Workspace Cargo config
    ├── package.json                    # NPM for tests
    ├── package-lock.json
    ├── tsconfig.json                   # TypeScript for tests
    └── .gitignore
```

### Key File Descriptions

#### Frontend

| File | Purpose | Key Exports/Features |
|------|---------|---------------------|
| `useCircleProgram.ts` | Solana program interactions | `createCircle()`, `joinCircle()`, `startCircle()`, `contribute()`, `claimPayout()`, `fetchCircle()`, `fetchAllCircles()` |
| `useFairScore.ts` | FairScore fetching & caching | `fairScore`, `loading`, `error`, `refetch()`, `isEligible()` |
| `fairscale.ts` | FairScale API client | `fetchFairScore(wallet)` - calls backend proxy |
| `idl.ts` | Anchor IDL | Type-safe program interface generated from Rust |
| `useStore.ts` | Zustand store | Global state: `fairScore`, `notifications`, `circles` |
| `constants.ts` | App constants | `PROGRAM_ID`, `API_BASE_URL`, `TIER_COLORS` |

#### Backend

| File | Purpose | Key Exports/Features |
|------|---------|---------------------|
| `fairscale.service.ts` | FairScale API wrapper | `getFairScore()`, `getFairScoreOnly()`, `getBatchFairScores()` |
| `fairscale.routes.ts` | API routes | `GET /api/fairscale/score`, `GET /api/fairscale/fairScore`, `POST /api/fairscale/batch` |
| `errorHandler.ts` | Error middleware | Handles 401, 404, 429, 500 errors with proper status codes |
| `config/index.ts` | Configuration loader | Validates env vars, exports typed config object |

#### Solana Program

| File | Purpose | Key Contents |
|------|---------|-------------|
| `lib.rs` | Smart contract | `Circle` struct (10KB account), `create_circle()`, `join_circle()`, `start_circle()`, `contribute()`, `claim_payout()` instructions |
| `target/idl/*.json` | Generated IDL | JSON representation of program interface for clients |

---

## 🛠 Setup & Installation

### Prerequisites

Ensure you have the following installed:

```bash
# Node.js 18+ and npm
node --version  # v18.0.0 or higher
npm --version   # 8.0.0 or higher

# Rust and Cargo (for Solana program)
rustc --version  # 1.70.0 or higher
cargo --version

# Solana CLI
solana --version  # 1.18.0 or higher
solana-keygen --version

# Anchor CLI (for Solana program development)
anchor --version  # 0.32.0 or higher
```

If you don't have these, install them:

```bash
# Node.js - via nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.32.1
avm use 0.32.1
```

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/faircircles.git
cd FAIRCIRCLES
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your FairScale API key
nano .env
```

**Required Environment Variables** (`.env`):
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# FairScale API
FAIRSCALE_API_URL=https://api.fairscale.xyz
FAIRSCALE_API_KEY=your_fairscale_api_key_here

# CORS (frontend origin)
CORS_ORIGINS=http://localhost:5173

# Solana
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
```

**Get a FairScale API Key**:
1. Fill out the form: https://forms.gle/heG1hfnjao4VShUS8
2. You'll receive an API key for the free tier
3. Paste it into `FAIRSCALE_API_KEY` in `.env`

```bash
# Build TypeScript
npm run build

# Start development server
npm run dev
```

✅Backend should be running at `http://localhost:3001`

Verify it's working:
```bash
curl http://localhost:3001/api/health
# Expected: {"status":"ok","timestamp":"...","environment":"development","version":"1.0.0"}
```

### 3. Solana Program Setup

```bash
cd ../faircircle-solana-program

# Install dependencies
npm install

# Build the program
anchor build

# Get your program ID
solana-keygen pubkey target/deploy/faircircle_solana_program-keypair.json
# Example output: BPFLoaderUpgradeab1e11111111111111111111111

# Copy the program ID and update it in two places:

# 1. Anchor.toml
nano Anchor.toml
# Update [programs.devnet] section:
# faircircle_solana_program = "YOUR_PROGRAM_ID_HERE"

# 2. lib.rs
nano programs/faircircle-solana-program/src/lib.rs
# Update the declare_id! macro:
# declare_id!("YOUR_PROGRAM_ID_HERE");

# Rebuild with updated program ID
anchor build

# Ensure you have devnet SOL
solana config set --url devnet
solana airdrop 2

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

Program should be deployed to Solana devnet

Copy the deployed program ID (you'll need it for the frontend).

### 4. Frontend Setup

```bash
cd ../faircircle-frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env
nano .env
```

**Required Environment Variables** (`.env`):
```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:3001/api

# Solana Configuration
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com

# Deployed Program ID (from step 3)
VITE_PROGRAM_ID=YOUR_PROGRAM_ID_HERE
```

**Update Constants** (if needed):

```bash
nano src/lib/constants.ts
```

Ensure `PROGRAM_ID` matches your deployed program:
```typescript
export const PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID_HERE');
```

```bash
# Start development server
npm run dev
```

 Frontend should be running at `http://localhost:5173`

### 5. Verify Full Stack

1. **Backend Health**: http://localhost:3001/api/health
2. **Frontend**: http://localhost:5173
3. **Solana Program**: Deployed on devnet

Try connecting your wallet and creating a circle!

---

##  Configuration

### Frontend Configuration (`faircircle-frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:3001/api` |
| `VITE_SOLANA_NETWORK` | Solana network (devnet/mainnet-beta) | `devnet` |
| `VITE_SOLANA_RPC_URL` | Solana RPC endpoint | `https://api.devnet.solana.com` |
| `VITE_PROGRAM_ID` | Deployed Anchor program address | Your deployed program ID |

### Backend Configuration (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Express server port | `3001` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `FAIRSCALE_API_URL` | FairScale API base URL | `https://api.fairscale.xyz` |
| `FAIRSCALE_API_KEY` | Your FairScale API key | **Required** |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:5173` |
| `SOLANA_NETWORK` | Solana network | `devnet` |
| `SOLANA_RPC_URL` | Solana RPC endpoint | `https://api.devnet.solana.com` |

### Solana Program Configuration (`Anchor.toml`)

```toml
[programs.devnet]
faircircle_solana_program = "YOUR_PROGRAM_ID"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

---

##  API Documentation

### Backend API Endpoints

Base URL: `http://localhost:3001/api`

#### 1. Health Check

**GET** `/health`

Returns API health status.

**Response** (200):
```json
{
  "status": "ok",
  "timestamp": "2026-01-23T10:30:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

#### 2. Get Complete FairScore

**GET** `/fairscale/score`

Fetches complete FairScore with metadata, badges, and features.

**Query Parameters**:
- `wallet` (required): Solana wallet address
- `twitter` (optional): Twitter/X username (without @)

**Example Request**:
```bash
curl "http://localhost:3001/api/fairscale/score?wallet=7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
```

**Response** (200):
```json
{
  "wallet": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "fair_score": 72.5,
  "tier": "gold",
  "badges": [
    {
      "id": "diamond_hands",
      "label": "Diamond Hands",
      "description": "Long-term holder with conviction",
      "tier": "platinum"
    }
  ],
  "last_updated": "2026-01-23T10:30:00.000Z",
  "features": {
    "lst_percentile_score": 85.2,
    "major_percentile_score": 78.5,
    "native_sol_percentile": 92.1,
    "stable_percentile_score": 65.4,
    "tx_count": 1234,
    "active_days": 187,
    "median_gap_hours": 12.5,
    "tempo_cv": 0.45,
    "burst_ratio": 0.23,
    "net_sol_flow_30d": 15.7,
    "median_hold_days": 45.2,
    "no_instant_dumps": 1,
    "conviction_ratio": 0.87,
    "platform_diversity": 8,
    "wallet_age_days": 245
  }
}
```

**Error Responses**:
- `400`: Missing or invalid wallet address
- `401`: Invalid FairScale API key (backend misconfiguration)
- `500`: Internal server error

#### 3. Get FairScore Only

**GET** `/fairscale/fairScore`

Lightweight endpoint for just the score value.

**Query Parameters**:
- `wallet` (required): Solana wallet address

**Response** (200):
```json
{
  "wallet": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "fair_score": 72.5
}
```

#### 4. Batch FairScores

**POST** `/fairscale/batch`

Fetch FairScores for multiple wallets (max 50).

**Request Body**:
```json
{
  "wallets": [
    "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "BvrL8Q7hNYC7XXbBfsoL8kkdQrwbeeYCqHerry52zSYF"
  ]
}
```

**Response** (200):
```json
{
  "scores": {
    "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU": 72.5,
    "BvrL8Q7hNYC7XXbBfsoL8kkdQrwbeeYCqHerry52zSYF": 68.3
  }
}
```

---

##  Smart Contract Details

### Program ID

```
Devnet: YOUR_DEPLOYED_PROGRAM_ID
```

### Account Structures

#### Circle Account (PDA)

**Size**: ~10 KB
**Seeds**: `["circle", creator.key()]`

```rust
pub struct Circle {
    pub creator: Pubkey,                    // 32 bytes - Circle creator
    pub name: String,                       // Max 50 chars
    pub contribution_amount: u64,           // Lamports per contribution
    pub period_length: i64,                 // Seconds between rounds
    pub min_fair_score: u8,                 // Minimum FairScore (0-100)
    pub current_round: u8,                  // Current round index (0-9)
    pub member_count: u8,                   // Number of members (1-10)
    pub payout_index: u8,                   // Current payout position
    pub total_pool: u64,                    // Total lamports in escrow
    pub status: CircleStatus,               // Forming, Active, Completed
    pub created_at: i64,                    // Unix timestamp
    pub round_start_time: i64,              // Start time of current round
    pub round_contributions_complete: bool, // All contributed this round?
    pub bump: u8,                           // PDA bump seed
    pub escrow_bump: u8,                    // Escrow PDA bump seed
    
    // Arrays (fixed size, MAX_MEMBERS = 10)
    pub members: [Pubkey; 10],              // Member wallet addresses
    pub fair_scores: [u8; 10],              // FairScores at join time
    pub payout_order: [u8; 10],             // Payout sequence (sorted by score)
    pub contributions: [[bool; 10]; 10],    // 2D: [member][round]
    pub has_claimed: [bool; 10],            // Has member claimed their payout?
}
```

#### CircleStatus Enum

```rust
pub enum CircleStatus {
    Forming,    // Accepting new members
    Active,     // Rounds in progress
    Completed,  // All payouts distributed
}
```

### Instructions

#### 1. create_circle

Creates a new lending circle.

**Accounts**:
- `creator` (signer, mut): Circle creator's wallet
- `circle` (init, mut): Circle PDA
- `escrow` (init, mut): Escrow PDA
- `system_program`: System program

**Arguments**:
```rust
pub fn create_circle(
    ctx: Context<CreateCircle>,
    name: String,              // Max 50 chars
    contribution_amount: u64,  // Lamports
    period_length: i64,        // Seconds
    min_fair_score: u8,        // 0-100
    creator_fair_score: u8,    // Creator's actual score
) -> Result<()>
```

**Validations**:
- `name.len() <= 50`
- `contribution_amount > 0`
- `period_length > 0`
- `creator_fair_score >= min_fair_score`

**Example**:
```typescript
await program.methods
  .createCircle(
    "Weekend Savers",
    new BN(1_000_000_000), // 1 SOL
    new BN(604800),        // 7 days
    60,                     // Min score: 60
    72                      // Creator's score: 72
  )
  .accounts({
    creator: wallet.publicKey,
    circle: circlePDA,
    escrow: escrowPDA,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

#### 2. join_circle

Join an existing circle.

**Accounts**:
- `member` (signer): Joining member's wallet
- `circle` (mut): Circle PDA
- `creator`: Circle creator (for PDA derivation)

**Arguments**:
```rust
pub fn join_circle(
    ctx: Context<JoinCircle>,
    fair_score: u8,  // Member's FairScore
) -> Result<()>
```

**Validations**:
- Circle status is `Forming`
- `fair_score >= circle.min_fair_score`
- `circle.member_count < MAX_MEMBERS` (10)
- Member not already in circle

#### 3. start_circle

Activate the circle and set payout order (creator only).

**Accounts**:
- `creator` (signer): Must match circle.creator
- `circle` (mut): Circle PDA

**Arguments**: None

**Process**:
1. Validate caller is creator
2. Validate status is `Forming`
3. Sort members by FairScore (descending)
4. Populate `payout_order` array
5. Set status to `Active`
6. Record `round_start_time`

#### 4. contribute

Contribute SOL to the current round.

**Accounts**:
- `member` (signer, mut): Contributing member
- `circle` (mut): Circle PDA
- `escrow` (mut): Escrow PDA
- `creator`: Circle creator
- `system_program`: System program

**Arguments**: None (contribution amount is from `circle.contribution_amount`)

**Validations**:
- Circle status is `Active`
- Member is in the circle
- Member hasn't contributed to current round yet

**Transfer**:
- Transfers `circle.contribution_amount` lamports from member to escrow
- Marks `contributions[member_index][current_round] = true`
- If all members contributed, sets `round_contributions_complete = true`

#### 5. claim_payout

Claim the pooled funds when it's your turn.

**Accounts**:
- `claimant` (signer, mut): Member claiming payout
- `circle` (mut): Circle PDA
- `escrow` (mut): Escrow PDA
- `creator`: Circle creator
- `system_program`: System program

**Arguments**: None

**Validations**:
- Circle status is `Active`
- `round_contributions_complete == true`
- Claimant is the current payout recipient: `members[payout_order[payout_index]] == claimant`
- Claimant hasn't already claimed: `has_claimed[member_index] == false`

**Transfer**:
- Transfers `total_pool` lamports from escrow to claimant
- Marks `has_claimed[member_index] = true`
- Increments `payout_index`
- If last payout, sets status to `Completed`
- Otherwise, increments `current_round` and resets `round_contributions_complete`

---

##  Development Guide

### Running Locally

1. **Start Backend** (Terminal 1):
```bash
cd backend
npm run dev
# Server running on http://localhost:3001
```

2. **Start Frontend** (Terminal 2):
```bash
cd faircircle-frontend
npm run dev
# Vite dev server on http://localhost:5173
```

3. **Solana Program** (already deployed):
```bash
# If you need to redeploy:
cd faircircle-solana-program
anchor build
anchor deploy --provider.cluster devnet
```

### Development Workflow

#### Making Frontend Changes

1. Edit files in `faircircle-frontend/src/`
2. Vite hot-reloads automatically
3. Check browser console for errors
4. TypeScript errors appear in terminal

#### Making Backend Changes

1. Edit files in `backend/src/`
2. `tsx watch` auto-restarts server
3. Check terminal for logs
4. Test endpoints with `curl` or Postman

#### Making Solana Program Changes

1. Edit `programs/faircircle-solana-program/src/lib.rs`
2. Build: `anchor build`
3. Deploy: `anchor deploy --provider.cluster devnet`
4. Update frontend IDL:
```bash
cp target/idl/faircircle_solana_program.json \
   ../faircircle-frontend/src/lib/idl.json
```
5. Update `idl.ts` in frontend if needed
6. Restart frontend

### Common Development Tasks

#### Add a New Component

```bash
cd faircircle-frontend/src/components
touch MyNewComponent.tsx
```

```typescript
import React from 'react';

export function MyNewComponent() {
  return <div>My Component</div>;
}
```

#### Add a New API Endpoint

**Backend** (`backend/src/routes/myroute.routes.ts`):
```typescript
import { Router } from 'express';

const router = Router();

router.get('/myendpoint', async (req, res) => {
  res.json({ message: 'Hello' });
});

export default router;
```

**Register in** `backend/src/index.ts`:
```typescript
import myRoutes from './routes/myroute.routes.js';
app.use('/api/my', myRoutes);
```

#### Add a New Solana Instruction

**In** `lib.rs`:
```rust
pub fn my_instruction(ctx: Context<MyContext>) -> Result<()> {
    // Your logic
    Ok(())
}

#[derive(Accounts)]
pub struct MyContext<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
}
```

**Frontend Hook**:
```typescript
const myInstruction = useCallback(async () => {
  await program.methods
    .myInstruction()
    .accounts({ user: wallet.publicKey })
    .rpc();
}, [program, wallet]);
```

### Debugging Tips

#### Frontend
- Open browser DevTools (F12)
- Check Console tab for errors
- Use React DevTools extension
- Check Network tab for API calls
- Use Zustand DevTools for state

#### Backend
- Check terminal logs
- Add `console.log()` statements
- Use `morgan` middleware (already configured)
- Test endpoints with curl:
```bash
curl -i http://localhost:3001/api/fairscale/score?wallet=...
```

#### Solana Program
- Check Anchor build errors carefully
- Use `msg!()` macro for logging:
```rust
msg!("Debug: value = {}", value);
```
- View logs after transaction:
```typescript
const tx = await program.methods.myInstruction()...
console.log(await connection.getTransaction(tx));
```
- Use Solana Explorer: https://explorer.solana.com/?cluster=devnet

---

##  Testing

### Frontend Tests

```bash
cd faircircle-frontend

# Run unit tests (if configured)
npm test

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

### Backend Tests

```bash
cd backend

# Type checking
npx tsc --noEmit

# Run tests (if configured)
npm test

# Manual endpoint testing
curl http://localhost:3001/api/health
```

### Solana Program Tests

```bash
cd faircircle-solana-program

# Run Anchor tests
anchor test

# Run specific test file
anchor test --skip-local-validator tests/faircircle-solana-program.ts
```

**Example Test** (`tests/faircircle-solana-program.ts`):
```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { FaircircleSolanaProgram } from "../target/types/faircircle_solana_program";
import { expect } from "chai";

describe("faircircle-solana-program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.FaircircleSolanaProgram as Program<FaircircleSolanaProgram>;

  it("Creates a circle", async () => {
    const [circlePDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("circle"), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .createCircle(
        "Test Circle",
        new anchor.BN(1_000_000_000),
        new anchor.BN(86400),
        50,
        75
      )
      .accounts({
        creator: provider.wallet.publicKey,
      })
      .rpc();

    const circle = await program.account.circle.fetch(circlePDA);
    expect(circle.name).to.equal("Test Circle");
    expect(circle.memberCount).to.equal(1);
  });
});
```

### Manual Testing Checklist

**User Flow Test**:
- [ ] Connect wallet (Phantom)
- [ ] View FairScore card
- [ ] Request airdrop (if low SOL)
- [ ] Create a circle
- [ ] Join a circle (with second wallet)
- [ ] Start a circle (as creator)
- [ ] Contribute to round 1
- [ ] Claim payout (first member)
- [ ] Contribute to round 2
- [ ] Claim payout (second member)
- [ ] View completed circle

---

##  Deployment

### Deploying to Production

#### 1. Deploy Solana Program to Mainnet

```bash
cd faircircle-solana-program

# Switch to mainnet
solana config set --url mainnet-beta

# Ensure you have SOL for deployment (costs ~5-10 SOL)
solana balance

# Build
anchor build

# Deploy
anchor deploy --provider.cluster mainnet-beta

# Note the program ID
solana-keygen pubkey target/deploy/faircircle_solana_program-keypair.json
```

#### 2. Deploy Backend

**Option A: VPS (DigitalOcean, AWS EC2)**

```bash
# On your server
git clone https://github.com/yourusername/faircircles.git
cd FAIRCIRCLES/backend

# Install dependencies
npm install --production

# Set environment variables
nano .env  # Add production values

# Build
npm run build

# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start dist/index.js --name faircircles-backend
pm2 save
pm2 startup  # Follow instructions
```

**Option B: Vercel/Netlify Functions**

Convert Express routes to serverless functions (refer to platform docs).

**Option C: Docker**

```dockerfile
# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

```bash
docker build -t faircircles-backend .
docker run -p 3001:3001 --env-file .env faircircles-backend
```

#### 3. Deploy Frontend

**Option A: Vercel** (Recommended for Vite)

```bash
cd faircircle-frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts, add environment variables in Vercel dashboard
```

**Option B: Netlify**

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

**Option C: Static Hosting (AWS S3, Cloudflare Pages)**

```bash
# Build
npm run build

# Upload dist/ folder to your hosting provider
```

**Update Environment Variables**:
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_SOLANA_NETWORK=mainnet-beta
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_PROGRAM_ID=your_mainnet_program_id
```

#### 4. Update Backend CORS

In production backend `.env`:
```env
CORS_ORIGINS=https://your-frontend-domain.com
```

---

##  Troubleshooting

### Common Issues

#### 1. "Cannot read properties of undefined (reading 'wallet_age_days')"

**Cause**: FairScore data not loaded

**Solution**: 
- Check backend is running (`http://localhost:3001/api/health`)
- Verify FairScale API key in `backend/.env`
- Frontend should gracefully handle this with fallback

#### 2. "Simulation failed: Attempt to debit an account"

**Cause**: Insufficient SOL balance for transaction + rent

**Solution**:
- Check wallet balance (need 0.5+ SOL)
- Request airdrop: Click "Request Airdrop" button or:
```bash
solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet
```
- Wait ~30 seconds for airdrop to confirm

#### 3. "Program ID mismatch" or "Account not found"

**Cause**: Frontend using wrong program ID or program not deployed

**Solution**:
- Verify program deployed:
```bash
solana program show YOUR_PROGRAM_ID --url devnet
```
- Update `VITE_PROGRAM_ID` in frontend `.env`
- Update `PROGRAM_ID` in `faircircle-frontend/src/lib/constants.ts`
- Restart frontend dev server

#### 4. "CORS policy blocked request to FairScale API"

**Cause**: Direct frontend → FairScale API calls blocked

**Solution**: Requests should go through backend proxy
- Verify `VITE_API_BASE_URL=http://localhost:3001/api` in frontend `.env`
- Check `fairscale.ts` uses `API_BASE_URL`, not direct FairScale URL

#### 5. "Transaction timeout" or "Blockhash not found"

**Cause**: Slow RPC or network congestion

**Solution**:
- Use a premium RPC (Helius, QuickNode, Alchemy)
- Update `VITE_SOLANA_RPC_URL` in frontend `.env`
- Retry the transaction

### Debug Logs

#### View Backend Logs
```bash
cd backend
npm run dev
# Logs appear in terminal
```

#### View Solana Transaction Logs
```typescript
// In frontend, after transaction:
const tx = await program.methods.contribute()...
console.log("Transaction:", tx);

// View in Solana Explorer:
console.log(`https://explorer.solana.com/tx/${tx}?cluster=devnet`);
```

#### Enable Anchor Logs
```bash
# In Solana program, use msg! macro:
msg!("Debug: current_round = {}", circle.current_round);
```

---

##  Security Considerations

### Smart Contract Security

1. **PDA Validation**: All PDAs are derived with proper seeds and bumps
2. **Signer Checks**: Critical operations verify `ctx.accounts.user.is_signer`
3. **Ownership Checks**: Accounts validated to be owned by correct programs
4. **State Validation**: Status checks prevent operations in wrong phase
5. **Overflow Protection**: Using checked arithmetic where needed

**Known Limitations**:
- No slashing for defaults (future feature)
- No multi-sig for circle creation
- Fixed max 10 members

### Backend Security

1. **API Key Protection**: FairScale API key in `.env`, never exposed to frontend
2. **CORS**: Strict origin checking
3. **Input Validation**: All inputs sanitized

**Production Checklist**:
- [ ] Use HTTPS for all endpoints
- [ ] Implement authentication if needed
- [ ] Regular security audits

### Frontend Security

1. **Wallet Adapter**: Using official Solana Wallet Adapter
2. **No Private Keys**: Never storing or transmitting private keys
3. **Transaction Preview**: Users see transaction details before signing
4. **Error Handling**: Sensitive data not leaked in error messages

---

##  FairScore Tiers

| Tier | Range | Color | Badge | Access |
|------|-------|-------|-------|--------|
| 🏆 **Platinum** | 80-100 | Purple | Highest | All circles |
| 🥇 **Gold** | 60-79 | Yellow | High | Most circles |
| 🥈 **Silver** | 40-59 | Gray | Medium | Standard circles |
| 🥉 **Bronze** | 20-39 | Brown | Low | Entry circles |
| ⚫ **Unrated** | 0-19 | Black | None | Limited access |

**Tier Benefits**:
- Higher tier = Earlier payout position
- Access to exclusive high-reputation circles
- Future: Interest rate reductions, higher contribution limits

---

##  Why ROSCAs?

### Global Impact

ROSCAs serve **1+ billion people** worldwide:
- **India**: Chit funds - $20B+ market
- **Latin America**: Tandas - Primary savings for millions
- **West Africa**: Susus - Essential community finance
- **East Asia**: Hui - Centuries-old tradition

### Advantages Over Traditional Finance

| Traditional Banking | ROSCAs | FairCircles |
|-------------------|--------|-------------|
| Credit checks | Social trust | FairScore reputation |
| Collateral required | No collateral | No collateral |
| High interest rates | No interest | No interest |
| Exclusionary | Community-based | Global + permissionless |
| Opaque terms | Face-to-face | Transparent on-chain |

### Crypto-Native Improvements

✅ **Trustless**: Smart contracts enforce rules
✅ **Transparent**: All transactions on-chain
✅ **Global**: No geographic boundaries
✅ **Programmable**: Custom rules per circle
✅ **Reputation**: FairScale adds objective scoring
✅ **Accessible**: Anyone with a wallet can participate

---

##  Additional Resources

### FairScale
- **Website**: https://fairscale.xyz
- **API Docs**: https://api.fairscale.xyz
- **Telegram**: https://t.me/+WQlko_c5blJhN2E0
- **Twitter**: https://x.com/fairscalexyz

### Solana
- **Docs**: https://docs.solana.com
- **Anchor Book**: https://book.anchor-lang.com
- **Solana Cookbook**: https://solanacookbook.com
- **Devnet Faucet**: https://faucet.solana.com

### Tools
- **Solana Explorer**: https://explorer.solana.com/?cluster=devnet
- **Anchor**: https://www.anchor-lang.com

---

##  Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<div align="center">

**Made with ❤️ for the Solana ecosystem**

</div>
