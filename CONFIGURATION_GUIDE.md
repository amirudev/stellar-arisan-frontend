# 🔧 Arisan on Chain - Frontend Configuration Guide

## **Required Credentials & Configuration**

### **1. Contract Credentials (CRITICAL)**

Your deployed contract details that the frontend needs:

```bash
# Contract ID (from deployment)
CONTRACT_ID=CBIJXCR7DLUVYDLWV5TP73W6JWYWKMB5NLZYR73KVEERFPTAVYMZUOSB

# WASM Hash (from build)
WASM_HASH=302c3c32188077aca2cc531b65eee68abef5460341e4ca05961e214c065e00f8
```

### **2. Network Configuration**

```bash
# Network settings
NETWORK=testnet
RPC_URL=https://soroban-testnet.stellar.org:443
```

### **3. Environment Setup**

Create a `.env` file in the frontend root directory:

```bash
# Copy from env.example
cp env.example .env
```

Then update `.env` with your actual values:

```bash
# Contract Configuration
VITE_CONTRACT_ID=CBIJXCR7DLUVYDLWV5TP73W6JWYWKMB5NLZYR73KVEERFPTAVYMZUOSB
VITE_WASM_HASH=302c3c32188077aca2cc531b65eee68abef5460341e4ca05961e214c065e00f8

# Network Configuration  
VITE_NETWORK=testnet
VITE_RPC_URL=https://soroban-testnet.stellar.org:443

# Optional: Wallet Configuration
VITE_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

### **4. Contract Function Parameters**

The frontend needs to handle these contract function parameters correctly:

#### **init(owner, members, round_count, due_amount)**
- `owner`: Stellar address (string)
- `members`: Array of Stellar addresses
- `round_count`: Number of rounds (u32)
- `due_amount`: Amount per member per round (i128)

#### **pay_due(arisan_id, round, amount)**
- `arisan_id`: Arisan group ID (u32)
- `round`: Round number (u32)
- `amount`: Payment amount (i128)

#### **draw_winner(arisan_id, round, seed)**
- `arisan_id`: Arisan group ID (u32)
- `round`: Round number (u32)
- `seed`: Random seed for winner selection (u64)

#### **release_to_winner(arisan_id, round)**
- `arisan_id`: Arisan group ID (u32)
- `round`: Round number (u32)

### **5. Error Handling**

The frontend should handle these contract error codes:

```typescript
// Error codes from contract
enum Error {
  InvalidInput = 1,      // Empty members list
  InvalidAmount = 2,     // Zero amounts
  WhetherFound = 3,      // Invalid arisan ID
  InvalidRound = 4,      // Out of bounds rounds
  AlreadyPaid = 5,       // Double payment prevention
  NotAllPaid = 6,        // Winner draw validation
  AlreadyDrawn = 7,      // Duplicate winner prevention
  NotDrawn = 8,          // Release validation
  AlreadyReleased = 9,   // Double release prevention
}
```

### **6. Transaction Configuration**

```typescript
// Transaction settings
const TRANSACTION_CONFIG = {
  fee: '10000000',           // 10 stroops
  timeout: 30,               // 30 seconds
  networkPassphrase: Networks.TESTNET
};
```

### **7. Stellar.expert Links**

- **Contract Explorer**: https://stellar.expert/explorer/testnet/contract/CBIJXCR7DLUVYDLWV5TP73W6JWYWKMB5NLZYR73KVEERFPTAVYMZUOSB
- **Deployment Transaction**: https://stellar.expert/explorer/testnet/tx/cf726cbd6700a8f1696b105b5a67a5c685d413b27464bf895909d6ba5732e307

### **8. Testing Credentials**

For testing purposes, you can use these testnet accounts:

```bash
# Test account addresses
OWNER_ADDRESS=GD4TWY5MTGH6A7OXUDFBY3QALAT5MD3NGV537UY4GWIP6FUSAO2NAQI5
MEMBER1_ADDRESS=GAOTTWFXS76ERDMHAEMC5UFCSVOAAM74RGCSP75B4JVTWGC5GXGKXKX5
MEMBER2_ADDRESS=GAY5P47LNY7RD23KNTXWNX6CDD4A7T2AMLD6L4CID6YGXFN5FBFMWE7O
MEMBER3_ADDRESS=GALJESDIGRYGU5MO7IX6T2ZIFYCT2EQQOB42GWD4AWF5CZ45ZRVQUL24
```

### **9. Installation & Setup**

```bash
# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Update .env with your contract details
# Edit .env file with your actual values

# Start development server
npm run dev
```

### **10. Production Deployment**

For production deployment, update the environment variables:

```bash
# Production environment
VITE_NETWORK=mainnet
VITE_RPC_URL=https://soroban-mainnet.stellar.org:443
# Update contract ID for mainnet deployment
VITE_CONTRACT_ID=your_mainnet_contract_id
```

### **11. Security Considerations**

- ✅ Never commit `.env` files to version control
- ✅ Use environment variables for all sensitive configuration
- ✅ Validate all user inputs before sending to contract
- ✅ Implement proper error handling for failed transactions
- ✅ Use HTTPS in production
- ✅ Implement proper wallet connection validation

### **12. Troubleshooting**

**Common Issues:**

1. **"Contract not found"**
   - Verify CONTRACT_ID is correct
   - Check network configuration (testnet vs mainnet)

2. **"Transaction failed"**
   - Check account balance
   - Verify transaction parameters
   - Check network connectivity

3. **"Invalid parameters"**
   - Verify parameter types (address, u32, i128)
   - Check parameter validation logic

4. **"Wallet connection failed"**
   - Check WalletConnect configuration
   - Verify wallet compatibility

### **13. Support**

For issues or questions:
- Check contract logs on Stellar.expert
- Review transaction history
- Verify network status
- Check Stellar documentation

---

**🎉 Your frontend is now configured to work with the deployed Arisan on Chain contract!**
