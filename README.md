# LesKoding Bali — Landing Page

Dokumentasi teknis landing page LesKoding Academy Bali. Informasi bisnis (program, kurikulum, kebijakan, FAQ) ada di [`KNOWLEDGE_BASE.md`](KNOWLEDGE_BASE.md).

## Struktur File

| File | Isi |
|---|---|
| `index.html` | Markup seluruh halaman (teks default Bahasa Indonesia) + konfigurasi Tailwind |
| `app.js` | Interaksi, data kurikulum (modal silabus), mini-game, kuis, form WhatsApp, kamus i18n (EN & ID) |
| `style.css` | Style kustom di luar Tailwind |
| `assets/` | Logo, logo mitra, foto sesi, ikon tools |

## Tech Stack

- **Markup:** HTML5 semantik
- **Styling:** Tailwind CSS (CDN v3) + `style.css`
- **Tipografi (Google Fonts):** *Plus Jakarta Sans* (heading & body), *Fira Code* (monospace), *Outfit* (angka & aksen)
- **Ikon:** FontAwesome 6 (CDN)
- **Animasi:** GSAP 3.12.5 + ScrollTrigger, Canvas Confetti
- **Audio:** Web Audio API (oscillator, tanpa file audio eksternal)

## Brand Tokens

| Token | Nilai | Penggunaan |
|---|---|---|
| `brand.yellow` / `gold.400` | `#FFC83D` | Aksen utama, tombol CTA |
| `brand.blue` / `brand.500` | `#0788F5` | Identitas teknologi, navigasi |
| `brand.red` / `redBrand.500` | `#F3261D` / `#F87171` | Aksen perhatian, error, lencana |
| `brand.purple` / `purpleBrand.500` | `#5B0CB5` | Aksen kreativitas |
| `action.blue` / `action.hover` | `#004E98` / `#003d77` | Tombol sekunder |
| `dark.950` / `dark.900` / `surface` | `#0B0F19` / `#0F172A` / `#1E293B` | Latar gelap |

## Fitur Interaktif

1. **i18n dwibahasa (EN/ID):** ganti bahasa tanpa reload. Elemen ber-atribut `data-i18n` diisi dari kamus di `app.js` (via `innerHTML`). Pilihan disimpan di `localStorage` (`leskoding_lang`); **default `en`**. Teks default di `index.html` berbahasa Indonesia, jadi setiap teks baru harus ditambahkan ke **kedua** kamus.
2. **Web Audio synthesizer:** efek suara shoot, hit, win, dan klik.
3. **Mini-game Bug Smasher:** game canvas; skor 1.000 poin (`WIN_SCORE`) memunculkan modal selebrasi dengan confetti dan ajakan mencoba Free Trial Class (tombol mengarah ke `#register`). Tidak ada kode voucher.
4. **Kuis penentu minat (3 langkah):** merekomendasikan jalur Roblox, Scratch, atau Web Development.
5. **Distance Checker:** **simulasi/mock** (`calculateDistance` di `app.js`), bukan perhitungan jarak sungguhan.
6. **Modal detail silabus:** tombol "Lihat Detail Kurikulum" di setiap kartu program membuka modal berisi tools, deskripsi, kompetensi, topik silabus, dan catatan sertifikat kelulusan.
7. **Dropdown Learning Center kustom:** kartu cabang yang ramah sentuhan.
8. **Form pendaftaran → WhatsApp:** pesan dikirim ke admin sesuai cabang:
   - Pilihan Private / Home Visit → `6285792736627`
   - Gianyar / Bedulu → `628518306798`

## Aturan Konten (wajib konsisten dengan KB)

- Rasio tutor: **1:5** (1 tutor maks. 5 siswa).
- Usia: **Kids 6–14**, **Teens 11–17**, seluruh program **6–17**.
- Sertifikat kelulusan diberikan setelah siswa menyelesaikan course.
- Biaya tidak dicantumkan; diinformasikan admin setelah pendaftaran. Jadwal berdasarkan kesepakatan.
- Jangan pakai klaim tanpa bukti ("#1", "terakreditasi", "terbukti", persentase siswa).

## Menjalankan Lokal

Situs statis; buka `index.html` langsung atau jalankan server sederhana:

```bash
python3 -m http.server 8000
```
