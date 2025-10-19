// Contract configuration
export const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || 'CCXDGXVLP6JJ4MS36NXMPLVNGB5TNRB6PRTFETY46F3RF5QMHYIXYDNN';
export const WASM_HASH = import.meta.env.VITE_WASM_HASH || '302c3c32188077aca2cc531b65eee68abef5460341e4ca05961e214c065e00f8';

// Network configuration
export const RPC_URL = 'https://soroban-testnet.stellar.org';
export const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

// Debug function to check network passphrase
const debugNetworkPassphrase = async () => {
  const sdk = await getStellarSDK();
  console.log('Networks.TESTNET:', sdk.Networks?.TESTNET);
  console.log('Networks.PUBLIC:', sdk.Networks?.PUBLIC);
  console.log('Our NETWORK_PASSPHRASE:', NETWORK_PASSPHRASE);
  console.log('RPC_URL:', RPC_URL);
  
  // Try to get Freighter network info if available
  if (typeof window !== 'undefined' && (window as any).freighterApi) {
    try {
      const freighterApi = (window as any).freighterApi;
      if (freighterApi.getNetworkDetails) {
        const networkDetails = await freighterApi.getNetworkDetails();
        console.log('Freighter network details:', networkDetails);
      }
    } catch (error) {
      console.log('Could not get Freighter network details:', error);
    }
  }
};

// Helper function to get Stellar SDK - simplified approach
const getStellarSDK = async () => {
  if (typeof window === 'undefined') {
    throw new Error('Window is not available');
  }
  
  try {
    const sdk = await import('@stellar/stellar-sdk');
    console.log('Stellar SDK imported:', sdk);
    return sdk;
  } catch (error) {
    console.error('Failed to import Stellar SDK:', error);
    throw new Error('Failed to load Stellar SDK');
  }
};

// Helper function to create RPC client
export const getRpc = async () => {
  try {
    const sdk = await getStellarSDK();
    console.log('Available SDK properties:', Object.keys(sdk));
    
    // Debug network passphrase
    await debugNetworkPassphrase();
    
    // In newer versions of Stellar SDK, Server is in the rpc namespace
    // Check sdk.rpc.Server
    if (sdk.rpc && sdk.rpc.Server) {
      console.log('Using sdk.rpc.Server');
      return new sdk.rpc.Server(RPC_URL);
    }
    
    // Fallback to direct Server if available
    if ((sdk as any).Server && typeof (sdk as any).Server === 'function') {
      console.log('Using sdk.Server');
      return new (sdk as any).Server(RPC_URL);
    }
    
    // Try Horizon.Server
    if (sdk.Horizon && sdk.Horizon.Server) {
      console.log('Using sdk.Horizon.Server');
      return new sdk.Horizon.Server(RPC_URL);
    }
    
    throw new Error('Server class not found in SDK');
  } catch (error) {
    console.error('Failed to create RPC client:', error);
    return null;
  }
};

