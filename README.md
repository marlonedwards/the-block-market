# 🍽️ The Block Market

> A decentralized marketplace for university meal block trading at Carnegie Mellon University.

## 📖 Overview

The Block Market revolutionizes how university students trade meal blocks by providing a secure, transparent, and efficient marketplace. Our platform connects students who need additional meal blocks with those who have excess, creating a sustainable ecosystem that reduces food waste and maximizes meal plan value.

## 🎯 Problem & Solution

### The Problem
- Students often end up with unused meal blocks at semester's end
- Others run out of blocks too early
- Traditional trading methods are informal and risky
- No standardized pricing or security measures

### Our Solution
- Blockchain-based payment option
- Dynamic market-based pricing
- Robust reputation system
- Automated dispute resolution
- Verified order completion

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18 + TypeScript**
  - Type-safe development
  - Component-based architecture
  - Custom hooks for blockchain integration
- **Tailwind CSS**
  - Responsive design system
  - Custom component library
  - Dark/light mode support
- **MetaMask Integration**
  - Secure wallet connection
  - Transaction signing
  - Balance management

### Backend Infrastructure
- **Supabase**
  - Email authentication
  - Real-time database updates
  - Row Level Security (RLS)
  - Custom authorization policies
  - WebSocket connections for live updates

### Blockchain Integration
- **XRPL Integration**
  - Fast, low-cost transactions
  - Native escrow functionality
  - International payment support

## 💫 Core Features

### Order Validation System
1. **Screenshot Verification**
   - Sellers must upload screenshot of GrubHub confirmation
   - Timestamp and order details verification

2. **Decentralized Validation (Coming Soon)**
   - Random validator selection from qualified users
   - Validators review screenshot authenticity
   - Earn part of platform fee for successful validations

### Market Dynamics
- Central limit order book
- Historical data for 15m, 30m, 24H, 7D time horizons

### Security & Trust
- Three-strike system for sellers
- Required proof of delivery
- Escrow-based payments
- Comprehensive dispute resolution

## 🔄 Transaction Flow

1. **Deposit & Order Creation**
   ```mermaid
   graph LR
   A[Buyer Deposits] --> B[Creates Order]
   B --> C[Sets Pickup Time]
   C --> D[Order Posted to Market]
   ```

2. **Order Fulfillment**
   ```mermaid
   graph LR
   A[Seller Accepts Order or is Matched] --> B[Fulfills Order]
   B --> C[Uploads Screenshot]
   C --> D[Validation Check]
   ```

3. **Validation & Payment**
   ```mermaid
   graph LR
   A[Validator Review - Optional] --> B[Confirmation]
   B --> C[Release Payment]
   C --> D[Update Reputation]
   ```

## 🚀 Getting Started

### Prerequisites
```bash
Node.js >= 16
npm >= 7
MetaMask
```

### Installation
```bash
# Clone repository
git clone https://github.com/yourusername/the-block-market

# Install dependencies
cd the-block-market
npm install

# Configure environment
cp .env.example .env.local

# Start development
npm run dev
```


## 📈 Database Schema

Our Supabase schema includes:

```sql
-- Key tables (simplified)
public_users
user_wallets
user_reputation
orders
order_status
disputes
validator_stakes
```
