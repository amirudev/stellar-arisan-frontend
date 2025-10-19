import { z } from 'zod';

// Stellar address validation
const stellarAddressRegex = /^G[A-Z0-9]{55}$/;

export const createArisanSchema = z.object({
  name: z.string()
    .min(1, 'Nama grup arisan harus diisi')
    .max(100, 'Nama grup arisan maksimal 100 karakter'),
  
  roundCount: z.number()
    .min(2, 'Minimal 2 putaran')
    .max(100, 'Maksimal 100 putaran'),
  
  dueAmount: z.number()
    .min(1000, 'Minimal iuran Rp 1.000')
    .max(10000000, 'Maksimal iuran Rp 10.000.000'),
  
  members: z.array(z.object({
    address: z.string().regex(stellarAddressRegex, 'Alamat Stellar tidak valid'),
    name: z.string().min(1, 'Nama anggota harus diisi'),
  }))
    .min(2, 'Minimal 2 anggota')
    .max(20, 'Maksimal 20 anggota'),
});

export const joinArisanSchema = z.object({
  inviteCode: z.string()
    .min(1, 'Kode undangan harus diisi')
    .max(50, 'Kode undangan tidak valid'),
});

export const payDueSchema = z.object({
  arisanId: z.string().min(1, 'ID arisan harus diisi'),
  round: z.number().min(1, 'Nomor putaran harus diisi'),
  amount: z.number().min(1, 'Jumlah pembayaran harus diisi'),
});

export const drawWinnerSchema = z.object({
  arisanId: z.string().min(1, 'ID arisan harus diisi'),
  round: z.number().min(1, 'Nomor putaran harus diisi'),
});

export const releaseToWinnerSchema = z.object({
  arisanId: z.string().min(1, 'ID arisan harus diisi'),
  round: z.number().min(1, 'Nomor putaran harus diisi'),
});

export type CreateArisanInput = z.infer<typeof createArisanSchema>;
export type JoinArisanInput = z.infer<typeof joinArisanSchema>;
export type PayDueInput = z.infer<typeof payDueSchema>;
export type DrawWinnerInput = z.infer<typeof drawWinnerSchema>;
export type ReleaseToWinnerInput = z.infer<typeof releaseToWinnerSchema>;
