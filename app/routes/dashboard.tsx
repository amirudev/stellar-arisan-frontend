import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { Layout } from '~/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { sorobanUtils } from '~/lib/soroban';
import { walletService } from '~/lib/wallet';
import toast from 'react-hot-toast';
// import { type Route } from "./+types/dashboard";

export function meta() {
  return [
    { title: "Dashboard - Arisan on Chain" },
    { name: "description", content: "Dashboard pengguna untuk mengelola grup arisan" },
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

interface UserStats {
  totalArisanGroups: number;
  activeGroups: number;
  completedGroups: number;
  totalWon: number;
  totalPaid: number;
}

interface ActivityData {
  id: string;
  type: string;
  description: string;
  amount: number | null;
  date: string;
  status: string;
  arisanId?: string;
  round?: number;
}

export default function Dashboard() {
      const [userStats, setUserStats] = useState<UserStats>({
        totalArisanGroups: 0,
        activeGroups: 0,
        completedGroups: 0,
        totalWon: 0,
        totalPaid: 0,
      });
      const [recentArisanGroups, setRecentArisanGroups] = useState<ArisanData[]>([]);
      const [recentActivity, setRecentActivity] = useState<ActivityData[]>([]);
      const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Get wallet state
        const walletState = walletService.getState();
        if (!walletState.isConnected || !walletState.publicKey) {
          console.log('Wallet not connected, showing empty dashboard');
          setIsLoading(false);
          return;
        }

        console.log('Fetching dashboard data for user:', walletState.publicKey);

            // Get user's arisan groups
            const userArisans = await sorobanUtils.getUserArisans(walletState.publicKey);
            console.log('User arisans:', userArisans);

            // Get user's recent activities
            const userActivities = await sorobanUtils.getUserActivities(walletState.publicKey);
            console.log('User activities:', userActivities);

            // Get user's payments and winnings for stats
            const userPayments = await sorobanUtils.getUserPayments(walletState.publicKey);
            const userWinnings = await sorobanUtils.getUserWinnings(walletState.publicKey);

            // Calculate stats
            const totalGroups = userArisans.length;
            const activeGroups = userArisans.filter(a => a.isActive).length;
            const completedGroups = userArisans.filter(a => !a.isActive).length;
            const totalPaid = userPayments.reduce((sum, payment) => sum + payment.amount, 0);
            const totalWon = userWinnings.reduce((sum, winning) => sum + winning.amount, 0);

            setUserStats({
              totalArisanGroups: totalGroups,
              activeGroups,
              completedGroups,
              totalWon,
              totalPaid,
            });

            setRecentArisanGroups(userArisans.slice(0, 5)); // Show latest 5
            setRecentActivity(userActivities.slice(0, 10)); // Show latest 10 activities

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Gagal memuat data dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return (
          <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case 'winner':
        return (
          <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case 'creation':
        return (
          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Memuat data dashboard...</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Kelola grup arisan Anda dan pantau aktivitas terbaru
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Grup Arisan</p>
                  <p className="text-2xl font-semibold text-gray-900">{userStats.totalArisanGroups}</p>
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
                  <p className="text-sm font-medium text-gray-500">Grup Aktif</p>
                  <p className="text-2xl font-semibold text-gray-900">{userStats.activeGroups}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Menang</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(userStats.totalWon)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Bayar</p>
                      <p className="text-2xl font-semibold text-gray-900">{formatCurrency(userStats.totalPaid)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.329 1.176l1.519 4.674c.3.921-.755 1.688-1.539 1.175l-4.915-3.74a1 1 0 00-1.176 0l-4.915 3.74c-.784.513-1.83-.254-1.539-1.175l1.519-4.674a1 1 0 00-.329-1.176l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Menang</p>
                      <p className="text-2xl font-semibold text-gray-900">{formatCurrency(userStats.totalWon)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Link to="/create-arisan">
            <button>
              Buat Arisan Baru
            </button>
          </Link>
          <Link to="/arisans">
            <Button variant="outline">Lihat Semua Arisan</Button>
          </Link>
          <Button variant="outline">Riwayat Transaksi</Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Arisan Groups */}
          <Card>
            <CardHeader>
              <CardTitle>Grup Arisan Anda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentArisanGroups.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Belum ada grup arisan</p>
                  <Link to="/create-arisan">
                    <Button className="mt-4" variant="outline">
                      Buat Grup Arisan Pertama
                    </Button>
                  </Link>
                </div>
              ) : (
                recentArisanGroups.map((group) => {
                  const walletState = walletService.getState();
                  const isOwner = group.owner === walletState.publicKey;
                  
                  return (
                    <div key={group.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">Arisan #{group.id}</h3>
                          {isOwner && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              Owner
                            </span>
                          )}
                        </div>
                            <p className="text-sm text-gray-500">
                              Putaran 1/{group.roundCount} • {group.members.length} anggota
                            </p>
                            <p className="text-sm text-gray-500">
                              Iuran: {formatCurrency(group.dueAmount)}
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(group.isActive)}`}>
                              {group.isActive ? 'Aktif' : 'Selesai'}
                            </span>
                            <Link to={`/arisan/${group.id}`}>
                              <Button size="sm" variant="outline">
                                Lihat Detail
                              </Button>
                            </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Aktivitas Terbaru</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    {activity.amount && (
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(activity.amount)}</p>
                    )}
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
