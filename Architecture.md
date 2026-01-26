# FairCircles Architecture

> A decentralized Rotating Savings and Credit Association (ROSCA) built on Solana with reputation-based payout prioritization.

---

## High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    USER (Browser)                                       │
│                              Phantom / Solflare Wallet                                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          │ Wallet Connection
                                          │ Transaction Signing
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               FAIRCIRCLE FRONTEND                                       │
│                           (React 19 + TypeScript + Vite)                                │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                              Components Layer                                    │   │
│  │  ┌──────────┐ ┌───────────┐ ┌──────────────┐ ┌────────────┐ ┌───────────────┐  │   │
│  │  │Dashboard │ │CircleCard │ │ CircleDetail │ │CreateCircle│ │ FairScoreCard │  │   │
│  │  │          │ │           │ │              │ │    Form    │ │               │  │   │
│  │  └──────────┘ └───────────┘ └──────────────┘ └────────────┘ └───────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                Hooks Layer                                       │   │
│  │         ┌──────────────────────┐         ┌───────────────────────┐              │   │
│  │         │  useCircleProgram    │         │    useFairScore       │              │   │
│  │         │  (Solana Program     │         │    (Backend API       │              │   │
│  │         │   Interaction)       │         │     Integration)      │              │   │
│  │         └──────────────────────┘         └───────────────────────┘              │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                           State Management (Zustand)                             │   │
│  │      ┌────────────────┐  ┌─────────────────┐  ┌──────────────────────┐          │   │
│  │      │  Circles State │  │ FairScore Cache │  │  UI State (Tabs,     │          │   │
│  │      │  (All Circles) │  │   (5-min TTL)   │  │   Notifications)     │          │   │
│  │      └────────────────┘  └─────────────────┘  └──────────────────────┘          │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
           │                                                           │
           │ RPC Calls                                                 │ REST API
           │ (Anchor SDK)                                              │ (/api/fairscale)
           ▼                                                           ▼
