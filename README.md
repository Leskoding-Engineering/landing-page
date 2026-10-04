# LesKoding Bali — Landing Page

Dokumentasi teknis landing page LesKoding Academy Bali. Informasi bisnis (program, kurikulum, kebijakan, FAQ) ada di [`KNOWLEDGE_BASE.md`](KNOWLEDGE_BASE.md).

## Struktur File

| File | Isi |
|---|---|
| `index.html` | Markup seluruh halaman (teks default Bahasa Indonesia) + konfigurasi Tailwind |
| `app.js` | Interaksi, data kurikulum (modal silabus), mini-game, kuis, form WhatsApp, kamus i18n (EN & ID) |
| `style.css` | Style kustom di luar Tailwind |
| `landing-data.js` | Mengambil konten dari admin panel (`GET /api/landing`) lalu menimpa section terkait |
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
8. **Form pendaftaran → WhatsApp:** semua pilihan lokasi dikirim ke satu nomor admin (default `6285183046798`, LesKoding Official; bisa diubah di admin panel → Landing Page → Contact & Social).

## Konten dari Admin Panel

Partner, Program Belajar, Kisah Sukses, Lokasi, FAQ, nomor WhatsApp, Promo, dan link sosial media diatur di admin panel (menu **Landing Page**).

Alur: admin mengedit konten → klik **Publish** → admin panel meng-commit `landing-content.json` ke repo ini lewat GitHub API → GitHub Pages deploy ulang (±1–2 menit) → `landing-data.js` membaca `landing-content.json` saat halaman dimuat.

- **Jangan edit `landing-content.json` manual**; isinya akan ditimpa pada publish berikutnya.
- Konten statis di `index.html` / `app.js` hanya menjadi **fallback** bila `landing-content.json` belum ada atau gagal dimuat (termasuk saat `index.html` dibuka via `file://` — jalankan server lokal).
- Bila file termuat tetapi daftar sebuah section kosong (partner, program, kisah sukses, lokasi, FAQ), section itu menampilkan **empty state "Segera Hadir"**. Copy-nya ada di kamus i18n (`empty_*`). Saat lokasi kosong, formulir pendaftaran menampilkan satu pilihan "Diskusikan dengan admin".
- Promo: bila tidak ada promo aktif saat publish, bar promo, pil, dan section `#promo` disembunyikan.
- Gambar (logo partner, foto karya) tetap di-host admin panel (`/storage/landing/...`).
- Konten dari admin hanya berbahasa Indonesia; label/judul statis tetap mengikuti toggle EN/ID.
- Program Belajar diambil dari Curriculum Course (Lesson Plan) yang **Published** dan punya **Track**; peta jalur & "langkah berikutnya" dihitung otomatis dari jalur dan urutan program.

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
