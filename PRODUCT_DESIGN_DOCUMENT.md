# ChatPredict Mini App - Product Design Document

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Feature Specifications](#feature-specifications)
5. [User Flows](#user-flows)
6. [UI/UX Design](#uiux-design)
7. [API Specifications](#api-specifications)
8. [Database Schema](#database-schema)
9. [Security & Privacy](#security--privacy)
10. [Performance Requirements](#performance-requirements)
11. [Implementation Plan](#implementation-plan)

---

## Overview

### Product Description
ChatPredict Mini App is a Telegram Mini App that enables users to create, trade, and resolve prediction markets within Telegram groups. The app provides a rich, interactive interface for prediction market trading using LMSR (Logarithmic Market Scoring Rule) for automated market making.

### Goals
1. **Primary Goal**: Transform the existing Telegram bot into a full-featured mini app with superior UX
2. **User Goal**: Enable seamless prediction market participation without command memorization
3. **Business Goal**: Increase user engagement and market activity by 10x

### Scope
- **In Scope (MVP)**:
  - Market creation and management
  - Trading interface (buy/sell shares)
  - Market resolution and payouts
  - Portfolio dashboard
  - Leaderboard
  - Market browsing and discovery
  
- **Out of Scope (Future)**:
  - Multi-outcome markets (beyond YES/NO)
  - Real money integration
  - External API integrations
  - Mobile native apps (iOS/Android standalone)

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Telegram Client                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Telegram Mini App (WebView)              │   │
│  │  ┌──────────────┐  ┌──────────────┐            │   │
│  │  │   React UI   │  │  Next.js App  │            │   │
│  │  └──────────────┘  └──────────────┘            │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js Application Server                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │  API Routes (App Router)                          │   │
│  │  - /api/markets                                   │   │
│  │  - /api/bets                                      │   │
│  │  - /api/users                                     │   │
│  │  - /api/leaderboard                               │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Business Logic Layer                             │   │
│  │  - LMSR Algorithm                                 │   │
│  │  - Market Management                              │   │
│  │  - Token Management                               │   │
│  │  - Resolution & Payouts                            │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Prisma ORM
                          ▼
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL Database                         │
│  - Users, Markets, Bets, Transactions                   │
└─────────────────────────────────────────────────────────┘
```

### Component Architecture

```
src/app/
├── page.tsx                    # Home/Dashboard
├── markets/
│   ├── page.tsx               # Market list/browse
│   └── [id]/
│       └── page.tsx           # Market detail/trading
├── portfolio/
│   └── page.tsx               # User portfolio
├── leaderboard/
│   └── page.tsx               # Leaderboard
└── layout.tsx                 # Root layout

components/
├── layout/
│   └── header.tsx             # App header
├── market-card.tsx           # Market card component
├── market-detail.tsx          # Market detail view
├── trading-panel.tsx          # Buy/sell interface
├── portfolio-summary.tsx     # Portfolio overview
└── leaderboard-table.tsx      # Leaderboard component

lib/
├── db/prisma.ts               # Prisma client
├── lmsr.ts                    # LMSR algorithm
├── market.ts                  # Market operations
├── tokens.ts                  # Token management
└── resolution.ts              # Market resolution

app/api/
├── markets/
│   ├── route.ts               # GET/POST markets
│   └── [id]/
│       ├── route.ts           # GET market by ID
│       └── resolve/
│           └── route.ts       # POST resolve market
├── bets/
│   ├── route.ts               # GET/POST bets
│   └── sell/
│       └── route.ts          # POST sell shares
├── users/
│   └── [telegramId]/
│       └── route.ts          # GET/POST user
└── leaderboard/
    └── route.ts               # GET leaderboard
```

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.x
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **State Management**: TanStack Query (React Query) v5
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts or Chart.js (for probability charts)
- **Animations**: Framer Motion (optional)

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma 7
- **Validation**: Zod
- **Error Handling**: Custom error middleware

### Infrastructure
- **Hosting**: Vercel (recommended) or Railway
- **Database**: PostgreSQL (Supabase, Neon, or Railway)
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics + Sentry (optional)

### Telegram Integration
- **Mini App SDK**: `@twa-dev/sdk` or `@telegram-apps/sdk`
- **Authentication**: Telegram WebApp.initData
- **Deep Linking**: Telegram Mini App deep links

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript
- **Git Hooks**: Husky (optional)

---

## Feature Specifications

### 1. Market Creation

**User Story**: As a user, I want to create a prediction market so others can bet on it.

**Requirements**:
- Market question (required, max 200 chars)
- Optional closing date/time
- Optional category/tags (future)
- Initial liquidity parameter (default: 100)

**Validation**:
- Question must be unique (or similar check)
- Question must be a valid question format
- Closing date must be in the future
- User must have sufficient permissions (future: admin-only markets)

**API Endpoint**: `POST /api/markets`

**UI Components**:
- Create market modal/form
- Market preview
- Success confirmation

---

### 2. Market Trading

**User Story**: As a user, I want to buy and sell shares in markets to profit from correct predictions.

**Requirements**:
- Buy YES shares
- Buy NO shares
- Sell existing shares (partial or full)
- Real-time price updates
- Show current probability
- Show estimated cost before purchase
- Show current position (if any)

**Trading Flow**:
1. User selects market
2. Views current probability and price
3. Chooses YES or NO
4. Enters token amount or share quantity
5. Sees preview: cost, shares, new probability
6. Confirms trade
7. Receives confirmation and updated balance

**API Endpoints**:
- `POST /api/bets` - Place bet (buy shares)
- `POST /api/bets/sell` - Sell shares

**UI Components**:
- Trading panel (buy/sell tabs)
- Amount input (tokens or shares)
- Price preview
- Position display
- Transaction history

---

### 3. Market Resolution

**User Story**: As a market creator, I want to resolve my market and distribute payouts to winners.

**Requirements**:
- Only creator can resolve
- Resolution: YES or NO
- Automatic payout calculation
- Update market status to RESOLVED
- Record resolution timestamp
- Distribute tokens to winners

**API Endpoint**: `POST /api/markets/[id]/resolve`

**UI Components**:
- Resolve button (creator only)
- Resolution confirmation modal
- Payout summary
- Resolved market badge

---

### 4. Portfolio Dashboard

**User Story**: As a user, I want to see my portfolio, positions, and transaction history.

**Requirements**:
- Current token balance
- Active positions (markets with open bets)
- Resolved positions (with P&L)
- Transaction history (filterable)
- Total P&L summary
- Win rate

**Data Points**:
- Token balance
- Active bets count
- Total invested
- Total returns
- Net P&L
- Best/worst performing markets

**API Endpoint**: `GET /api/users/[telegramId]` (with portfolio data)

**UI Components**:
- Portfolio summary card
- Positions list
- Transaction history table
- P&L chart (future)

---

### 5. Leaderboard

**User Story**: As a user, I want to see top traders and compete for rankings.

**Requirements**:
- Rank by token balance (primary)
- Show username, balance, total bets
- Top 100 users
- Filter by timeframe (all-time, weekly, monthly)
- User's own rank highlighted

**API Endpoint**: `GET /api/leaderboard`

**UI Components**:
- Leaderboard table
- Rank badges (🥇🥈🥉)
- User highlight
- Timeframe filter

---

### 6. Market Discovery

**User Story**: As a user, I want to browse and discover interesting markets to participate in.

**Requirements**:
- List all active markets
- Filter by status (ACTIVE, RESOLVED, CLOSED)
- Sort by: newest, most popular, closing soon
- Search by question text
- Pagination (20 per page)
- Market cards with key info

**API Endpoint**: `GET /api/markets`

**UI Components**:
- Market list/grid
- Market card component
- Filters sidebar
- Search bar
- Pagination controls

---

## User Flows

### Flow 1: Create and Trade Market

```
1. User opens app → Home/Dashboard
2. Clicks "Create Market"
3. Fills form (question, optional closing date)
4. Submits → Market created
5. Redirected to market detail page
6. User places first bet (buy YES/NO)
7. Confirms trade → Shares purchased
8. Returns to dashboard with updated balance
```

### Flow 2: Browse and Participate

```
1. User opens app → Market List
2. Browses markets, sees probability bars
3. Clicks interesting market
4. Views market detail (question, probability, volume)
5. Checks own position (if any)
6. Decides to buy/sell
7. Enters amount, sees preview
8. Confirms → Trade executed
9. Returns to market list
```

### Flow 3: Resolve Market

```
1. Creator opens market detail page
2. Sees "Resolve Market" button
3. Clicks → Resolution modal
4. Selects YES or NO
5. Confirms → Market resolved
6. System calculates payouts
7. Winners receive tokens
8. Market shows as RESOLVED
9. All users see resolution notification
```

### Flow 4: Check Portfolio

```
1. User clicks "Portfolio" in nav
2. Sees summary (balance, P&L, positions)
3. Views active positions list
4. Clicks position → Goes to market
5. Can sell shares from portfolio or market page
6. Views transaction history
7. Filters by type, date range
```

---

## UI/UX Design

### Design Principles
1. **Mobile-First**: Optimized for Telegram mobile app
2. **Touch-Friendly**: Large tap targets (min 44x44px)
3. **Fast**: Instant feedback, optimistic updates
4. **Clear**: Obvious actions, minimal cognitive load
5. **Social**: Highlight community activity

### Color Palette
- **Primary**: Blue (#3B82F6) - Actions, links
- **Success**: Green (#10B981) - YES, wins
- **Danger**: Red (#EF4444) - NO, losses
- **Background**: Dark slate (#1E293B) - Main background
- **Surface**: Slate (#334155) - Cards, panels
- **Text**: White/Slate - High contrast

### Typography
- **Headings**: System font, bold (600-700)
- **Body**: System font, regular (400)
- **Small**: System font, small (12-14px)

### Component Library

#### Market Card
- Question (truncated if long)
- Probability bars (YES/NO)
- Creator info
- Bet count
- Status badge
- Closing date (if set)

#### Trading Panel
- Current probability display
- Buy/Sell tabs
- Amount input
- Preview section (cost, shares, new probability)
- Confirm button
- Position display

#### Portfolio Summary
- Token balance (large, prominent)
- Net P&L (with +/- indicator)
- Active positions count
- Quick stats grid

### Responsive Breakpoints
- Mobile: < 640px (default, Telegram Mini App)
- Tablet: 640px - 1024px (web version)
- Desktop: > 1024px (web version)

---

## API Specifications

### Authentication
All requests include Telegram WebApp initData for user verification.

```typescript
// Request headers
{
  'X-Telegram-Init-Data': string // Telegram WebApp.initData
}
```

### Endpoints

#### Markets

**GET /api/markets**
```typescript
Query params:
  status?: 'ACTIVE' | 'RESOLVED' | 'CLOSED'
  sort?: 'newest' | 'popular' | 'closing'
  page?: number
  limit?: number

Response: {
  markets: Market[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

**POST /api/markets**
```typescript
Body: {
  question: string
  closesAt?: string (ISO date)
  liquidity?: number
}

Response: {
  market: Market
}
```

**GET /api/markets/[id]**
```typescript
Response: {
  market: Market & {
    probabilityYes: number
    creator: User
    bets: Bet[]
  }
}
```

**POST /api/markets/[id]/resolve**
```typescript
Body: {
  resolution: 'YES' | 'NO'
  resolverTelegramId: string
}

Response: {
  success: boolean
  market: Market
  payouts: Payout[]
}
```

#### Bets

**GET /api/bets**
```typescript
Query params:
  marketId?: string
  userId?: string

Response: {
  bets: Bet[]
}
```

**POST /api/bets**
```typescript
Body: {
  marketId: string
  outcome: 'YES' | 'NO'
  amount: number (tokens)
}

Response: {
  bet: Bet
  newBalance: number
  market: Market (updated)
}
```

**POST /api/bets/sell**
```typescript
Body: {
  betId: string
  shares: number (optional, defaults to all)
}

Response: {
  payout: number
  newBalance: number
  bet: Bet (updated)
}
```

#### Users

**GET /api/users/[telegramId]**
```typescript
Response: {
  user: User & {
    portfolio: {
      balance: number
      activePositions: number
      totalInvested: number
      totalReturns: number
      netPL: number
    }
    positions: Position[]
    transactions: Transaction[]
  }
}
```

**POST /api/users/[telegramId]**
```typescript
Body: {
  username?: string
  firstName?: string
  lastName?: string
}

Response: {
  user: User
  isNew: boolean
}
```

#### Leaderboard

**GET /api/leaderboard**
```typescript
Query params:
  timeframe?: 'all' | 'week' | 'month'
  limit?: number (default: 100)

Response: {
  leaderboard: LeaderboardEntry[]
}
```

---

## Database Schema

### Current Schema (Prisma)

```prisma
model User {
  id            String        @id @default(cuid())
  telegramId    String        @unique
  username      String?
  firstName     String?
  lastName      String?
  tokenBalance  Int           @default(1000)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  bets          Bet[]
  marketsCreated Market[]     @relation("MarketCreator")
  transactions  Transaction[]
}

model Market {
  id          String       @id @default(cuid())
  question    String
  creatorId   String
  creator     User         @relation("MarketCreator", fields: [creatorId], references: [id])
  
  // LMSR state
  sharesYes   Float        @default(0)
  sharesNo    Float        @default(0)
  liquidity   Float        @default(100)
  
  // Metadata
  status      MarketStatus @default(ACTIVE)
  resolution  Resolution?
  resolvedAt  DateTime?
  closesAt    DateTime?
  
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  
  bets        Bet[]
  chatId      String
  messageId   String?
}

model Bet {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  marketId    String
  market      Market    @relation(fields: [marketId], references: [id])
  
  outcome     Outcome
  amount      Int
  shares      Float
  priceAtBet  Float
  
  createdAt   DateTime  @default(now())
}

model Transaction {
  id          String          @id @default(cuid())
  userId      String
  user        User            @relation(fields: [userId], references: [id])
  
  type        TransactionType
  amount      Int
  marketId    String?
  betId       String?
  description String
  createdAt   DateTime        @default(now())
}
```

### Future Schema Additions
- Market categories/tags
- User preferences/settings
- Notifications
- Market comments/discussions

---

## Security & Privacy

### Authentication
- Telegram WebApp.initData verification
- HMAC-SHA256 signature validation
- User ID extraction from initData

### Authorization
- Market resolution: Creator only
- User data: Own data only (or public leaderboard)
- Rate limiting on API endpoints

### Data Protection
- No sensitive data in URLs
- HTTPS only
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)

### Privacy
- User data stored securely
- No sharing of personal information
- GDPR considerations (if applicable)

---

## Performance Requirements

### Response Times
- Page load: < 2s (first load)
- API responses: < 500ms (p95)
- Trading execution: < 1s
- Market list: < 1s

### Scalability
- Support 10,000+ concurrent users
- Handle 100+ markets per second
- Database query optimization
- Caching strategy (Redis, optional)

### Optimization
- Code splitting
- Image optimization
- Database indexing
- API response caching
- Static generation where possible

---

## Implementation Plan

### Phase 1: Foundation (Week 1)
- [ ] Set up Next.js project structure
- [ ] Configure Tailwind CSS
- [ ] Set up Prisma and database
- [ ] Implement Telegram Mini App SDK integration
- [ ] Create base layout and navigation
- [ ] Set up API route structure

### Phase 2: Core Features (Week 2)
- [ ] Market creation UI and API
- [ ] Market list/browse page
- [ ] Market detail page
- [ ] Trading interface (buy/sell)
- [ ] Portfolio dashboard
- [ ] Leaderboard page

### Phase 3: Polish & Testing (Week 3)
- [ ] UI/UX refinements
- [ ] Error handling
- [ ] Loading states
- [ ] Form validation
- [ ] Responsive design
- [ ] Testing (manual + automated)

### Phase 4: Launch Prep (Week 4)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation
- [ ] Beta testing with select users
- [ ] Bug fixes
- [ ] Production deployment

### Phase 5: Post-Launch (Ongoing)
- [ ] Monitor metrics
- [ ] Gather user feedback
- [ ] Iterate on features
- [ ] Plan next features

---

## Success Criteria

### Technical
- ✅ Zero critical bugs
- ✅ < 2s page load time
- ✅ 99.9% uptime
- ✅ All API endpoints working

### Product
- ✅ 100+ users in first week
- ✅ 50+ markets created
- ✅ 500+ bets placed
- ✅ 70%+ user satisfaction

### Business
- ✅ 10x increase in engagement vs bot
- ✅ 50%+ user retention (7-day)
- ✅ Positive user feedback

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Owner**: Engineering Team

