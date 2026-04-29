# KALKULATOR PRO — Proje Dökümanı
> Takım Kaptanı: Claude | Geliştirici: E. Okumus | Son güncelleme: 22.04.2026

---

## 🎯 Projenin Amacı
İnşaat/yüzey kaplama projelerinde maliyet hesaplama sürecini dijitalleştirmek.
Şu an Excel ile yapılan Vorkalkulation ve Rückkalkulation işlemlerini,
çoklu kullanıcı destekli, offline çalışabilen, güvenli bir web uygulamasına dönüştürmek.

**Referans Excel:** Kalkulation_-2_.xlsx (Ersatzneubau U-Bahn-Bwk. C Hamburg)

---

## 🏗️ Tech Stack & Gerekçeler

### Frontend
| Teknoloji | Versiyon | Neden? |
|---|---|---|
| Next.js | 14 (App Router) | SSR/CSR kontrolü, routing, API routes — hepsi bir arada |
| TypeScript | 5.x | Tip güvenliği — runtime hatalarını derleme zamanında yakalar |
| Tailwind CSS | 3.x | Utility-first, hızlı, tutarlı styling |
| Zustand | 4.x | Sade global state — Redux'tan çok daha az boilerplate |
| React Hook Form | 7.x | Performanslı form yönetimi, gereksiz re-render yok |
| Zod | 3.x | Runtime type validation — frontend ve backend'de aynı şema |
| TanStack Query | 5.x | Server state, cache, background sync |
| Dexie.js | 3.x | IndexedDB wrapper — offline-first veri katmanı |

### Backend & Altyapı
| Teknoloji | Neden? |
|---|---|
| Supabase | PostgreSQL + Auth + Realtime + RLS — managed, hızlı başlangıç |
| Prisma | ORM — tip güvenli sorgular, schema yönetimi |
| Next.js API Routes | BFF katmanı — Supabase'e direkt client erişimini engeller |
| Zod (backend) | Request validation — aynı şemalar frontend ile paylaşılır |

### PDF
| Teknoloji | Neden? |
|---|---|
| @react-pdf/renderer | React component'ten direkt PDF üretimi |

---

## 🔐 Güvenlik Mimarisi

### Neden Server/Client ayrımı kritik?
```
❌ YANLIŞ: Browser → Supabase (direkt)
   Supabase key browser'da görünür, RLS bypass riski var

✅ DOĞRU: Browser → Next.js API Route → Supabase
   Supabase service key sadece server'da, kullanıcı hiç göremez
```

### Validation Katmanları (3 savunma hattı)
```
1. Frontend (Zod + React Hook Form)
   → Kullanıcıya anlık geri bildirim, UX için
   → GÜVENİLİR DEĞİL tek başına (DevTools ile bypass edilebilir)

2. API Route / Server Action (Zod)
   → Her request sunucuda tekrar validate edilir
   → Frontend'i tamamen devre dışı bıraksalar bile engeller

3. PostgreSQL Constraints + RLS
   → Son savunma hattı
   → RLS: "Bu kullanıcı sadece kendi satırlarını görebilir/değiştirebilir"
   → Kod hatası olsa bile DB seviyesinde koruma var
```

### Row Level Security (RLS) Mantığı
```sql
-- Kullanıcı sadece kendi projelerini görebilir
CREATE POLICY "kullanici_kendi_projelerini_gorur" ON projekte
  FOR ALL USING (auth.uid()::text = created_by);
```

---

## 📴 Offline-First Mimarisi

### Neden önemli?
İnternet kesildiğinde veya yavaşladığında veri kaybı yaşanmaması için.
Kullanıcı bağlantı durumunu hiç fark etmemelidir.

### Akış
```
Kullanıcı veri girer
    ↓
1. Anında IndexedDB'ye yazar (Dexie) — senkron, hızlı
    ↓
2. TanStack Query arka planda Supabase'e sync eder
    ↓
İnternet varsa → hemen sync
İnternet yoksa → "pending" kuyruğuna alır
Bağlantı gelince → otomatik sync, kullanıcı fark etmez
```

