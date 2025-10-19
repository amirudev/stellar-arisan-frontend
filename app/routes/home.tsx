import { Link } from 'react-router';
import { Layout } from '~/components/layout/Layout';
import { Button } from '~/components/ui/Button';
import { Card, CardContent } from '~/components/ui/Card';
// import { type Route } from "./+types/home";

export function meta() {
  return [
    { title: "Arisan on Chain - Decentralized ROSCA" },
    { name: "description", content: "Transparent and trustless rotating savings and credit association built on Stellar Soroban" },
  ];
}

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Arisan on Chain
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
          Platform arisan terdesentralisasi yang transparan dan dapat dipercaya. 
          Dibangun di atas Stellar Soroban untuk memberikan keamanan dan transparansi penuh.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link to="/create-arisan">
            <Button size="lg">
              Buat Arisan Baru
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" size="lg">
              Lihat Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Mengapa Memilih Arisan on Chain?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Platform arisan modern dengan teknologi blockchain untuk keamanan dan transparansi maksimal
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Transparan 100%
              </h3>
              <p className="text-gray-600">
                Semua transaksi dan pembayaran tercatat di blockchain, tidak ada yang bisa dimanipulasi.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-lg mb-4">
                <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aman & Terpercaya
              </h3>
              <p className="text-gray-600">
                Smart contract memastikan semua aturan arisan dipatuhi secara otomatis tanpa campur tangan manusia.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-warning-100 rounded-lg mb-4">
                <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cepat & Efisien
              </h3>
              <p className="text-gray-600">
                Pembayaran dan pencairan dana dilakukan secara otomatis, tidak perlu menunggu admin.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="mt-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Bagaimana Cara Kerjanya?
          </h2>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full mx-auto mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Buat Grup Arisan
              </h3>
              <p className="text-gray-600">
                Undang anggota dan tentukan jumlah iuran serta jumlah putaran.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full mx-auto mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Bayar Iuran
              </h3>
              <p className="text-gray-600">
                Semua anggota membayar iuran sesuai jadwal yang ditentukan.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full mx-auto mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Undian Pemenang
              </h3>
              <p className="text-gray-600">
                Sistem memilih pemenang secara acak dan transparan.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full mx-auto mb-4">
                <span className="text-xl font-bold">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Pencairan Dana
              </h3>
              <p className="text-gray-600">
                Pemenang menerima dana secara otomatis dari smart contract.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mt-24 bg-primary-600 rounded-2xl">
        <div className="px-6 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Statistik Platform
            </h2>
            <p className="mt-4 text-lg text-primary-100">
              Bergabunglah dengan ribuan pengguna yang sudah mempercayai Arisan on Chain
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">1,250+</div>
              <div className="mt-2 text-primary-100">Grup Arisan Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">15,000+</div>
              <div className="mt-2 text-primary-100">Anggota Terdaftar</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">₿ 2.5M+</div>
              <div className="mt-2 text-primary-100">Total Dana Dikelola</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-24 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Siap Memulai Arisan Anda?
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Bergabunglah dengan komunitas arisan terdesentralisasi terbesar di Indonesia
        </p>
        <div className="mt-8">
          <Link to="/create-arisan">
            <Button size="lg">
              Mulai Sekarang
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}