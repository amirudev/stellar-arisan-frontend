// Freighter wallet integration using official @stellar/freighter-api
// Implementation following official Freighter documentation

import pkg from '@stellar/freighter-api';

// Debug: Let's see what's actually available in the package
console.log('Freighter API package:', pkg);
console.log('Available methods:', Object.keys(pkg));

const {
  isConnected, 
  requestAccess, 
  getAddress, // Note: It's getAddress, not getPublicKey
  signTransaction: freighterSignTransaction,
  setAllowed,
  getNetworkDetails,
  WatchWalletChanges
} = pkg;

export interface WalletState {
  isConnected: boolean;
  publicKey: string | null;
  isLoading: boolean;
}

export class WalletService {
  private static instance: WalletService;
  private state: WalletState = {
    isConnected: false,
    publicKey: null,
    isLoading: false,
  };

  private listeners: ((state: WalletState) => void)[] = [];
  private walletWatcher: WatchWalletChanges | null = null;

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: WalletState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getState(): WalletState {
    return { ...this.state };
  }

  // Check if Freighter is available using official API
  async isWalletAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    try {
      // Try to check connection status - if this works, Freighter is available
      await isConnected();
      return true;
    } catch (error) {
      console.log('Freighter not available:', error);
      
      // Check if it's a connection error (extension installed but not communicating)
      if (error.message && error.message.includes('Could not establish connection')) {
        console.log('Freighter extension detected but not communicating properly');
        console.log('This usually means:');
        console.log('1. Extension is installed but not enabled');
        console.log('2. Extension needs to be restarted');
        console.log('3. Browser needs to be restarted');
        console.log('4. Extension permissions need to be granted');
      }
      
      return false;
    }
  }

  // Check if Freighter is connected using official API
  async checkConnection(): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      console.log('Checking wallet connection...');
      
      // Check if Freighter is available first
      const available = await this.isWalletAvailable();
      if (!available) {
        console.log('Freighter not available');
        this.state.isConnected = false;
        this.state.publicKey = null;
        this.state.isLoading = false;
        this.notifyListeners();
        return false;
      }

      // Check connection status
      const connected = isConnected ? await isConnected() : await pkg.isConnected();
      console.log('Freighter isConnected result:', connected);
      
      if (!connected) {
        this.state.isConnected = false;
        this.state.publicKey = null;
        this.state.isLoading = false;
        this.notifyListeners();
        return false;
      }

      // If connected but no address, try to request access
      console.log('Freighter reports connected, checking for address...');
      
      // Check if access is allowed
      try {
        const allowed = pkg.isAllowed ? await pkg.isAllowed() : false;
        console.log('Freighter access allowed:', allowed);
      } catch (error) {
        console.log('Could not check access status:', error);
      }
      
      // Check network details
      try {
        const networkDetails = pkg.getNetworkDetails ? await pkg.getNetworkDetails() : null;
        console.log('Freighter network details:', networkDetails);
      } catch (error) {
        console.log('Could not get network details:', error);
      }

      // Get public key
      try {
        // Try destructured method first, then fallback to package method
        const addressResult = getAddress ? await getAddress() : await pkg.getAddress();
        console.log('Address result:', addressResult);
        
        // Handle different response formats
        let publicKey = null;
        if (typeof addressResult === 'string') {
          publicKey = addressResult;
        } else if (addressResult && typeof addressResult === 'object') {
          publicKey = addressResult.address || addressResult.publicKey;
        }
        
        console.log('Extracted public key:', publicKey);
        
        if (publicKey && publicKey.length > 0 && publicKey.startsWith('G')) {
          this.state.isConnected = true;
          this.state.publicKey = publicKey;
          this.state.isLoading = false;
          this.notifyListeners();
          
          // Start watching for wallet changes
          this.startWalletWatcher();
          
          return true;
        } else {
          if (publicKey === undefined || publicKey === '') {
            console.log('Freighter is connected but no account is active');
            console.log('Attempting to request access...');
            
            // Try to request access to see if that helps
            try {
              const requestAccessFn = requestAccess || pkg.requestAccess;
              await requestAccessFn();
              
              // Try getting address again after requesting access
              const retryAddressResult = getAddress ? await getAddress() : await pkg.getAddress();
              console.log('Retry address result:', retryAddressResult);
              
              let retryPublicKey = null;
              if (typeof retryAddressResult === 'string') {
                retryPublicKey = retryAddressResult;
              } else if (retryAddressResult && typeof retryAddressResult === 'object') {
                retryPublicKey = retryAddressResult.address || retryAddressResult.publicKey;
              }
              
              if (retryPublicKey && retryPublicKey.length > 0 && retryPublicKey.startsWith('G')) {
                console.log('Successfully got address after requesting access:', retryPublicKey);
                this.state.isConnected = true;
                this.state.publicKey = retryPublicKey;
                this.state.isLoading = false;
                this.notifyListeners();
                this.startWalletWatcher();
                return true;
              }
            } catch (accessError) {
              console.log('Access request failed:', accessError);
            }
            
            console.log('Please open Freighter extension and:');
            console.log('1. Create a new wallet, OR');
            console.log('2. Import an existing wallet, OR');
            console.log('3. Select an existing account');
          } else {
            console.log('No valid public key found - Freighter may not have an account set up');
          }
          this.state.isConnected = false;
          this.state.publicKey = null;
          this.state.isLoading = false;
          this.notifyListeners();
          return false;
        }
      } catch (error) {
        console.error('Error getting public key:', error);
        this.state.isConnected = false;
        this.state.publicKey = null;
        this.state.isLoading = false;
        this.notifyListeners();
        return false;
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      this.state.isConnected = false;
      this.state.publicKey = null;
      this.state.isLoading = false;
      this.notifyListeners();
      return false;
    }
  }

  // Start watching for wallet changes
  private startWalletWatcher() {
    if (this.walletWatcher) {
      this.walletWatcher.stop();
    }
    
    this.walletWatcher = new WatchWalletChanges(2000); // Poll every 2 seconds
    
    this.walletWatcher.watch(({ address, network, networkPassphrase }) => {
      console.log('Wallet change detected:', { address, network });
      
      if (address && address !== this.state.publicKey) {
        this.state.publicKey = address;
        this.notifyListeners();
      }
    });
  }

  // Stop watching wallet changes
  private stopWalletWatcher() {
    if (this.walletWatcher) {
      this.walletWatcher.stop();
      this.walletWatcher = null;
    }
  }


  async connect(): Promise<{ success: boolean; publicKey?: string; error?: string }> {
    if (typeof window === 'undefined') {
      return {
        success: false,
        error: 'Window tidak tersedia (SSR)',
      };
    }

    try {
      console.log('Starting wallet connection...');
      
      // Check if Freighter is available
      const available = await this.isWalletAvailable();
      if (!available) {
        return {
          success: false,
          error: 'Freighter extension tidak ditemukan. Silakan instal dari https://freighter.app',
        };
      }

      // Check if already connected
      const connected = isConnected ? await isConnected() : await pkg.isConnected();
      console.log('Already connected:', connected);
      
      if (connected) {
        // Try to get public key
        try {
          const addressResult = getAddress ? await getAddress() : await pkg.getAddress();
          
          // Handle different response formats
          let publicKey = null;
          if (typeof addressResult === 'string') {
            publicKey = addressResult;
          } else if (addressResult && typeof addressResult === 'object') {
            publicKey = addressResult.address || addressResult.publicKey;
          }
          
          if (publicKey && publicKey.length > 0 && publicKey.startsWith('G')) {
            this.state.isConnected = true;
            this.state.publicKey = publicKey;
            this.state.isLoading = false;
            this.notifyListeners();
            this.startWalletWatcher();
            return { success: true, publicKey };
          } else {
            return {
              success: false,
              error: 'Freighter terpasang tetapi tidak ada akun yang aktif. Silakan buat atau pilih akun di Freighter.',
            };
          }
        } catch (error) {
          console.error('Error getting public key:', error);
          return {
            success: false,
            error: 'Gagal mendapatkan alamat wallet. Pastikan Freighter sudah di-setup.',
          };
        }
      }

      // Request access
      console.log('Requesting wallet access...');
      try {
        const requestAccessFn = requestAccess || pkg.requestAccess;
        await requestAccessFn();
        
        // Get public key after access
        const addressResult = getAddress ? await getAddress() : await pkg.getAddress();
        
        // Handle different response formats
        let publicKey = null;
        if (typeof addressResult === 'string') {
          publicKey = addressResult;
        } else if (addressResult && typeof addressResult === 'object') {
          publicKey = addressResult.address || addressResult.publicKey;
        }

        if (publicKey && publicKey.length > 0 && publicKey.startsWith('G')) {
          this.state.isConnected = true;
          this.state.publicKey = publicKey;
          this.state.isLoading = false;
          this.notifyListeners();
          this.startWalletWatcher();
          return { success: true, publicKey };
        } else {
          return {
            success: false,
            error: 'Akses berhasil tetapi tidak ada akun yang aktif. Silakan buat atau pilih akun di Freighter.',
          };
        }
      } catch (accessError) {
        console.error('Access request failed:', accessError);
        return {
          success: false,
          error: 'Pengguna menolak akses atau Freighter tidak tersedia.',
        };
      }
    } catch (error: any) {
      console.error('Error connecting to wallet:', error);
      return {
        success: false,
        error: error.message || 'Gagal menghubungkan wallet. Pastikan Freighter terinstal.',
      };
    }
  }

  async disconnect(): Promise<void> {
    try {
      this.stopWalletWatcher();
      this.state.isConnected = false;
      this.state.publicKey = null;
      this.state.isLoading = false;
      this.notifyListeners();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  }

  async signTransaction(transactionXdr: string, networkPassphrase?: string): Promise<{ signedTransaction?: string; error?: string }> {
    if (!this.state.isConnected || !this.state.publicKey) {
      return {
        error: 'Wallet tidak terhubung. Silakan hubungkan wallet terlebih dahulu.',
      };
    }

    try {
      console.log('Signing transaction with XDR:', transactionXdr.substring(0, 50) + '...');
      console.log('Network passphrase for signing:', networkPassphrase);
      
      // Always provide network passphrase for Soroban transactions
      const options = { networkPassphrase: networkPassphrase || 'Test SDF Network ; September 2015' };
      console.log('Signing with options:', options);
      
      const signTransactionFn = freighterSignTransaction || pkg.signTransaction;
      const result = await signTransactionFn(transactionXdr, options);
      console.log('Signed transaction result:', typeof result, result);
      
      // Extract signedTxXdr
      const signedTxXdr = typeof result === 'object' && result.signedTxXdr 
        ? result.signedTxXdr 
        : result;
      
      return { signedTransaction: signedTxXdr };
    } catch (error: any) {
      console.error('Error signing transaction:', error);
      return {
        error: error.message || 'Gagal menandatangani transaksi',
      };
    }
  }

  async setAllowed(allowed: boolean): Promise<void> {
    try {
      await setAllowed(allowed);
    } catch (error) {
      console.error('Error setting wallet allowed:', error);
    }
  }

  async getNetworkDetails(): Promise<any> {
    try {
      return await getNetworkDetails();
    } catch (error) {
      console.error('Error getting network details:', error);
      return null;
    }
  }

  getPublicKey(): string | null {
    return this.state.publicKey;
  }
}

// Export singleton instance
export const walletService = WalletService.getInstance();

// Utility functions
export const formatAddress = (address: string | { address: string } | null): string => {
  if (!address) return '';
  
  const addressString = typeof address === 'string' ? address : address.address;
  
  if (!addressString) return '';
  return `${addressString.slice(0, 6)}...${addressString.slice(-4)}`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (typeof window === 'undefined' || !navigator.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};