// Helper functions for contract interactions
export const sorobanUtils = {
  // Initialize arisan
  initArisan: async (
    owner: string,
    members: string[],
    roundCount: number,
    dueAmount: number,
    sourceAccount: any
  ) => {
    const sdk = await getStellarSDK();
    
    // Access SDK components safely
    const { Contract, TransactionBuilder, Networks, Address, nativeToScVal } = sdk;
    
    const contract = new Contract(CONTRACT_ID);
    
    // Convert members to proper ScVal format for Vec<Address>
    const memberAddresses = members.map(m => Address.fromString(m).toScVal());
    const membersVec = nativeToScVal(memberAddresses, { type: 'vec' });
    
    console.log('Building transaction with networkPassphrase:', NETWORK_PASSPHRASE);
    console.log('Networks.TESTNET value:', Networks.TESTNET);
    console.log('Networks.PUBLIC value:', Networks.PUBLIC);
    
    const tx = new TransactionBuilder(sourceAccount, {
      fee: '10000000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'init',
          Address.fromString(owner).toScVal(),
          membersVec,
          nativeToScVal(roundCount, { type: 'u32' }),
          nativeToScVal(dueAmount, { type: 'i128' })
        )
      )
      .setTimeout(30)
      .build();

    console.log('Transaction built. Network passphrase in tx:', (tx as any).networkPassphrase);

    return tx;
  },

  // Pay due amount
  payDue: async (
    caller: string,
    arisanId: number,
    round: number,
    amount: number,
    sourceAccount: any
  ) => {
    // Validate required parameters
    if (!sourceAccount) {
      throw new Error('Source account is required for transaction');
    }
    
    if (!caller) {
      throw new Error('Caller address is required for payment');
    }
    
    console.log('payDue called with:', { 
      caller, 
      arisanId, 
      round, 
      amount, 
      sourceAccount: sourceAccount.accountId?.() || 'Unknown' 
    });
    
    const sdk = await getStellarSDK();
    
    // Access SDK components safely
    const { Contract, TransactionBuilder, Networks, nativeToScVal } = sdk;
    
    // Convert BigInt to number if needed
    const amountValue = typeof amount === 'bigint' ? Number(amount) : amount;
    console.log('Amount value being sent to contract:', amountValue);
    
    const contract = new Contract(CONTRACT_ID);
    const tx = new TransactionBuilder(sourceAccount, {
      fee: '10000000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'pay_due',
          nativeToScVal(arisanId, { type: 'u32' }),
          nativeToScVal(round, { type: 'u32' }),
          nativeToScVal(amountValue, { type: 'i128' })
        )
      )
      .setTimeout(30)
      .build();

    console.log('Transaction built successfully (OLD CONTRACT SIGNATURE)');
    console.log('Transaction operations:', tx.operations);
    console.log('Transaction source account:', tx.source);
    console.log('Transaction network passphrase:', tx.networkPassphrase);
    console.log('WARNING: Using old contract signature - security validation disabled');
    console.log('CLIENT-SIDE VALIDATION: Skipping validation due to context issues');
    console.log('NOTE: Validation should be handled by the calling component');

    return tx;
  },

  // Draw winner
  drawWinner: async (
    arisanId: number,
    round: number,
    seed: number,
    sourceAccount: any
  ) => {
    const sdk = await getStellarSDK();
    
    // Access SDK components safely
    const { Contract, TransactionBuilder, Networks, nativeToScVal } = sdk;
    
    const contract = new Contract(CONTRACT_ID);
    const tx = new TransactionBuilder(sourceAccount, {
      fee: '10000000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'draw_winner',
          nativeToScVal(arisanId, { type: 'u32' }),
          nativeToScVal(round, { type: 'u32' }),
          nativeToScVal(seed, { type: 'u64' })
        )
      )
      .setTimeout(30)
      .build();

    return tx;
  },

  // Release funds to winner
  releaseToWinner: async (
    arisanId: number,
    round: number,
    sourceAccount: any
  ) => {
    const sdk = await getStellarSDK();
    
    // Access SDK components safely
    const { Contract, TransactionBuilder, Networks, nativeToScVal } = sdk;
    
    const contract = new Contract(CONTRACT_ID);
    const tx = new TransactionBuilder(sourceAccount, {
      fee: '10000000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'release_to_winner',
          nativeToScVal(arisanId, { type: 'u32' }),
          nativeToScVal(round, { type: 'u32' })
        )
      )
      .setTimeout(30)
      .build();

    return tx;
  },

  // Get arisan data by invoking the contract
  getArisan: async (arisanId: number) => {
    try {
      if (typeof window === 'undefined') return null;
      
      const rpc = await getRpc();
      if (!rpc) {
        console.log('RPC client not available');
        return null;
      }

      const sdk = await getStellarSDK();
      const { Contract, Account, nativeToScVal, scValToNative } = sdk;
      
      console.log('Fetching arisan data for:', arisanId);
      
      // Create a dummy account for simulation (read-only call)
      const dummyAccount = new Account(
        'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
        '0'
      );
      
      const contract = new Contract(CONTRACT_ID);
      const tx = new sdk.TransactionBuilder(dummyAccount, {
        fee: '100',
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          contract.call('get_arisan', nativeToScVal(arisanId, { type: 'u32' }))
        )
        .setTimeout(30)
        .build();
      
      // Simulate to get the result
      const simResult = await rpc.simulateTransaction(tx);
      
      if (simResult && simResult.result && simResult.result.retval) {
        const data = scValToNative(simResult.result.retval);
        console.log('Arisan data:', data);
        
        return {
          id: arisanId,
          owner: data.owner || data[0],
          members: data.members || data[1] || [],
          roundCount: data.round_count || data[2] || 0,
          dueAmount: data.due_amount || data[3] || 0,
          totalPool: data.total_pool || data[4] || 0,
          isActive: data.is_active !== undefined ? data.is_active : (data[5] !== undefined ? data[5] : false)
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching arisan data:', error);
      return null;
    }
  },

  // Get payment status
  getPaymentStatus: async (arisanId: number, round: number) => {
    try {
      if (typeof window === 'undefined') return false;
      
      const rpc = await getRpc();
      if (!rpc) {
        console.log('RPC client not available');
        return false;
      }

      const sdk = await getStellarSDK();
      const { nativeToScVal } = sdk;
      console.log('Fetching payment status for:', arisanId, 'round:', round);
      
      // Create the payment key as a tuple: (PAYMENT, arisan_id, round)
      const paymentKey = [
        nativeToScVal('PAYMENT', { type: 'symbol' }),
        nativeToScVal(arisanId, { type: 'u32' }),
        nativeToScVal(round, { type: 'u32' })
      ];
      
      const result = await rpc.getContractData(
        CONTRACT_ID,
        nativeToScVal(paymentKey, { type: 'vec' })
      );
      
      // The contract returns a boolean for payment status
      return result && result.val() ? true : false;
    } catch (error: any) {
      console.error('Error fetching payment status:', error);
      
      // If the error is 404 (data not found), it means no payment has been made yet
      if (error.code === 404) {
        console.log('Payment data not found - user has not paid yet');
        return false;
      }
      
      return false;
    }
  },

  // Get winner data
  getWinner: async (arisanId: number, round: number) => {
    try {
      if (typeof window === 'undefined') return null;
      
      const rpc = await getRpc();
      if (!rpc) {
        console.log('RPC client not available');
        return null;
      }

      const sdk = await getStellarSDK();
      const { nativeToScVal } = sdk;
      console.log('Fetching winner for:', arisanId, 'round:', round);
      const result = await rpc.getContractData(
        CONTRACT_ID,
        nativeToScVal(`${arisanId}_${round}`, { type: 'string' })
      );
      
      if (result && result.val()) {
        const data = result.val();
        return {
          arisanId,
          round,
          winner: data.winner?.toString(),
          timestamp: data.timestamp?.toNumber() || 0,
          isReleased: data.is_released?.toBoolean() || false
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching winner:', error);
      return null;
    }
  },

  // Get arisan count by invoking the contract
  getArisanCount: async () => {
    try {
      if (typeof window === 'undefined') return 0;
      
      const rpc = await getRpc();
      if (!rpc) {
        console.log('RPC client not available');
        return 0;
      }

      const sdk = await getStellarSDK();
      const { Contract, Account, Address } = sdk;
      
      console.log('Fetching arisan count by invoking contract...');
      
      // Create a dummy account for simulation (read-only call)
      const dummyAccount = new Account(
        'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
        '0'
      );
      
      const contract = new Contract(CONTRACT_ID);
      const tx = new sdk.TransactionBuilder(dummyAccount, {
        fee: '100',
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call('get_arisan_count'))
        .setTimeout(30)
        .build();
      
      // Simulate to get the result
      const simResult = await rpc.simulateTransaction(tx);
      
      if (simResult && simResult.result && simResult.result.retval) {
        const count = sdk.scValToNative(simResult.result.retval);
        console.log('Arisan count:', count);
        return count;
      }
      
      return 0;
    } catch (error) {
      console.error('Error fetching arisan count:', error);
      return 0;
    }
  },

  // Get user's arisan groups
  getUserArisans: async (userAddress: string) => {
    try {
      if (typeof window === 'undefined') return [];
      
      const rpc = await getRpc();
      if (!rpc) {
        console.log('RPC client not available');
        return [];
      }

      const sdk = await getStellarSDK();
      const { nativeToScVal } = sdk;
      console.log('Fetching user arisans for:', userAddress);
      const result = await rpc.getContractData(
        CONTRACT_ID,
        nativeToScVal(`user_${userAddress}`, { type: 'string' })
      );
      
      if (result && result.val()) {
        const arisanIds = result.val().map((id: any) => id.toString());
        const arisans = [];
        
        for (const id of arisanIds) {
          const arisan = await sorobanUtils.getArisan(parseInt(id));
          if (arisan) {
            arisans.push(arisan);
          }
        }
        
        return arisans;
      }
      return [];
    } catch (error) {
      console.error('Error fetching user arisans:', error);
      return [];
    }
  },

  // Get user's recent activities
  getUserActivities: async (userAddress: string) => {
    try {
      if (typeof window === 'undefined') return [];
      
      const rpc = await getRpc();
      if (!rpc) {
        console.log('RPC client not available');
        return [];
      }

      const sdk = await getStellarSDK();
      const { nativeToScVal } = sdk;
      console.log('Fetching user activities for:', userAddress);
      const result = await rpc.getContractData(
        CONTRACT_ID,
        nativeToScVal(`activities_${userAddress}`, { type: 'string' })
      );
      
      if (result && result.val()) {
        const activities = result.val().map((activity: any) => ({
          id: activity.id?.toString(),
          type: activity.type?.toString(),
          description: activity.description?.toString(),
          amount: activity.amount?.toNumber() || null,
          date: new Date(activity.timestamp?.toNumber() * 1000 || Date.now()).toISOString().split('T')[0],
          status: activity.status?.toString() || 'success',
          arisanId: activity.arisan_id?.toString(),
          round: activity.round?.toNumber() || null
        }));
        
        return activities.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
      return [];
    } catch (error) {
      console.error('Error fetching user activities:', error);
      return [];
    }
  },

  // Get user's payment history
  getUserPayments: async (userAddress: string) => {
    try {
      if (typeof window === 'undefined') return [];
      
      const rpc = await getRpc();
      if (!rpc) {
        console.log('RPC client not available');
        return [];
      }

      const sdk = await getStellarSDK();
      const { nativeToScVal } = sdk;
      console.log('Fetching user payments for:', userAddress);
      const result = await rpc.getContractData(
        CONTRACT_ID,
        nativeToScVal(`payments_${userAddress}`, { type: 'string' })
      );
      
      if (result && result.val()) {
        const payments = result.val().map((payment: any) => ({
          id: payment.id?.toString(),
          arisanId: payment.arisan_id?.toString(),
          round: payment.round?.toNumber(),
          amount: payment.amount?.toNumber(),
          timestamp: payment.timestamp?.toNumber(),
          status: payment.status?.toString() || 'success'
        }));
        
        return payments.sort((a: any, b: any) => b.timestamp - a.timestamp);
      }
      return [];
    } catch (error) {
      console.error('Error fetching user payments:', error);
      return [];
    }
  },

  // Get user's winnings
  getUserWinnings: async (userAddress: string) => {
    try {
      if (typeof window === 'undefined') return [];
      
      const rpc = await getRpc();
      if (!rpc) {
        console.log('RPC client not available');
        return [];
      }

      const sdk = await getStellarSDK();
      const { nativeToScVal } = sdk;
      console.log('Fetching user winnings for:', userAddress);
      const result = await rpc.getContractData(
        CONTRACT_ID,
        nativeToScVal(`winnings_${userAddress}`, { type: 'string' })
      );
      
      if (result && result.val()) {
        const winnings = result.val().map((winning: any) => ({
          id: winning.id?.toString(),
          arisanId: winning.arisan_id?.toString(),
          round: winning.round?.toNumber(),
          amount: winning.amount?.toNumber(),
          timestamp: winning.timestamp?.toNumber(),
          status: winning.status?.toString() || 'success'
        }));
        
        return winnings.sort((a: any, b: any) => b.timestamp - a.timestamp);
      }
      return [];
    } catch (error) {
      console.error('Error fetching user winnings:', error);
      return [];
    }
  },

  // Get all arisans (for listing page)
  getAllArisans: async () => {
    try {
      if (typeof window === 'undefined') return [];
      
      console.log('Fetching all arisans');
      const count = await sorobanUtils.getArisanCount();
      const arisans = [];
      
      for (let i = 1; i <= count; i++) {
        const arisan = await sorobanUtils.getArisan(i);
        if (arisan) {
          arisans.push(arisan);
        }
      }
      
      return arisans;
    } catch (error) {
      console.error('Error fetching all arisans:', error);
      return [];
    }
  },

  // Get payment details for a specific arisan and round
  getPaymentDetails: async (arisanId: number, round: number) => {
    try {
      if (typeof window === 'undefined') return null;
      
      const rpc = await getRpc();
      if (!rpc) {
        console.log('RPC client not available');
        return null;
      }

      const sdk = await getStellarSDK();
      const { nativeToScVal } = sdk;
      console.log('Fetching payment details for:', arisanId, 'round:', round);
      const result = await rpc.getContractData(
        CONTRACT_ID,
        nativeToScVal(`PAYMENT_${arisanId}_${round}`, { type: 'string' })
      );
      
      if (result && result.val()) {
        const data = result.val();
        return {
          arisanId,
          round,
          amount: data.amount?.toNumber() || 0,
          timestamp: data.timestamp?.toNumber() || 0
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      return null;
    }
  },

  // Check if user is member of arisan
  isUserMember: async (arisanId: number, userAddress: string) => {
    try {
      const arisan = await sorobanUtils.getArisan(arisanId);
      if (!arisan) return false;
      
      console.log('Checking membership for user:', userAddress);
      console.log('Arisan members:', arisan.members);
      const isMember = arisan.members.includes(userAddress);
      console.log('Is member:', isMember);
      
      return isMember;
    } catch (error) {
      console.error('Error checking user membership:', error);
      return false;
    }
  },

  // Check if user is owner of arisan
  isUserOwner: async (arisanId: number, userAddress: string) => {
    try {
      const arisan = await sorobanUtils.getArisan(arisanId);
      if (!arisan) return false;
      
      return arisan.owner === userAddress;
    } catch (error) {
      console.error('Error checking user ownership:', error);
      return false;
    }
  },

  // Get current round for arisan (calculate based on payments)
  getCurrentRound: async (arisanId: number) => {
    try {
      const arisan = await sorobanUtils.getArisan(arisanId);
      if (!arisan) return 0;
      
      console.log('Getting current round for arisan:', arisanId, 'with roundCount:', arisan.roundCount);
      
      let currentRound = 1;
      
      // Check each round to see if all members have paid
      for (let round = 1; round <= arisan.roundCount; round++) {
        const allPaid = await sorobanUtils.checkAllMembersPaid(arisanId, round);
        console.log(`Round ${round}: allPaid = ${allPaid}`);
        if (allPaid) {
          currentRound = round + 1;
        } else {
          break;
        }
      }
      
      return Math.min(currentRound, arisan.roundCount + 1);
    } catch (error) {
      console.error('Error getting current round:', error);
      return 1;
    }
  },

  // Check if all members have paid for a round
  checkAllMembersPaid: async (arisanId: number, round: number) => {
    try {
      const arisan = await sorobanUtils.getArisan(arisanId);
      if (!arisan) return false;
      
      // Check if payment exists for this round (contract stores one payment per round)
      const hasPayment = await sorobanUtils.getPaymentStatus(arisanId, round);
      return hasPayment;
    } catch (error) {
      console.error('Error checking if all members paid:', error);
      return false;
    }
  },
};

// Error handling utilities
export const handleSorobanError = (error: any): string => {
  if (error?.message?.includes('InvalidInput')) {
    return 'Data input tidak valid. Silakan periksa kembali.';
  }
  if (error?.message?.includes('InvalidAmount')) {
    return 'Jumlah pembayaran tidak sesuai.';
  }
  if (error?.message?.includes('NotFound')) {
    return 'Grup arisan tidak ditemukan.';
  }
  if (error?.message?.includes('AlreadyPaid')) {
    return 'Anda sudah membayar untuk putaran ini.';
  }
  if (error?.message?.includes('NotAllPaid')) {
    return 'Belum semua anggota membayar.';
  }
  if (error?.message?.includes('Unauthorized')) {
    return 'Anda tidak memiliki izin untuk melakukan tindakan ini.';
  }
  if (error?.message?.includes('AlreadyWinner')) {
    return 'Pemenang sudah dipilih untuk putaran ini.';
  }
  if (error?.message?.includes('NotWinner')) {
    return 'Anda bukan pemenang untuk putaran ini.';
  }
  if (error?.message?.includes('AlreadyReleased')) {
    return 'Dana sudah dilepas untuk putaran ini.';
  }
  if (error?.message?.includes('NotMember')) {
    return 'Anda bukan anggota dari grup arisan ini.';
  }
  
  return error?.message || 'Terjadi kesalahan yang tidak diketahui.';
};