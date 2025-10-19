# Arisan on Chain Frontend

Frontend untuk aplikasi Arisan on Chain - platform arisan terdesentralisasi yang dibangun di atas Stellar Soroban. Aplikasi ini menyediakan antarmuka yang user-friendly untuk mengelola grup arisan dengan transparansi dan keamanan blockchain.

## 🚀 Fitur Utama

- **Dashboard Pengguna**: Monitor semua grup arisan dan aktivitas terbaru
- **Pembuatan Grup Arisan**: Buat grup arisan baru dengan validasi form yang lengkap
- **Integrasi Wallet**: Koneksi dengan Freighter Wallet untuk transaksi blockchain
- **Transparansi Penuh**: Semua transaksi tercatat di blockchain Stellar
- **UI/UX Modern**: Desain responsif dengan Tailwind CSS
- **Bahasa Indonesia**: Interface dalam bahasa Indonesia untuk kemudahan penggunaan

## 🛠️ Teknologi yang Digunakan

- **Framework**: React Router v7 (Remix)
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Forms**: React Hook Form + Zod validation
- **Notifications**: React Hot Toast
- **Blockchain**: Stellar Soroban SDK
- **Wallet**: Freighter Wallet integration
- **Language**: TypeScript

## 📋 Prasyarat

- Node.js 18.0.0 atau lebih baru
- npm atau yarn
- Freighter Wallet (untuk interaksi dengan blockchain)

## 🚀 Instalasi

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd arisan-oc-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file dengan konfigurasi yang sesuai:
   ```
   VITE_CONTRACT_ID=CDENCFFQ3RYFQCATEX3QS3ZL2UXO6MTH5SWPQTGMRXDIYQRRRI2KQXDR
   VITE_WASM_HASH=ccaf3dec63860b3944a11e5c27ce420729dfeed597f0c864af7b225a441e3bf0
   VITE_NETWORK=TESTNET
   VITE_RPC_URL=https://soroban-testnet.stellar.org:443
   ```

4. **Jalankan development server**
   ```bash
   npm run dev
   ```

5. **Buka browser**
   ```
   http://localhost:5173
   ```

## 📁 Struktur Proyek

```
app/
├── components/           # Komponen React yang dapat digunakan kembali
│   ├── ui/              # Komponen UI dasar (Button, Card, Input, dll)
│   ├── wallet/          # Komponen terkait wallet
│   └── layout/          # Komponen layout (Header, Layout)
├── lib/                 # Utilities dan konfigurasi
│   ├── soroban.ts       # Konfigurasi Soroban client
│   ├── wallet.ts        # Service wallet integration
│   └── validations.ts   # Schema validasi dengan Zod
├── routes/              # Halaman aplikasi
│   ├── home.tsx         # Landing page
│   ├── dashboard.tsx    # Dashboard pengguna
│   └── create-arisan.tsx # Halaman pembuatan arisan
└── styles/              # File CSS global
```

## 🎨 Design System

### Warna
- **Primary**: Stellar blue (#7C3AED)
- **Secondary**: Indonesian red (#DC2626)
- **Success**: Green (#10B981)
- **Warning**: Orange (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- **Font Family**: Inter
- **Responsive**: Mobile-first approach

## 🔗 Integrasi Smart Contract

Aplikasi ini terintegrasi dengan smart contract Arisan on Chain dengan:

- **Contract ID**: `CDENCFFQ3RYFQCATEX3QS3ZL2UXO6MTH5SWPQTGMRXDIYQRRRI2KQXDR`
- **Network**: Stellar Testnet
- **WASM Hash**: `ccaf3dec63860b3944a11e5c27ce420729dfeed597f0c864af7b225a441e3bf0`

### Fungsi Contract yang Tersedia
- `init(owner, members, round_count, due_amount)` - Inisialisasi arisan
- `pay_due(arisan_id, round, amount)` - Pencatatan pembayaran
- `draw_winner(arisan_id, round, seed)` - Pemilihan pemenang
- `release_to_winner(arisan_id, round)` - Pelepasan dana ke pemenang
- `get_arisan(arisan_id)` - Mengambil data arisan
- `get_payment_status(arisan_id, round)` - Status pembayaran
- `get_winner(arisan_id, round)` - Data pemenang
- `get_arisan_count()` - Jumlah total arisan

## 📱 Halaman Aplikasi

### 1. Landing Page (`/`)
- Hero section dengan penjelasan aplikasi
- Fitur-fitur utama
- Cara kerja aplikasi
- Statistik platform
- Call-to-action

### 2. Dashboard (`/dashboard`)
- Statistik pengguna
- Daftar grup arisan
- Aktivitas terbaru
- Quick actions

### 3. Create Arisan (`/create-arisan`)
- Form pembuatan grup arisan
- Validasi input dengan Zod
- Preview ringkasan grup
- Informasi penting

## 🔐 Keamanan

- Validasi input di frontend dan backend
- Integrasi wallet yang aman
- Tidak ada penyimpanan private key
- HTTPS only di production
- Content Security Policy

## 🌐 Lokalisasi

Aplikasi mendukung bahasa Indonesia sebagai bahasa utama dengan:
- Interface dalam bahasa Indonesia
- Format mata uang IDR
- Format tanggal lokal
- Pesan error yang user-friendly

## 🚀 Deployment

### Build untuk Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run start
```

### Deploy ke Vercel
```bash
npm install -g vercel
vercel
```

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit perubahan (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📄 Lisensi

Proyek ini dilisensikan di bawah MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## 🆘 Support

Jika Anda mengalami masalah atau memiliki pertanyaan:

1. Periksa [Issues](https://github.com/your-repo/issues) yang sudah ada
2. Buat issue baru jika masalah belum pernah dilaporkan
3. Hubungi tim development

## 🔮 Roadmap

- [ ] Dark mode toggle
- [ ] Push notifications
- [ ] Export riwayat transaksi
- [ ] Social sharing
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app (React Native)

---

**Dibuat dengan ❤️ untuk komunitas arisan Indonesia**"# stellar-arisan-frontend" 