---

## 🗄️ Veritabanı Şeması (Prisma)

```prisma
model User {
  id         String   @id
  email      String   @unique
  full_name  String?
  role       String   @default("user")
  created_at DateTime @default(now())
  @@map("users")
}

model Projekt {
  id           String   @id @default(uuid())
  name         String
  beschreibung String?
  status       String   @default("aktiv")
  created_by   String
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt
  @@map("projekte")
}

model Kalkulation {
  id          String   @id @default(uuid())
  projekt_id  String
  name        String
  datum       DateTime
  status      String   @default("entwurf")
  stundenlohn Decimal  @db.Decimal(10, 2)
  malnehmer   Decimal  @default(0.7) @db.Decimal(5, 2)
  created_by  String
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  @@map("kalkulationen")
}

model Position {
  id             String   @id @default(uuid())
  kalkulation_id String
  pos_nummer     Int
  title          String
  einheit        String?
  massen         Decimal? @db.Decimal(10, 2)
  sort_order     Int      @default(0)
  @@map("positionen")
}

model Unterposition {
  id             String  @id @default(uuid())
  position_id    String
  label          String
  einheit        String?
  min_je_einheit Decimal @default(0) @db.Decimal(10, 2)
  sort_order     Int     @default(0)
  @@map("unterpositionen")
}

model Werkstoff {
  id               String   @id @default(uuid())
  unterposition_id String
  name             String
  verbrauch        Decimal? @db.Decimal(10, 4)
  einkauf_preis    Decimal? @db.Decimal(10, 2)
  sort_order       Int      @default(0)
  @@map("werkstoffe")
}
```

---

## 📁 Klasör Yapısı

```
kalkulator-pro/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx              ✅ tamamlandı
│   │   └── register/page.tsx           ✅ tamamlandı
│   ├── (app)/
│   │   ├── dashboard/page.tsx          ✅ /projekte'ye redirect
│   │   └── projekte/
│   │       └── page.tsx                ✅ tamamlandı (CRUD)
│   ├── api/
│   │   ├── projekte/
│   │   │   ├── route.ts                ✅ GET, POST
│   │   │   └── [id]/route.ts           ✅ PUT, DELETE
│   │   └── kalkulationen/
│   │       ├── route.ts                ✅ GET, POST
│   │       └── [id]/route.ts           ✅ GET, PUT, DELETE
│   ├── providers.tsx                   ✅ TanStack Query provider
│   └── layout.tsx                      ✅ tamamlandı
│
├── components/
│   ├── ui/
│   │   ├── Modal.tsx                   ✅ tamamlandı
│   │   └── ProjektForm.tsx             ✅ tamamlandı
│   ├── layout/
│   ├── vorkalkulation/
│   └── rueckkalkulation/
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   ✅ tamamlandı
│   │   ├── server.ts                   ✅ tamamlandı
│   │   └── middleware.ts               ✅ tamamlandı
│   ├── db/
│   ├── sync/
│   ├── calculations/
│   ├── validations/
│   │   ├── auth.schema.ts              ✅ tamamlandı
│   │   ├── projekt.schema.ts           ✅ tamamlandı
│   │   ├── kalkulation.schema.ts       ✅ tamamlandı
│   │   └── position.schema.ts          ✅ tamamlandı
│   └── prisma.ts                       ✅ tamamlandı
│
├── hooks/
│   └── useProjekte.ts                  ✅ tamamlandı
│
├── stores/
├── types/
│   └── index.ts                        ✅ tamamlandı
├── prisma/
│   └── schema.prisma                   ✅ tamamlandı
└── middleware.ts                       ✅ tamamlandı
```

---

## 🔄 Server / Client Ayrımı

### Ne zaman Server Component?
- Veri çekme (fetch) işlemleri
- Auth kontrolü
- SEO gereken sayfalar
- Supabase/Prisma'ya direkt erişim

