# 🔗 Frontend-Contract Integration Guide

This guide explains how to integrate the Arisan on Chain frontend with the deployed smart contract.

## 📋 Current Status

### ✅ **Frontend Ready**
- React Router v7 application with TypeScript
- Tailwind CSS with Indonesian design system
- Freighter Wallet integration
- Soroban client configuration
- Form validation with Zod
- UI components and pages

### ✅ **Contract Ready**
- Smart contract compiled and tested
- WASM hash: `302c3c32188077aca2cc531b65eee68abef5460341e4ca05961e214c065e00f8`
- 8 contract functions implemented and tested
- Error handling with 9 error codes

## 🚀 Integration Steps

### Step 1: Deploy Contract to Testnet

First, deploy your contract to get the actual contract ID:

```bash
# Navigate to contract directory
cd ../arisan-oc-contract/contracts/arisan_contract

# Deploy to testnet (replace with your account)
stellar contract deploy \
  --wasm target/wasm32v1-none/release/arisan_contract.wasm \
  --source your_testnet_account \
  --network testnet
```

**Save the returned Contract ID!**

### Step 2: Update Frontend Configuration

Update the contract configuration in the frontend:

```typescript
// app/lib/soroban.ts
export const CONTRACT_ID = 'YOUR_ACTUAL_CONTRACT_ID_HERE'; // Replace with deployed contract ID
export const WASM_HASH = '302c3c32188077aca2cc531b65eee68abef5460341e4ca05961e214c065e00f8';
```

### Step 3: Test Integration

Start the frontend and test the integration:

```bash
cd arisan-oc-frontend
npm run dev
```

## 🔧 Available Contract Functions

The frontend is configured to work with these contract functions:

### 1. `init(owner, members, round_count, due_amount)`
**Purpose**: Initialize a new arisan group
**Frontend Usage**: Create Arisan page
**Parameters**:
- `owner`: Stellar address of the arisan owner
- `members`: Array of member addresses
- `round_count`: Number of rounds (u32)
- `due_amount`: Amount per round (i128)

### 2. `pay_due(arisan_id, round, amount)`
**Purpose**: Record payment for a round
**Frontend Usage**: Dashboard and Arisan Details pages
**Parameters**:
- `arisan_id`: ID of the arisan group
- `round`: Round number (u32)
- `amount`: Payment amount (i128)

### 3. `draw_winner(arisan_id, round, seed)`
**Purpose**: Select winner for a round
**Frontend Usage**: Arisan Details page (owner only)
**Parameters**:
- `arisan_id`: ID of the arisan group
- `round`: Round number (u32)
- `seed`: Random seed for winner selection

### 4. `release_to_winner(arisan_id, round)`
**Purpose**: Release funds to winner
**Frontend Usage**: Arisan Details page (owner only)
**Parameters**:
- `arisan_id`: ID of the arisan group
- `round`: Round number (u32)

### 5. `get_arisan(arisan_id)`
**Purpose**: Get arisan group data
**Frontend Usage**: Dashboard and Arisan Details pages
**Parameters**:
- `arisan_id`: ID of the arisan group

### 6. `get_payment_status(arisan_id, round)`
**Purpose**: Check payment status
**Frontend Usage**: Dashboard and Arisan Details pages
**Parameters**:
- `arisan_id`: ID of the arisan group
- `round`: Round number (u32)

### 7. `get_winner(arisan_id, round)`
**Purpose**: Get winner information
**Frontend Usage**: Arisan Details page
**Parameters**:
- `arisan_id`: ID of the arisan group
- `round`: Round number (u32)

### 8. `get_arisan_count()`
**Purpose**: Get total number of arisan groups
**Frontend Usage**: Dashboard statistics
**Parameters**: None

## 🎯 Frontend-Contract Mapping

### Create Arisan Flow
1. User fills form on `/create-arisan`
2. Form validates using Zod schemas
3. Frontend calls `init()` function
4. Transaction signed with Freighter wallet
5. Success/error handling with toast notifications

### Dashboard Flow
1. User visits `/dashboard`
2. Frontend calls `get_arisan_count()` for statistics
3. Frontend calls `get_arisan()` for each user's arisan
4. Displays arisan groups and status

