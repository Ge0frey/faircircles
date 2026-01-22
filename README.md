# FairCircles - Reputation-Based Lending Circles (ROSCAs)

FairCircles brings the centuries-old tradition of Rotating Savings and Credit Associations (ROSCAs) to Solana, powered by [FairScale](https://fairscale.xyz) reputation scoring.

Known globally as **chit funds** (India), **tandas** (Latin America), **susus** (West Africa), and **hui** (China), ROSCAs have served over 1 billion people worldwide. FairCircles makes this financial primitive trustless, transparent, and reputation-aware.

![FairCircles](https://img.shields.io/badge/Solana-Devnet-blueviolet) ![FairScale](https://img.shields.io/badge/Powered%20by-FairScale-green)

## 🎯 How It Works

1. **Circle Formation**: Users create "Trust Circles" of 3-10 members. Each circle has a minimum FairScore requirement (e.g., Silver tier 40+)

2. **Contributions**: Members contribute a fixed SOL amount each period (e.g., 1 SOL weekly)

3. **Rotation**: The pooled funds rotate to one member each period

4. **FairScore-Ordered Payouts**: Payout order is determined by FairScore:
   - **Higher FairScore** = Earlier payout (reward for reputation)
   - **Lower FairScore** = Later payout (prove commitment first)

5. **Badge Rewards**: Completing a full circle without default builds reputation

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FairCircles dApp                        │
├─────────────────────────────────────────────────────────────┤
│  React Frontend                                              │
│  ├── Wallet Connect (Phantom / Solflare)                     │
│  ├── Circle Discovery & Creation                             │
│  ├── FairScore Display & Tier Visualization                  │
│  └── Contribution / Payout Dashboard                         │
├─────────────────────────────────────────────────────────────┤
│  FairScale API Integration                                   │
│  ├── /score endpoint - Full score with badges & features     │
│  ├── Tier-based access gating                                │
│  └── Payout order calculation by FairScore                   │
├─────────────────────────────────────────────────────────────┤
│  Solana Program (Anchor)                                     │
│  ├── Circle PDA (members, contributions, payout_index)       │
│  ├── Escrow Account (holds pooled SOL)                       │
│  └── Instructions: create, join, start, contribute, claim    │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 FairScale Integration

FairCircles uses FairScale in **three meaningful ways**:

### 1. Access Gating
- Circle creators set minimum FairScore requirements (Bronze 20+, Silver 40+, Gold 60+, Platinum 80+)
- Users can only join circles where they meet the tier threshold
- Prevents low-reputation wallets from participating in high-trust circles

### 2. Payout Order
- Members are sorted by FairScore when the circle starts
- Higher FairScore = earlier position in payout rotation
- Rewards established reputation with priority access to pooled funds

### 3. Risk Management
- Lower-reputation members must contribute multiple rounds before receiving payout
- Proves commitment and reduces default risk for the group
- Creates natural incentive to build onchain reputation

## 📦 Project Structure

```
FAIRCIRCLES/
├── faircircle-frontend/          # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/           # UI Components
│   │   ├── hooks/                # Custom React hooks
│   │   ├── lib/                  # FairScale API, constants
│   │   ├── store/                # Zustand state management
│   │   └── types/                # TypeScript types
│   └── package.json
│
├── faircircle-solana-program/    # Anchor program
│   ├── programs/
│   │   └── faircircle-solana-program/
│   │       └── src/lib.rs        # Circle PDA, escrow, instructions
│   ├── tests/
│   └── Anchor.toml
│
└── README.md
```

## 🛠 Setup & Installation

### Prerequisites
- Node.js 18+
- Rust & Cargo
- Solana CLI
- Anchor CLI

### Frontend Setup

```bash
cd faircircle-frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Solana Program Setup

```bash
cd faircircle-solana-program

# Build the program
anchor build

# Get your program keypair
solana-keygen pubkey target/deploy/faircircle_solana_program-keypair.json

# Update Anchor.toml and lib.rs with the program ID

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Run tests
anchor test
```

## 🎨 FairScore Tiers

| Tier | FairScore | Payout Priority | Description |
|------|-----------|-----------------|-------------|
| 🏆 Platinum | 80+ | First | Elite reputation, maximum trust |
| 🥇 Gold | 60-79 | Early | High trust, proven track record |
| 🥈 Silver | 40-59 | Standard | Established reputation |
| 🥉 Bronze | 20-39 | Later | Building trust, proves commitment |
| ⚫ Unrated | 0-19 | Last | Limited access to circles |

## 🔑 API Configuration

The frontend connects to FairScale API at `https://api.fairscale.xyz`:

```typescript
// Endpoints used:
GET /score?wallet={address}     // Full score with badges, features, tier
GET /fairScore?wallet={address} // Score value only
```

## 📋 Smart Contract Instructions

| Instruction | Description |
|-------------|-------------|
| `create_circle` | Create a new circle with name, contribution amount, period, min FairScore |
| `join_circle` | Join an existing circle (checks FairScore requirement) |
| `start_circle` | Start the circle and set payout order by FairScore (creator only) |
| `contribute` | Contribute SOL to the current round's pool |
| `claim_payout` | Claim the pool when it's your turn |

## 🌍 Why ROSCAs?

- **Culturally Resonant**: Used by 1B+ people globally
- **Proven Model**: Centuries of real-world usage
- **Crypto-Native**: Trustless, transparent, onchain
- **Reputation-Powered**: FairScale adds risk management
- **Unique**: First reputation-scored ROSCAs on Solana

## 🔗 Links

- [FairScale](https://fairscale.xyz) - Reputation scoring infrastructure
- [FairScale API Docs](https://api.fairscale.xyz) - API documentation
- [Solana](https://solana.com) - Blockchain platform

## 📄 License

MIT

---

Built for the FairScale Challenge 🏆
