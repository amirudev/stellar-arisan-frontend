import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Layout } from '~/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { sorobanUtils, getRpc, NETWORK_PASSPHRASE } from '~/lib/soroban';
import { walletService } from '~/lib/wallet';
import toast from 'react-hot-toast';

export function meta() {
  return [
    { title: "Detail Arisan - Arisan on Chain" },
    { name: "description", content: "Detail grup arisan dan kelola pembayaran" },
  ];
}

interface ArisanData {
  id: number;
  owner: string;
  members: string[];
  roundCount: number;
  dueAmount: number;
  totalPool: number;
  isActive: boolean;
}

interface WinnerData {
  arisanId: number;
  round: number;
  winner: string;
  timestamp: number;
  isReleased: boolean;
}

export default function ArisanDetail() {
  const { id } = useParams();
  const [arisan, setArisan] = useState<ArisanData | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState(false);
  const [winner, setWinner] = useState<WinnerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);

  useEffect(() => {
    const fetchArisanData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Get wallet state
        const walletState = walletService.getState();
        if (!walletState.isConnected || !walletState.publicKey) {
          toast.error('Silakan hubungkan wallet terlebih dahulu');
          setIsLoading(false);
          return;
        }

        const arisanId = parseInt(id);
        console.log('Fetching arisan data for ID:', arisanId);

        // Fetch arisan data
        const arisanData = await sorobanUtils.getArisan(arisanId);
        if (!arisanData) {
          toast.error('Arisan tidak ditemukan');
          setIsLoading(false);
          return;
        }

        setArisan(arisanData);

        // Get current round
        const currentRoundNum = await sorobanUtils.getCurrentRound(arisanId);
        console.log('Current round from contract:', currentRoundNum);
        setCurrentRound(currentRoundNum);

        // Check payment status for current round
        const hasPaid = await sorobanUtils.getPaymentStatus(arisanId, currentRoundNum);
        console.log('Payment status for round', currentRoundNum, ':', hasPaid);
        setPaymentStatus(hasPaid);

        // Check if there's a winner for current round
        const winnerData = await sorobanUtils.getWinner(arisanId, currentRoundNum);
        setWinner(winnerData);

      } catch (error) {
        console.error('Error fetching arisan data:', error);
        toast.error('Gagal memuat data arisan');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArisanData();
  }, [id]);

  const handlePayDue = async () => {
    if (!arisan || !id) return;

    const walletState = walletService.getState();
    if (!walletState.isConnected || !walletState.publicKey) {
      toast.error('Silakan hubungkan wallet terlebih dahulu');
      return;
    }

    setIsPaying(true);

    try {
      const rpc = await getRpc();
      if (!rpc) {
        toast.error('RPC client tidak tersedia');
        return;
      }

      const arisanId = parseInt(id);
      
      // Check if user is a member of this arisan
      const isMember = await sorobanUtils.isUserMember(arisanId, walletState.publicKey);
      if (!isMember) {
        toast.error('Anda bukan anggota dari grup arisan ini');
        return;
      }

      // Check if user has already paid for this round
      const hasPaid = await sorobanUtils.getPaymentStatus(arisanId, currentRound);
      if (hasPaid) {
        toast.error('Anda sudah membayar untuk round ini');
        return;
      }

      const sourceAccount = await rpc.getAccount(walletState.publicKey);
      
      // Create payment transaction
      console.log('Paying due with parameters:', {
        arisanId,
        currentRound,
        dueAmount: arisan.dueAmount,
        userAddress: walletService.getState().publicKey
      });
      
      console.log('Arisan data:', arisan);
      console.log('Current round:', currentRound);
      console.log('Due amount:', arisan.dueAmount);
      console.log('Arisan members:', arisan.members);
      console.log('User address:', walletState.publicKey);
      console.log('User is member:', arisan.members.includes(walletState.publicKey));

      const transaction = await sorobanUtils.payDue(
        arisanId,
        currentRound,
        arisan.dueAmount,
        sourceAccount
      );

      // Simulate transaction first
      console.log('Simulating transaction...');
      const simulation = await rpc.simulateTransaction(transaction);
      console.log('Simulation result:', simulation);
      
      if (simulation.error) {
        console.error('Simulation error:', simulation.error);
        throw new Error(`Transaction simulation failed: ${simulation.error.message}`);
      }

      // Assemble transaction with simulation results
      const sdkForAssembly = await import('@stellar/stellar-sdk');
      
      // Try different SDK assembly paths
      let assembledTx;
      if (sdkForAssembly.SorobanRpc && sdkForAssembly.SorobanRpc.assembleTransaction) {
        assembledTx = sdkForAssembly.SorobanRpc.assembleTransaction(transaction, simulation);
      } else if (sdkForAssembly.rpc && sdkForAssembly.rpc.assembleTransaction) {
        assembledTx = sdkForAssembly.rpc.assembleTransaction(transaction, simulation);
      } else if (sdkForAssembly.assembleTransaction) {
        assembledTx = sdkForAssembly.assembleTransaction(transaction, simulation);
      } else {
        console.error('Available SDK methods:', Object.keys(sdkForAssembly));
        throw new Error('assembleTransaction method not found in SDK');
      }
      console.log('Assembled transaction:', assembledTx);

      // Use the original transaction for signing (assembly is just for resource calculation)
      const signedTransaction = await walletService.signTransaction(transaction.toXDR(), NETWORK_PASSPHRASE);
      
      if (signedTransaction.error) {
        throw new Error(signedTransaction.error);
      }

      if (!signedTransaction.signedTransaction) {
        throw new Error('Gagal menandatangani transaksi');
      }

      // Convert signed XDR back to Transaction object
      const sdkForPayDue = await import('@stellar/stellar-sdk');
      const signedTxObject = sdkForPayDue.TransactionBuilder.fromXDR(
        signedTransaction.signedTransaction,
        NETWORK_PASSPHRASE
      );

      // Submit transaction
      const result = await rpc.sendTransaction(signedTxObject);

      console.log('Transaction result:', result);
      console.log('Transaction status:', result.status);
      console.log('Transaction hash:', result.hash);

      if (result.errorResult) {
        console.log('Error result:', result.errorResult);
        console.log('Error result XDR:', result.errorResult.toXDR('base64'));
        throw new Error(`Smart contract error: ${result.errorResult.toXDR('base64')}`);
      }

      if (result.status === 'SUCCESS') {
        toast.success('Pembayaran berhasil!');
        setPaymentStatus(true);
      } else {
        throw new Error('Transaksi gagal: ' + result.status);
      }
    } catch (error: any) {
      console.error('Error paying due:', error);
      toast.error(error.message || 'Gagal melakukan pembayaran');
    } finally {
      setIsPaying(false);
    }
  };

  const handleDrawWinner = async () => {
    if (!arisan || !id) return;

    const walletState = walletService.getState();
    if (!walletState.isConnected || !walletState.publicKey) {
      toast.error('Silakan hubungkan wallet terlebih dahulu');
      return;
    }

    setIsDrawing(true);

    try {
      const rpc = await getRpc();
      if (!rpc) {
        toast.error('RPC client tidak tersedia');
        return;
      }

      const arisanId = parseInt(id);
      const sourceAccount = await rpc.getAccount(walletState.publicKey);
      
      // Generate random seed
      const seed = Math.floor(Math.random() * 1000000);
      
      // Create draw winner transaction
      const transaction = await sorobanUtils.drawWinner(
        arisanId,
        currentRound,
        seed,
        sourceAccount
      );

      // Sign and submit transaction
      const signedTransaction = await walletService.signTransaction(transaction.toXDR(), NETWORK_PASSPHRASE);
      
      if (signedTransaction.error) {
        throw new Error(signedTransaction.error);
      }

      if (!signedTransaction.signedTransaction) {
        throw new Error('Gagal menandatangani transaksi');
      }

      // Convert signed XDR back to Transaction object
      const sdkForDrawWinner = await import('@stellar/stellar-sdk');
      const signedTxObject = sdkForDrawWinner.TransactionBuilder.fromXDR(
        signedTransaction.signedTransaction,
        NETWORK_PASSPHRASE
      );

      // Submit transaction
      const result = await rpc.sendTransaction(signedTxObject);

      console.log('Draw winner transaction result:', result);

      if (result.errorResult) {
        console.log('Error result:', result.errorResult);
        console.log('Error result XDR:', result.errorResult.toXDR('base64'));
        throw new Error(`Smart contract error: ${result.errorResult.toXDR('base64')}`);
      }

      if (result.status === 'SUCCESS') {
        toast.success('Pemenang berhasil dipilih!');
        // Refresh winner data
        const winnerData = await sorobanUtils.getWinner(arisanId, currentRound);
        setWinner(winnerData);
      } else {
        throw new Error('Transaksi gagal: ' + result.status);
      }
    } catch (error: any) {
      console.error('Error drawing winner:', error);
      toast.error(error.message || 'Gagal memilih pemenang');
    } finally {
      setIsDrawing(false);
    }
  };

  const handleReleaseFunds = async () => {
    if (!arisan || !id) return;

    const walletState = walletService.getState();
    if (!walletState.isConnected || !walletState.publicKey) {
      toast.error('Silakan hubungkan wallet terlebih dahulu');
      return;
    }

    setIsReleasing(true);

    try {
      const rpc = await getRpc();
      if (!rpc) {
        toast.error('RPC client tidak tersedia');
        return;
      }

      const arisanId = parseInt(id);
      const sourceAccount = await rpc.getAccount(walletState.publicKey);
      
      // Create release funds transaction
      const transaction = await sorobanUtils.releaseToWinner(
        arisanId,
        currentRound,
        sourceAccount
      );

      // Sign and submit transaction
      const signedTransaction = await walletService.signTransaction(transaction.toXDR(), NETWORK_PASSPHRASE);
      
      if (signedTransaction.error) {
        throw new Error(signedTransaction.error);
      }

      if (!signedTransaction.signedTransaction) {
        throw new Error('Gagal menandatangani transaksi');
      }

      // Convert signed XDR back to Transaction object
      const sdkForReleaseFunds = await import('@stellar/stellar-sdk');
      const signedTxObject = sdkForReleaseFunds.TransactionBuilder.fromXDR(
        signedTransaction.signedTransaction,
        NETWORK_PASSPHRASE
      );

      // Submit transaction
      const result = await rpc.sendTransaction(signedTxObject);

      console.log('Release funds transaction result:', result);

      if (result.errorResult) {
        console.log('Error result:', result.errorResult);
        console.log('Error result XDR:', result.errorResult.toXDR('base64'));
        throw new Error(`Smart contract error: ${result.errorResult.toXDR('base64')}`);
      }

      if (result.status === 'SUCCESS') {
        toast.success('Dana berhasil dilepas ke pemenang!');
        // Refresh winner data
        const winnerData = await sorobanUtils.getWinner(arisanId, currentRound);
        setWinner(winnerData);
      } else {
        throw new Error('Transaksi gagal: ' + result.status);
      }
    } catch (error: any) {
      console.error('Error releasing funds:', error);
      toast.error(error.message || 'Gagal melepas dana');
    } finally {
      setIsReleasing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Memuat Detail Arisan...</h1>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  if (!arisan) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Arisan Tidak Ditemukan</h1>
          <p className="text-gray-600">Arisan dengan ID {id} tidak ditemukan.</p>
        </div>
      </Layout>
    );
  }

  const walletState = walletService.getState();
  const isOwner = arisan.owner === walletState.publicKey;
  const isMember = arisan.members.includes(walletState.publicKey || '');
  const isCurrentUserWinner = winner && winner.winner === walletState.publicKey;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Detail Arisan #{arisan.id}</h1>
          <p className="mt-2 text-gray-600">
            Kelola grup arisan dan pantau progres pembayaran
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Arisan Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Arisan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{arisan.isActive ? 'Aktif' : 'Selesai'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Putaran Saat Ini</p>
                  <p className="font-medium">{currentRound}/{arisan.roundCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jumlah Anggota</p>
                  <p className="font-medium">{arisan.members.length} orang</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Iuran per Putaran</p>
                  <p className="font-medium">{formatCurrency(arisan.dueAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Pool</p>
                  <p className="font-medium">{formatCurrency(arisan.totalPool)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role Anda</p>
                  <p className="font-medium">
                    {isOwner ? 'Owner' : isMember ? 'Anggota' : 'Non-Anggota'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Daftar Anggota</p>
                <div className="space-y-2">
                  {arisan.members.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-mono">{member}</span>
                      {member === walletState.publicKey && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Anda
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isMember && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Putaran {currentRound}</h3>
                  
                  {!paymentStatus && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Iuran yang harus dibayar: {formatCurrency(arisan.dueAmount)}
                      </p>
                      <Button
                        onClick={handlePayDue}
                        loading={isPaying}
                        className="w-full"
                      >
                        {isPaying ? 'Memproses...' : 'Bayar Iuran'}
                      </Button>
                    </div>
                  )}

                  {paymentStatus && !winner && (
                    <div className="mb-4">
                      <p className="text-sm text-success-600 mb-2">
                        ✅ Pembayaran sudah dilakukan
                      </p>
                      {isOwner && (
                        <Button
                          onClick={handleDrawWinner}
                          loading={isDrawing}
                          variant="outline"
                          className="w-full"
                        >
                          {isDrawing ? 'Memproses...' : 'Pilih Pemenang'}
                        </Button>
                      )}
                    </div>
                  )}

                  {winner && !winner.isReleased && (
                    <div className="mb-4">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800">
                          🎉 Pemenang Putaran {currentRound}
                        </p>
                        <p className="text-sm text-yellow-600 mt-1">
                          {isCurrentUserWinner ? 'Selamat! Anda adalah pemenang!' : `Pemenang: ${winner.winner}`}
                        </p>
                        <p className="text-xs text-yellow-500 mt-1">
                          Dipilih pada: {formatDate(winner.timestamp)}
                        </p>
                      </div>
                      {isOwner && (
                        <Button
                          onClick={handleReleaseFunds}
                          loading={isReleasing}
                          className="w-full mt-2"
                        >
                          {isReleasing ? 'Memproses...' : 'Lepas Dana ke Pemenang'}
                        </Button>
                      )}
                    </div>
                  )}

                  {winner && winner.isReleased && (
                    <div className="mb-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800">
                          ✅ Dana sudah dilepas ke pemenang
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          Putaran {currentRound} selesai
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!isMember && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Anda bukan anggota dari arisan ini
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