### Payment Flow
1. User clicks "Pay Due" button
2. Frontend calls `pay_due()` function
3. Transaction signed with wallet
4. UI updates with new payment status

### Winner Selection Flow
1. Owner clicks "Draw Winner" button
2. Frontend generates random seed
3. Frontend calls `draw_winner()` function
4. Winner displayed to all members

## 🔐 Error Handling

The frontend handles these contract errors with user-friendly messages:

| Error Code | Contract Error | Frontend Message |
|------------|----------------|------------------|
| 1 | InvalidInput | "Data input tidak valid. Silakan periksa kembali." |
| 2 | InvalidAmount | "Jumlah pembayaran tidak sesuai." |
| 3 | NotFound | "Grup arisan tidak ditemukan." |
| 4 | InvalidRound | "Nomor putaran tidak valid." |
| 5 | AlreadyPaid | "Anda sudah membayar untuk putaran ini." |
| 6 | NotAllPaid | "Belum semua anggota membayar." |
| 7 | AlreadyDrawn | "Pemenang sudah dipilih untuk putaran ini." |
| 8 | NotDrawn | "Pemenang belum dipilih." |
| 9 | AlreadyReleased | "Dana sudah dilepas untuk putaran ini." |

## 🧪 Testing Integration

### Manual Testing Steps

1. **Deploy Contract**
   ```bash
   cd ../arisan-oc-contract/contracts/arisan_contract
   stellar contract deploy --wasm target/wasm32v1-none/release/arisan_contract.wasm --source your_account --network testnet
   ```

2. **Update Contract ID**
   - Copy the returned contract ID
   - Update `app/lib/soroban.ts`

3. **Test Frontend**
   ```bash
   cd arisan-oc-frontend
   npm run dev
   ```

4. **Test Functions**
   - Connect Freighter wallet
   - Create a new arisan group
   - Test payment functionality
   - Test winner selection

### Automated Testing

The frontend includes comprehensive form validation and error handling that matches the contract's error codes.

## 🚀 Production Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to Vercel/Netlify
npm install -g vercel
vercel
```

### Contract Deployment
```bash
# Deploy to mainnet (when ready)
stellar contract deploy \
  --wasm target/wasm32v1-none/release/arisan_contract.wasm \
  --source your_mainnet_account \
  --network mainnet
```

## 🔧 Configuration Files

### Environment Variables
Create `.env.local` in the frontend root:
```env
VITE_CONTRACT_ID=your_contract_id_here
VITE_WASM_HASH=302c3c32188077aca2cc531b65eee68abef5460341e4ca05961e214c065e00f8
VITE_NETWORK=TESTNET
VITE_RPC_URL=https://soroban-testnet.stellar.org:443
```

### Contract Configuration
The contract configuration is in `app/lib/soroban.ts`:
```typescript
export const CONTRACT_ID = 'YOUR_CONTRACT_ID';
export const WASM_HASH = '302c3c32188077aca2cc531b65eee68abef5460341e4ca05961e214c065e00f8';
export const NETWORK = Networks.TESTNET;
export const RPC_URL = 'https://soroban-testnet.stellar.org:443';
```

## 🎉 Success Criteria

- ✅ Contract deployed to testnet
- ✅ Contract ID updated in frontend
- ✅ Freighter wallet integration working
- ✅ All contract functions accessible from frontend
- ✅ Error handling working correctly
- ✅ Form validation working
- ✅ Toast notifications working
- ✅ Responsive design working

## 🆘 Troubleshooting

### Common Issues

**1. Contract not found**
- Verify contract ID is correct
- Check if contract is deployed
- Ensure network configuration is correct

**2. Wallet connection issues**
- Install Freighter wallet browser extension
- Check if wallet is unlocked
- Verify testnet network selection

**3. Transaction failures**
- Check account balance (need XLM for fees)
- Verify function parameters
- Check contract error messages

**4. Frontend build issues**
- Run `npm install` to ensure all dependencies
- Check TypeScript compilation errors
- Verify environment variables

---

**🎯 Ready for Integration!**

Your frontend is fully prepared to integrate with the Arisan on Chain smart contract. Just deploy the contract, update the contract ID, and you're ready to go!
