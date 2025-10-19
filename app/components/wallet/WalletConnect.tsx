import { useState, useEffect } from 'react';
import { Button } from '~/components/ui/Button';
import { walletService, formatAddress } from '~/lib/wallet';
import toast from 'react-hot-toast';

export function WalletConnect() {
  const [walletState, setWalletState] = useState(walletService.getState());
  const [isClient, setIsClient] = useState(false);
  const [detectionAttempts, setDetectionAttempts] = useState(0);
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const unsubscribe = walletService.subscribe(setWalletState);
    
    // Simple auto-detection using official API
    const autoDetectFreighter = async () => {
      setIsDetecting(true);
      
      // Try connection check
      const detected = await walletService.checkConnection();
      
      setIsDetecting(false);
    };

    autoDetectFreighter();

    return unsubscribe;
  }, []);

  const handleConnect = async () => {
    const result = await walletService.connect();
    
    if (result.success) {
      toast.success('Wallet berhasil terhubung!');
    } else {
      toast.error(result.error || 'Gagal menghubungkan wallet');
    }
  };

  const handleDisconnect = async () => {
    await walletService.disconnect();
    toast.success('Wallet berhasil diputuskan');
  };

  const handleCopyAddress = async () => {
    if (walletState.publicKey) {
      try {
        await navigator.clipboard.writeText(walletState.publicKey);
        toast.success('Alamat wallet disalin ke clipboard');
      } catch (error) {
        toast.error('Gagal menyalin alamat wallet');
      }
    }
  };

  const handleRetryDetection = async () => {
    setIsDetecting(true);
    setDetectionAttempts(0);
    
    const detected = await walletService.checkConnection();
    if (detected) {
      toast.success('Freighter wallet terdeteksi!');
    } else {
      toast.error('Freighter wallet masih tidak terdeteksi');
    }
    
    setIsDetecting(false);
  };

  const handleReloadPage = () => {
    toast('Reload halaman untuk mendeteksi Freighter...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Show loading state during SSR/hydration or detection
  if (!isClient || isDetecting) {
    return (
      <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Mendeteksi Freighter Wallet</h3>
          <p className="text-sm text-gray-500 mb-4">
            {detectionAttempts > 0 
              ? `Mencoba deteksi... (${detectionAttempts}/5)`
              : 'Memindai extension...'
            }
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((detectionAttempts / 5) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400">
            Pastikan Freighter extension sudah terinstal dan aktif
          </p>
        </div>
      </div>
    );
  }

  if (!walletState.isConnected) {
    return (
      <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Freighter Wallet Terhubung</h3>
          <p className="text-sm text-gray-500 mb-6">
            Freighter extension sudah terhubung, tetapi belum ada akun yang aktif. Silakan:
          </p>
          <div className="text-sm text-gray-600 mb-6 space-y-1">
            <p>• Buka Freighter extension (klik ikon Freighter di toolbar)</p>
            <p>• Buat wallet baru, ATAU</p>
            <p>• Import wallet yang sudah ada, ATAU</p>
            <p>• Pilih akun yang sudah ada</p>
            <p>• Pastikan akun aktif (tidak kosong)</p>
          </div>
          
          <div className="space-y-3 mb-6">
            <Button onClick={handleConnect} className="w-full">
              Coba Hubungkan Lagi
            </Button>
            <Button onClick={handleRetryDetection} variant="outline" className="w-full">
              Retry Detection
            </Button>
          </div>

          {/* Troubleshooting */}
          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 mb-2">Langkah-langkah setup akun:</p>
            <div className="space-y-1 text-xs text-left">
              <p>1. Klik ikon Freighter di toolbar browser</p>
              <p>2. Jika belum ada akun, klik "Create New Wallet"</p>
              <p>3. Simpan 12 kata kunci pemulihan dengan aman</p>
              <p>4. Set password untuk wallet</p>
              <p>5. Switch ke Testnet (Settings → Network → Testnet)</p>
              <p>6. Klik "Retry Detection" di bawah ini</p>
            </div>
            <Button onClick={handleRetryDetection} size="sm" variant="outline" className="mt-3 w-full">
              Retry Detection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {formatAddress(walletState.publicKey)}
          </p>
          <p className="text-xs text-gray-500">Terhubung</p>
        </div>
      </div>
      <Button onClick={handleCopyAddress} size="sm" variant="outline">
        Salin
      </Button>
      <Button onClick={handleDisconnect} size="sm" variant="destructive">
        Putuskan
      </Button>
    </div>
  );
}
