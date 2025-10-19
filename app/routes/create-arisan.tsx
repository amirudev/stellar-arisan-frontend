import { useState } from 'react';
import { Layout } from '~/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Label } from '~/components/ui/Label';
import { createArisanSchema, type CreateArisanInput } from '~/lib/validations';
import { walletService } from '~/lib/wallet';
import { sorobanUtils, getRpc, NETWORK_PASSPHRASE } from '~/lib/soroban';
import toast from 'react-hot-toast';
// import { type Route } from "./+types/create-arisan";

export function meta() {
  return [
    { title: "Buat Arisan Baru - Arisan on Chain" },
    { name: "description", content: "Buat grup arisan baru dengan transparansi blockchain" },
  ];
}

interface Member {
  address: string;
  name: string;
}

export default function CreateArisan() {
  const [formData, setFormData] = useState({
    name: '',
    roundCount: 12,
    dueAmount: 100000,
  });

  const [members, setMembers] = useState<Member[]>([
    { address: '', name: '' },
    { address: '', name: '' },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleMemberChange = (index: number, field: 'address' | 'name', value: string) => {
    setMembers(prev => prev.map((member, i) => 
      i === index ? { ...member, [field]: value } : member
    ));
  };

  const addMember = () => {
    setMembers(prev => [...prev, { address: '', name: '' }]);
  };

  const removeMember = (index: number) => {
    if (members.length > 2) {
      setMembers(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = (): boolean => {
    try {
      const data: CreateArisanInput = {
        ...formData,
        members: members.filter(m => m.address && m.name),
      };
      
      createArisanSchema.parse(data);
      setErrors({});
      return true;
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
      }
      
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Silakan periksa kembali data yang diisi');
      return;
    }

    if (!walletService.getState().isConnected) {
      toast.error('Silakan hubungkan wallet terlebih dahulu');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get wallet state
      const walletState = walletService.getState();
      if (!walletState.isConnected || !walletState.publicKey) {
        toast.error('Silakan hubungkan wallet terlebih dahulu');
        return;
      }

      // Prepare contract parameters
      const memberAddresses = members
        .filter(m => m.address.trim())
        .map(m => m.address.trim());

      if (memberAddresses.length === 0) {
        toast.error('Minimal harus ada 1 anggota');
        return;
      }

      console.log('Creating arisan with params:', {
        owner: walletState.publicKey,
        members: memberAddresses,
        roundCount: formData.roundCount,
        dueAmount: formData.dueAmount
      });

      // Create transaction
      const rpc = await getRpc();
      if (!rpc) {
        toast.error('RPC client tidak tersedia. Silakan refresh halaman.');
        return;
      }
      
      const sourceAccount = await rpc.getAccount(walletState.publicKey);
      const transaction = await sorobanUtils.initArisan(
        walletState.publicKey,
        memberAddresses,
        formData.roundCount,
        formData.dueAmount,
        sourceAccount
      );

      // Simulate the transaction first to get resource requirements
      console.log('Simulating transaction...');
      const simulateResult = await rpc.simulateTransaction(transaction);
      console.log('Simulation result:', simulateResult);

      if (simulateResult.error) {
        throw new Error(`Simulation failed: ${simulateResult.error}`);
      }

      // Import SDK components
      const sdk = await import('@stellar/stellar-sdk');
      console.log('SDK loaded, checking for assembleTransaction...');
      console.log('SDK keys:', Object.keys(sdk));
      console.log('SDK.rpc:', sdk.rpc);
      console.log('SDK.SorobanRpc:', sdk.SorobanRpc);
      
      // Try different ways to access assembleTransaction
      let assembleTransaction;
      if (sdk.rpc && sdk.rpc.assembleTransaction) {
        assembleTransaction = sdk.rpc.assembleTransaction;
        console.log('Using sdk.rpc.assembleTransaction');
      } else if (sdk.SorobanRpc && sdk.SorobanRpc.assembleTransaction) {
        assembleTransaction = sdk.SorobanRpc.assembleTransaction;
        console.log('Using sdk.SorobanRpc.assembleTransaction');
      } else if (sdk.assembleTransaction) {
        assembleTransaction = sdk.assembleTransaction;
        console.log('Using sdk.assembleTransaction');
      } else {
        throw new Error('assembleTransaction not found in SDK');
      }
      
      // Prepare the transaction with simulation results
      const preparedTransaction = assembleTransaction(
        transaction,
        simulateResult
      ).build();

      console.log('Prepared transaction for signing');

      // Sign and submit transaction
      const signedTransaction = await walletService.signTransaction(
        preparedTransaction.toXDR(),
        NETWORK_PASSPHRASE
      );
      
      if (signedTransaction.error) {
        throw new Error(signedTransaction.error);
      }

      if (!signedTransaction.signedTransaction) {
        throw new Error('Gagal menandatangani transaksi');
      }

      // Convert signed XDR back to Transaction object
      const signedTxObject = sdk.TransactionBuilder.fromXDR(
        signedTransaction.signedTransaction,
        NETWORK_PASSPHRASE
      );

      // Submit transaction
      const result = await rpc.sendTransaction(signedTxObject);

      console.log('Transaction submitted:', result);
      console.log('Transaction hash:', result.hash);
      console.log('Transaction status:', result.status);
      
      if (result.errorResult) {
        console.log('Error result:', result.errorResult);
        console.log('Error result XDR:', result.errorResult.toXDR('base64'));
      }

      if (result.status === 'PENDING' || result.status === 'SUCCESS') {
        toast.success('Transaksi berhasil dikirim! Hash: ' + result.hash);
        
        // Reset form
        setFormData({
          name: '',
          roundCount: 12,
          dueAmount: 100000,
        });
        setMembers([
          { address: '', name: '' },
          { address: '', name: '' },
        ]);
      } else {
        const errorMsg = result.errorResult 
          ? `Transaction failed with error: ${result.errorResult.toXDR('base64')}`
          : `Transaction failed with status: ${result.status}`;
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('Error creating arisan:', error);
      toast.error(error.message || 'Gagal membuat grup arisan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Buat Grup Arisan Baru</h1>
          <p className="mt-2 text-gray-600">
            Buat grup arisan yang transparan dan aman dengan teknologi blockchain
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Grup Arisan</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Group Name */}
              <div>
                <Label htmlFor="name" required>
                  Nama Grup Arisan
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Contoh: Arisan Keluarga Besar"
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </div>

              {/* Round Count */}
              <div>
                <Label htmlFor="roundCount" required>
                  Jumlah Putaran
                </Label>
                <Input
                  id="roundCount"
                  type="number"
                  min="2"
                  max="100"
                  value={formData.roundCount}
                  onChange={(e) => handleInputChange('roundCount', parseInt(e.target.value) || 0)}
                  error={!!errors.roundCount}
                  helperText={errors.roundCount}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Setiap anggota akan mendapat giliran menang sekali
                </p>
              </div>

              {/* Due Amount */}
              <div>
                <Label htmlFor="dueAmount" required>
                  Jumlah Iuran per Putaran
                </Label>
                <Input
                  id="dueAmount"
                  type="number"
                  min="1000"
                  max="10000000"
                  step="1000"
                  value={formData.dueAmount}
                  onChange={(e) => handleInputChange('dueAmount', parseInt(e.target.value) || 0)}
                  error={!!errors.dueAmount}
                  helperText={errors.dueAmount}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Total yang akan diterima pemenang: {formatCurrency(formData.dueAmount * members.length)}
                </p>
              </div>

              {/* Members */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label required>
                    Anggota Grup
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMember}
                  >
                    Tambah Anggota
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {members.map((member, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <Label htmlFor={`member-name-${index}`} required>
                              Nama Anggota
                            </Label>
                            <Input
                              id={`member-name-${index}`}
                              type="text"
                              value={member.name}
                              onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                              placeholder="Nama lengkap"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`member-address-${index}`} required>
                              Alamat Stellar
                            </Label>
                            <Input
                              id={`member-address-${index}`}
                              type="text"
                              value={member.address}
                              onChange={(e) => handleMemberChange(index, 'address', e.target.value)}
                              placeholder="G..."
                            />
                          </div>
                        </div>
                      </div>
                      {members.length > 2 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeMember(index)}
                        >
                          Hapus
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                {errors.members && (
                  <p className="text-sm text-error-600 mt-1">{errors.members}</p>
                )}
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Ringkasan Grup Arisan</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Nama:</strong> {formData.name || 'Belum diisi'}</p>
                  <p><strong>Jumlah Putaran:</strong> {formData.roundCount} putaran</p>
                  <p><strong>Iuran per Putaran:</strong> {formatCurrency(formData.dueAmount)}</p>
                  <p><strong>Jumlah Anggota:</strong> {members.filter(m => m.address && m.name).length} orang</p>
                  <p><strong>Total Hadiah per Putaran:</strong> {formatCurrency(formData.dueAmount * members.filter(m => m.address && m.name).length)}</p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">
                  Batal
                </Button>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={!walletService.getState().isConnected}
                >
                  {isSubmitting ? 'Membuat Grup...' : 'Buat Grup Arisan'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Informasi Penting</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Semua transaksi akan tercatat di blockchain Stellar</li>
                  <li>• Anda akan menjadi owner grup dan memiliki hak untuk mengelola grup</li>
                  <li>• Pastikan semua alamat Stellar anggota sudah benar</li>
                  <li>• Grup arisan tidak dapat dibatalkan setelah dibuat</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