┌──────────────────────────────────┐                 ┌──────────────────────────────────┐
│      SOLANA BLOCKCHAIN           │                 │          BACKEND                 │
│          (Devnet)                │                 │    (Express.js + TypeScript)     │
│                                  │                 │                                  │
│  ┌────────────────────────────┐  │                 │  ┌────────────────────────────┐  │
│  │  FairCircle Solana Program │  │                 │  │        Routes              │  │
│  │  (Anchor/Rust)             │  │                 │  │  ┌────────────────────┐   │  │
│  │                            │  │                 │  │  │ /api/health        │   │  │
│  │  Program ID:               │  │                 │  │  │ /api/fairscale/*   │   │  │
│  │  FeuH9rfHZ8XuMQrFV...      │  │                 │  │  └────────────────────┘   │  │
│  │                            │  │                 │  └────────────────────────────┘  │
│  │  ┌──────────────────────┐  │  │                 │  ┌────────────────────────────┐  │
│  │  │   Instructions       │  │  │                 │  │   FairScale Service        │  │
│  │  │   • create_circle    │  │  │                 │  │   • Score Normalization    │  │
│  │  │   • join_circle      │  │  │                 │  │   • Batch Processing       │  │
│  │  │   • start_circle     │  │  │                 │  │   • Error Handling         │  │
│  │  │   • contribute       │  │  │                 │  └────────────────────────────┘  │
│  │  │   • claim_payout     │  │  │                 │                │                │
│  │  │   • update_fair_score│  │  │                 │                │ HTTP Request   │
│  │  └──────────────────────┘  │  │                 │                ▼                │
│  │                            │  │                 │  ┌────────────────────────────┐  │
│  │  ┌──────────────────────┐  │  │                 │  │   External: FairScale API  │  │
│  │  │   PDAs (Accounts)    │  │  │                 │  │   (api.fairscale.xyz)      │  │
│  │  │   • Circle PDA       │  │  │                 │  │   • Reputation Scores      │  │
│  │  │   • Escrow PDA       │  │  │                 │  │   • Tier & Badges          │  │
│  │  └──────────────────────┘  │  │                 │  └────────────────────────────┘  │
│  └────────────────────────────┘  │                 │                                  │
└──────────────────────────────────┘                 └──────────────────────────────────┘
```

---

## Component Architecture

### Frontend Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 App.tsx                                     │
│                     (Root - Wallet Provider Wrapper)                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              ▼                      ▼                      ▼
    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │    Header       │    │  Notifications  │    │  Main Content   │
    │  • Logo         │    │  • Toast Queue  │    │                 │
    │  • FairScore    │    │  • Auto-dismiss │    │                 │
    │  • WalletButton │    │                 │    │                 │
    └─────────────────┘    └─────────────────┘    └─────────────────┘
                                                           │
                                    ┌──────────────────────┴──────────────────────┐
                                    │                                             │
                           (wallet connected?)                           (not connected)
                                    │                                             │
                                    ▼                                             ▼
                          ┌─────────────────┐                           ┌─────────────────┐
                          │    Dashboard    │                           │   LandingPage   │
                          │                 │                           │                 │
                          │  Tabs:          │                           │  • Hero Section │
                          │  • Discover     │                           │  • Features     │
                          │  • My Circles   │                           │  • How It Works │
                          │  • Create       │                           │  • CTA          │
                          └─────────────────┘                           └─────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌─────────────────┐      ┌───────────────────┐      ┌─────────────────────┐
│   CircleCard    │      │   CircleDetail    │      │  CreateCircleForm   │
│                 │      │                   │      │                     │
│  • Circle Info  │◄────►│  • Full Details   │      │  • Name Input       │
│  • Join Button  │      │  • Member List    │      │  • Contribution Amt │
│  • Status Badge │      │  • Actions Panel  │      │  • Period Length    │
│  • Pool Display │      │  • Round Progress │      │  • Min FairScore    │
└─────────────────┘      └───────────────────┘      └─────────────────────┘
                                    │
                         ┌──────────┴──────────┐
                         ▼                     ▼
               ┌─────────────────┐   ┌─────────────────┐
               │  FairScoreCard  │   │  WalletBalance  │
               │                 │   │                 │
               │  • Score (0-100)│   │  • SOL Balance  │
               │  • Tier Badge   │   │  • USD Value    │
               │  • Metrics      │   │                 │
               └─────────────────┘   └─────────────────┘
```

---

## Solana Program Architecture

### Account Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CIRCLE PDA                                        │
│                   Seeds: ["circle", creator, name]                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐  │
│  │     creator     │      name       │  contribution   │  period_length  │  │
│  │    (Pubkey)     │   (String[32])  │     _amount     │     (i64)       │  │
│  │                 │                 │      (u64)      │   in seconds    │  │
│  └─────────────────┴─────────────────┴─────────────────┴─────────────────┘  │
│                                                                             │
│  ┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐  │
│  │ min_fair_score  │  current_round  │   member_count  │     status      │  │
│  │     (u8)        │      (u8)       │      (u8)       │ (CircleStatus)  │  │
│  │    0-100        │     1-10        │      3-10       │                 │  │
│  └─────────────────┴─────────────────┴─────────────────┴─────────────────┘  │
│                                                                             │
│  ┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐  │
│  │   created_at    │round_start_time │   total_pool    │round_contrib_   │  │
│  │     (i64)       │     (i64)       │     (u64)       │  complete(bool) │  │
│  └─────────────────┴─────────────────┴─────────────────┴─────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      members: [Pubkey; 10]                            │  │
│  │                    (Array of member wallets)                          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      fair_scores: [u8; 10]                            │  │
│  │                    (Score for each member)                            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      payout_order: [u8; 10]                           │  │
│  │              (Indices sorted by FairScore descending)                 │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    contributions: [[bool; 10]; 10]                    │  │
│  │                     (Round × Member matrix)                           │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           ESCROW PDA                                        │
│                   Seeds: ["escrow", creator, name]                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                    ┌─────────────────────────────────┐                      │
│                    │         SOL Balance             │                      │
│                    │   (Pooled Contributions)        │                      │
│                    │                                 │                      │
│                    │   Receives: contribute()        │                      │
│                    │   Sends to: claim_payout()      │                      │
│                    └─────────────────────────────────┘                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Circle Status State Machine

```
                                    ┌─────────────┐
                                    │   FORMING   │
                                    │  (Initial)  │
                                    └──────┬──────┘
                                           │
                            create_circle()│
                                           │
                        ┌──────────────────┼──────────────────┐
                        │                  │                  │
                        ▼                  ▼                  ▼
               ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
               │ join_circle │    │ join_circle │    │ join_circle │
               │  Member 2   │    │  Member 3   │    │  Member N   │
               └─────────────┘    └─────────────┘    └─────────────┘
                        │                  │                  │
                        └──────────────────┼──────────────────┘
                                           │
                             start_circle()│ (≥3 members)
                                           │
                                           ▼
                                    ┌─────────────┐
                                    │   ACTIVE    │
                                    │ (Rounds in  │
                                    │  progress)  │
                                    └──────┬──────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    │                                             │
                    ▼                                             │
           ┌─────────────────┐                                    │
           │   ROUND LOOP    │◄───────────────────────────────────┤
           │                 │                                    │
           │  1. contribute()│                                    │
           │  2. contribute()│                                    │
           │     ...         │                                    │
           │  N. contribute()│                                    │
           │                 │                                    │
           │  claim_payout() │                                    │
           └────────┬────────┘                                    │
                    │                                             │
                    ├──────── (more rounds) ──────────────────────┘
                    │
                    │ (all rounds complete)
                    ▼
             ┌─────────────┐
             │  COMPLETED  │
             │  (Finished) │
             └─────────────┘
```

### Instruction Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INSTRUCTION FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  CREATE_CIRCLE                                                              │
│  ─────────────                                                              │
│                                                                             │
│   Creator ──┬──► Validate Params ──► Init Circle PDA ──► Init Escrow PDA   │
│             │         │                    │                    │           │
│             │    • name ≤32 chars      • Set creator        • Empty         │
│             │    • amount > 0          • Add as member 1    • Ready for     │
│             │    • period > 0          • Set status:          contributions │
│             │    • score 0-100           FORMING                            │
│             │                                                               │
└─────────────┴───────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  JOIN_CIRCLE                                                                │
│  ───────────                                                                │
│                                                                             │
│   Member ──┬──► Check Status ──► Validate Score ──► Add to Members Array    │
│            │         │                 │                    │               │
│            │    • Must be          • score ≥               • Increment      │
│            │      FORMING           min_fair_score          member_count    │
│            │    • Not full         • Not already          • Store score     │
│            │      (< 10)             joined                                 │
│            │                                                                │
└────────────┴────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  START_CIRCLE                                                               │
│  ────────────                                                               │
│                                                                             │
│   Creator ──┬──► Verify Creator ──► Check Members ──► Calculate Payout Order│
│             │         │                   │                    │            │
│             │    • Must be           • ≥ 3 members        • Sort by         │
│             │      creator           • Status:              FairScore       │
│             │                          FORMING              (descending)    │
│             │                                             • Set status:     │
│             │                                               ACTIVE          │
│             │                                                               │
└─────────────┴───────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  CONTRIBUTE                                                                 │
│  ──────────                                                                 │
│                                                                             │
│   Member ──┬──► Verify Member ──► Check Round ──► Transfer SOL ──► Update   │
│            │         │                │               │             State   │
│            │    • Must be         • Status:       • From member       │     │
│            │      member            ACTIVE          wallet            │     │
│            │    • Not already     • Correct       • To escrow         │     │
│            │      contributed       round           PDA               │     │
│            │                                                    ┌─────┘     │
│            │                                                    ▼           │
│            │                                           • Mark contributed   │
│            │                                           • Update total_pool  │
│            │                                           • Check if all done  │
│            │                                                                │
└────────────┴────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  CLAIM_PAYOUT                                                               │
│  ────────────                                                               │
│                                                                             │
│  Recipient ──┬──► Verify Recipient ──► Check Round ──► Transfer Pool ──►    │
│              │         │                   │               │          Advance│
│              │    • Must match         • All have      • From escrow      │ │
│              │      payout_order         contributed    • To recipient    │ │
│              │      [current_round]    • Not claimed                 ┌────┘ │
│              │                                                       ▼      │
│              │                                              • Increment     │
│              │                                                current_round │
│              │                                              • Reset         │
│              │                                                contributions │
│              │                                              • If last round:│
│              │                                                → COMPLETED   │
│              │                                                              │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

## Backend Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND SERVER                                 │
│                         (Express.js + TypeScript)                           │
│                              Port: 3001                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
     ┌───────────────────────────────┼───────────────────────────────┐
     │                               │                               │
     ▼                               ▼                               ▼
┌─────────────┐            ┌──────────────────┐            ┌──────────────────┐
│  Middleware │            │      Routes      │            │    Services      │
├─────────────┤            ├──────────────────┤            ├──────────────────┤
│             │            │                  │            │                  │
│  • Helmet   │            │  /api/health     │◄──────────►│  Health Service  │
│    (Security)│            │    GET /         │            │                  │
│             │            │    GET /config   │            │                  │
│  • CORS     │            │                  │            │                  │
│    (Origins)│            │  /api/fairscale  │◄──────────►│ FairScale Service│
│             │            │    GET /score    │            │  • getFairScore  │
│  • Morgan   │            │    GET /fairScore│            │  • getBatch      │
│    (Logging)│            │    POST /batch   │            │  • normalize     │
│             │            │                  │            │                  │
│  • JSON     │            └──────────────────┘            └──────────────────┘
│    (Parser) │                                                    │
│             │                                                    │
│  • Error    │                                                    ▼
│    Handler  │                                     ┌──────────────────────────┐
│             │                                     │   External API Call      │
└─────────────┘                                     │                          │
                                                    │   FairScale API          │
                                                    │   api.fairscale.xyz      │
                                                    │                          │
                                                    │   • GET /score?wallet=   │
                                                    │   • Returns reputation   │
                                                    │     data, tier, badges   │
                                                    │                          │
                                                    └──────────────────────────┘
```

### API Endpoints

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/api/health` | GET | Server health check | `{ status, timestamp, env, version }` |
| `/api/health/config` | GET | Non-sensitive config | `{ solanaNetwork, fairscaleUrl, hasApiKey }` |
| `/api/fairscale/score` | GET | Full FairScore data | `{ fairScore, tier, badges, features, actions }` |
| `/api/fairscale/fairScore` | GET | Score only (lightweight) | `{ fairScore }` |
| `/api/fairscale/batch` | POST | Batch scores (≤50) | `{ scores: { [wallet]: number } }` |

---

## Data Flow Diagrams

### Circle Creation Flow

```
┌──────────┐     ┌──────────────┐     ┌────────────────┐     ┌─────────────────┐
│   User   │     │   Frontend   │     │     Backend    │     │ Solana Program  │
│          │     │              │     │                │     │                 │
└────┬─────┘     └──────┬───────┘     └───────┬────────┘     └────────┬────────┘
     │                  │                     │                       │
     │ 1. Fill Form     │                     │                       │
     │─────────────────►│                     │                       │
     │                  │                     │                       │
     │                  │ 2. Fetch FairScore  │                       │
     │                  │────────────────────►│                       │
     │                  │                     │                       │
     │                  │ 3. Return Score     │                       │
     │                  │◄────────────────────│                       │
     │                  │                     │                       │
     │ 4. Click Create  │                     │                       │
     │─────────────────►│                     │                       │
     │                  │                     │                       │
     │                  │ 5. Build Transaction│                       │
     │                  │ (create_circle)     │                       │
     │                  │                     │                       │
     │ 6. Sign Tx       │                     │                       │
     │◄─────────────────│                     │                       │
     │─────────────────►│                     │                       │
     │                  │                     │                       │
     │                  │ 7. Send Transaction │                       │
     │                  │────────────────────────────────────────────►│
     │                  │                     │                       │
     │                  │                     │    8. Init Circle PDA │
     │                  │                     │    9. Init Escrow PDA │
     │                  │                     │   10. Add Creator     │
     │                  │                     │                       │
     │                  │ 11. Confirmation    │                       │
     │                  │◄────────────────────────────────────────────│
     │                  │                     │                       │
     │ 12. Show Success │                     │                       │
     │◄─────────────────│                     │                       │
     │                  │                     │                       │
```

### Contribution & Payout Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        CONTRIBUTION PHASE (All Members)                      │
└──────────────────────────────────────────────────────────────────────────────┘

    Member 1              Member 2              Member 3              Escrow
       │                     │                     │                    │
       │ contribute()        │                     │                    │
       │─────────────────────────────────────────────────────────────►│
       │                     │                     │           +0.5 SOL│
       │                     │                     │                    │
       │                     │ contribute()        │                    │
       │                     │───────────────────────────────────────►│
       │                     │                     │           +0.5 SOL│
       │                     │                     │                    │
       │                     │                     │ contribute()       │
       │                     │                     │───────────────────►│
       │                     │                     │           +0.5 SOL│
       │                     │                     │                    │
       │                     │                     │    Total: 1.5 SOL │
       │                     │                     │                    │

┌──────────────────────────────────────────────────────────────────────────────┐
│                         PAYOUT PHASE (Single Recipient)                      │
└──────────────────────────────────────────────────────────────────────────────┘

                       Recipient (by payout_order)              Escrow
                                    │                             │
                                    │ claim_payout()              │
                                    │◄────────────────────────────│
                                    │                    -1.5 SOL │
                                    │                             │
                           +1.5 SOL │                    0.0 SOL │
                                    │                             │
                                    ▼                             │
                         ┌───────────────────┐                    │
                         │ Round Complete!   │                    │
                         │ Advance to next   │                    │
                         │ round or COMPLETE │                    │
                         └───────────────────┘                    │
```

---

## FairScore Integration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FAIRSCORE SYSTEM                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│    Frontend     │        │     Backend     │        │   FairScale     │
│                 │        │                 │        │   External API  │
│  ┌───────────┐  │        │  ┌───────────┐  │        │                 │
│  │FairScore  │  │  HTTP  │  │ Service   │  │  HTTP  │  ┌───────────┐  │
│  │   Hook    │──┼───────►│  │  Layer    │──┼───────►│  │ Score DB  │  │
│  │           │  │        │  │           │  │        │  └───────────┘  │
│  │ • Cache   │◄─┼────────│◄─┼───────────│◄─┼────────│                 │
│  │ • 5min TTL│  │        │  │• Normalize│  │        │  Returns:       │
│  └───────────┘  │        │  │• Validate │  │        │  • score        │
│                 │        │  │• Error    │  │        │  • tier         │
│  Scale: 0-1000  │        │  │  Handle   │  │        │  • badges       │
│  (display)      │        │  └───────────┘  │        │  • metrics      │
└─────────────────┘        └─────────────────┘        └─────────────────┘

```

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TECH STACK                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  Framework:        React 19.2.0 + TypeScript                                │
│  Build Tool:       Vite 7.2.4                                               │
│  Styling:          Tailwind CSS 4.1.18                                      │
│  State:            Zustand 5.0.3 (with persistence)                         │
│  Icons:            Lucide React 0.468.0                                     │
│                                                                             │
│  Solana:           @solana/web3.js 1.95.8                                   │
│                    @coral-xyz/anchor 0.30.1                                 │
│                    @solana/wallet-adapter-react 0.15.35                     │
│                                                                             │
│  Wallets:          Phantom, Solflare                                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  Runtime:          Node.js (ES Modules)                                     │
│  Framework:        Express.js 5.0.1                                         │
│  Language:         TypeScript (ES2022)                                      │
│  HTTP Client:      Axios 1.7.9                                              │
│  Security:         Helmet 8.0.0, CORS 2.8.5                                 │
│  Logging:          Morgan 1.10.0                                            │
│                                                                             │
│  Database:         None (Stateless API)                                     │
│  External API:     FairScale (api.fairscale.xyz)                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           SOLANA PROGRAM                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  Framework:        Anchor 0.32.1                                            │
│  Language:         Rust                                                     │
│  Network:          Devnet                                                   │
│  Program ID:       FeuH9rfHZ8XuMQrFVdWHP6MEA4e4fqtF95Bbi3aiMZdk             │
│                                                                             │
│  Accounts:         Circle PDA, Escrow PDA                                   │
│  Instructions:     6 (create, join, start, contribute, claim, update)       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
FAIRCIRCLES/
│
├── faircircle-frontend/           # React Frontend Application
│   ├── src/
│   │   ├── components/            # UI Components
│   │   │   ├── App.tsx            # Root component
│   │   │   ├── Dashboard.tsx      # Main dashboard
│   │   │   ├── CircleCard.tsx     # Circle preview card
│   │   │   ├── CircleDetail.tsx   # Full circle view
│   │   │   ├── CreateCircleForm.tsx
│   │   │   ├── FairScoreCard.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   └── WalletProvider.tsx
│   │   ├── hooks/
│   │   │   ├── useCircleProgram.ts  # Solana program interaction
│   │   │   └── useFairScore.ts      # FairScore fetching
│   │   ├── lib/
│   │   │   ├── fairscale.ts       # API client
│   │   │   └── idl.ts             # Program IDL
│   │   └── store/
│   │       └── useStore.ts        # Zustand store
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                       # Express.js Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── index.ts           # Environment config
│   │   ├── middleware/
│   │   │   └── errorHandler.ts    # Error handling
│   │   ├── routes/
│   │   │   ├── health.routes.ts
│   │   │   └── fairscale.routes.ts
│   │   ├── services/
│   │   │   └── fairscale.service.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts               # Entry point
│   └── package.json
│
├── faircircle-solana-program/     # Anchor Solana Program
│   ├── programs/
│   │   └── faircircle-solana-program/
│   │       └── src/
│   │           └── lib.rs         # Program logic
│   ├── target/
│   │   └── idl/                   # Generated IDL
│   ├── Anchor.toml
│   └── Cargo.toml
│
└── Architecture.md                # This file
```

---

## Security Considerations

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SECURITY LAYERS                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  FRONTEND SECURITY                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Wallet-based authentication (no passwords)                               │
│  • Transaction signing required for all on-chain actions                    │
│  • API key stored server-side (not exposed to client)                       │
│  • Input validation before program calls                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  BACKEND SECURITY                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Helmet.js for security headers                                           │
│  • CORS restricted to allowed origins                                       │
│  • Wallet address validation (regex)                                        │
│  • Rate limit error handling                                                │
│  • No sensitive data in responses                                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  SOLANA PROGRAM SECURITY                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  • PDA-based account derivation (deterministic, secure)                     │
│  • Signer verification for all mutations                                    │
│  • Creator-only actions enforced (start, update_fair_score)                 │
│  • Status checks prevent invalid state transitions                          │
│  • FairScore validation on join                                             │
│  • Double contribution/claim prevention                                     │
│  • Escrow holds funds (not user-controlled)                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
                              ┌─────────────────────┐
                              │      Internet       │
                              └──────────┬──────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    │                                         │
                    ▼                                         ▼
         ┌─────────────────────┐                 ┌─────────────────────┐
         │   Frontend Host     │                 │    Backend Host     │
         │   (Vercel/Netlify)  │                 │   (Railway/Render)  │
         │                     │                 │                     │
         │   • Static React    │   /api/*        │   • Express Server  │
         │   • Client-side     │────────────────►│   • FairScale Proxy │
         │     routing         │                 │   • Port 3001       │
         └─────────────────────┘                 └─────────────────────┘
                    │                                         │
                    │                                         │
                    │ RPC                                     │ HTTPS
                    │                                         │
                    ▼                                         ▼
         ┌─────────────────────┐                 ┌─────────────────────┐
         │   Solana Devnet     │                 │   FairScale API     │
         │                     │                 │                     │
         │   • RPC Endpoint    │                 │ api.fairscale.xyz   │
         │   • Program Exec    │                 │   • Reputation      │
         │   • Account Storage │                 │   • Scores          │
         └─────────────────────┘                 └─────────────────────┘
```

---

## Future Considerations

- **Database Integration**: Add PostgreSQL/MongoDB for off-chain data (user profiles, notifications)
- **Mainnet Deployment**: Move from Devnet to Mainnet-Beta
- **Rate Limiting**: Implement request throttling on backend
- **WebSocket**: Real-time updates for circle state changes
- **Mobile App**: React Native client
- **Governance**: On-chain voting for circle parameters
- **Multi-token Support**: SPL tokens beyond SOL
