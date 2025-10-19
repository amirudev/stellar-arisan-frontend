import { useEffect, useState } from 'react';
import { Layout } from '~/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { sorobanUtils } from '~/lib/soroban';
import { walletService } from '~/lib/wallet';
import toast from 'react-hot-toast';
import { Link } from 'react-router';

export function meta() {
  return [
    { title: "Daftar Arisan - Arisan on Chain" },
    { name: "description", content: "Lihat semua grup arisan yang tersedia" },
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

export default function ArisansList() {
  const [arisans, setArisans] = useState<ArisanData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArisans = async () => {
      try {
        setIsLoading(true);
        
        // Get wallet state
        const walletState = walletService.getState();
        if (!walletState.isConnected || !walletState.publicKey) {
          console.log('Wallet not connected, showing empty list');
          setIsLoading(false);
          return;
        }

        console.log('Fetching all arisans');
        const allArisans = await sorobanUtils.getAllArisans();
        console.log('All arisans:', allArisans);

        setArisans(allArisans);

      } catch (error) {
        console.error('Error fetching arisans:', error);
        toast.error('Gagal memuat daftar arisan');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArisans();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-success-100 text-success-800' 
      : 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Daftar Arisan</h1>
            <p className="mt-2 text-gray-600">Memuat daftar arisan...</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Daftar Arisan</h1>
            <p className="mt-2 text-gray-600">
              Lihat semua grup arisan yang tersedia di platform
            </p>
          </div>
          <Link to="/create-arisan">
            <button>
              Buat Arisan Baru
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Arisan</p>
                  <p className="text-2xl font-semibold text-gray-900">{arisans.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Aktif</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {arisans.filter(a => a.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Selesai</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {arisans.filter(a => !a.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Arisan List */}
        {arisans.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Arisan</h3>
              <p className="text-gray-500 mb-6">
                Belum ada grup arisan yang dibuat. Jadilah yang pertama membuat arisan!
              </p>
              <Link to="/create-arisan">
                <button>
                  Buat Arisan Pertama
                </button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {arisans.map((arisan) => {
              const walletState = walletService.getState();
              const isOwner = arisan.owner === walletState.publicKey;
              const isMember = arisan.members.includes(walletState.publicKey || '');
              
              return (
                <Card key={arisan.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Arisan #{arisan.id}</CardTitle>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(arisan.isActive)}`}>
                        {arisan.isActive ? 'Aktif' : 'Selesai'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Anggota:</span>
                        <span className="font-medium">{arisan.members.length} orang</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Putaran:</span>
                        <span className="font-medium">{arisan.roundCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Iuran per Putaran:</span>
                        <span className="font-medium">{formatCurrency(arisan.dueAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Pool:</span>
                        <span className="font-medium">{formatCurrency(arisan.totalPool)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      {isOwner && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          Owner
                        </span>
                      )}
                      {isMember && !isOwner && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                          Anggota
                        </span>
                      )}
                    </div>

                    <div className="pt-2">
                      <Link to={`/arisan/${arisan.id}`}>
                        <Button variant="outline" className="w-full">
                          Lihat Detail
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