### Ne zaman Client Component?
- `"use client"` direktifi gerektirir
- useState, useEffect kullanan her şey
- Event handler'lar (onClick, onChange)
- Browser API'leri (localStorage, window)
- Zustand store erişimi

### Kural
```
Server'da başla, gerektiğinde client'a geç.
Client component'i mümkün olduğunca küçük tut.
```

---

## 🧹 Clean Code Prensipleri

1. **Single Responsibility** — Her fonksiyon/component tek iş yapar
2. **Zod şemaları tek yerde** — `lib/validations/` — her yerde import edilir
3. **Pure functions** — Hesaplama motoru yan etkisiz, test edilebilir
4. **Custom hooks** — Tekrar eden logic hook'a çıkarılır
5. **Type everything** — `any` yasak, her şeyin tipi var
6. **Error boundaries** — Her async işlemde hata yönetimi

---

## 📅 Geliştirme Roadmap

### Faz 1 — Altyapı ✅ TAMAMLANDI (22.04.2026)
- [x] Next.js 14 + TypeScript kurulum
- [x] Supabase proje + DB şeması (Prisma ile)
- [x] Supabase Auth (login/register sayfaları)
- [x] RLS politikaları (tüm tablolar)
- [x] Trigger: handle_new_user() → on_auth_user_created
- [x] Prisma client singleton (lib/prisma.ts)
- [x] Middleware (auth guard)
- [x] Klasör yapısı + base types
- [x] Zod validation şemaları (auth)

### Faz 2 — Çekirdek 🔄 DEVAM EDİYOR (22.04.2026)
- [x] TanStack Query kurulum + provider
- [x] Zod şemaları (projekt, kalkulation, position)
- [x] API routes (projekte + kalkulationen — GET, POST, PUT, DELETE)
- [x] useProjekte hook
- [x] Modal + ProjektForm UI componentleri
- [x] Proje listesi sayfası (tam CRUD çalışıyor)
- [ ] useKalkulation hook
- [ ] Kalkulation listesi + oluşturma sayfası
- [ ] Hesaplama motoru (pure TypeScript)

### Faz 3 — UI ⬜
- [ ] Figma tasarımı birebir implement
- [ ] Sidebar, Header, Footer componentleri
- [ ] Vorkalkulation tam akış
- [ ] Rückkalkulation tam akış
- [ ] Offline durum göstergesi

### Faz 4 — Tamamlama ⬜
- [ ] PDF export
- [ ] Dexie offline kurulum
- [ ] Offline sync motoru
- [ ] Error handling, loading states
- [ ] Production deploy (Vercel)

---

## 🗒️ Notlar & Kararlar

- ORM olarak Prisma kullanılıyor (Supabase query builder değil)
- Masaüstüne geçiş gerekirse: Tauri kullanılacak (Electron değil)
- Windows öncelikli platform
- Realtime işbirliği: Supabase Realtime (şimdilik "last write wins")
- PDF: @react-pdf/renderer
- Deploy: Vercel (web), Tauri installer (masaüstü)
- Mesajlar Almanca
- `created_by` alanı text tipinde — RLS'de `auth.uid()::text` ile karşılaştırılıyor
- Email confirmation kapalı (Auth → Sign In/Providers → Email)
- Yeni kullanıcı trigger: handle_new_user() → on_auth_user_created
- Supabase Project ID: pilgpggmlsvohsqfptnd
- Supabase URL: https://pilgpggmlsvohsqfptnd.supabase.co
- Tarayıcı çevirisi kapatılmalı (Never translate German)
- `app/api/projekte/[id]/route.ts` — köşeli parantezli klasör

## 🐛 Karşılaşılan Sorunlar & Çözümler

- **Zod 4 syntax değişikliği** — `invalid_type_error` → `error` oldu
- **RLS insert hatası** — register sırasında trigger ile çözüldü
- **API route 404** — projekte klasörü api/ dışındaydı, içine taşındı
- **Hydration uyarısı** — `lang="en"` → `lang="de"` yapıldı
- **Email rate limit** — Supabase free plan limiti, email confirmation kapatıldı
