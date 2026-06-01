# 🎀 Blocky Todo 👾
### *cute ✦ offline-first ✦ smart local AI parser*

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-pink?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS-Vanilla-brown?style=for-the-badge&logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/Zero--API-Secure-mint?style=for-the-badge" />
</p>

Selamat datang di **Blocky Todo**! 🎀 Aplikasi to-do list premium yang memadukan estetika super imut ala **Pink Coquette** (sakura, stroberi, pita, dan hati) dengan tata letak retro ala **Blocky Game Pixel (3D Chunky Borders)**. 

Aplikasi ini didesain secara khusus untuk memudahkan siapa saja—mulai dari pelajar, akademisi, hingga pekerja kreatif—dalam mengurai draf catatan yang panjang atau berantakan (seperti laporan ulasan reviewer jurnal, pesan WhatsApp, atau draf coretan tugas) menjadi daftar tugas interaktif yang rapi hanya dalam hitungan detik secara otomatis dan privat!

---

## 🌸 Fitur Utama (Features)

*   **Smart Local Parser (Zero-API First)**: Algoritma cerdas berbasis regex yang berjalan langsung di browser Anda untuk mengurai teks acak menjadi judul section (secara otomatis mengenali akhiran `:`, format bold `**`, atau siku `[]`) dan baris tugas, tanpa mengirim data Anda ke server mana pun (100% aman dan privat!).
*   **Dual AI Workflow Helper**: Dilengkapi panel **System Prompt AI** di bawah kartu input. Jika catatan Anda luar biasa berantakan, Anda bisa menyalin prompt kustom kami untuk ditempel ke LLM eksternal (ChatGPT/Gemini) agar dirapikan menjadi format ramah-parser kami dalam satu klik.
*   **Delightful Gamified Feedback**: Setiap kali Anda mencentang checkbox hati `♡` hingga berubah menjadi `💖`, letusan partikel bintang/hati (*sparkle burst emitter*) akan muncul sebagai reward menyenangkan, menambah XP bar kemajuan proyek Anda!
*   **Aesthetic Responsive Interface**: Desain visual ultra-premium dengan efek timbul 3D retro dan transisi lembut yang dioptimalkan dengan sempurna untuk laptop, tablet, maupun layar handphone.
*   **State Persistence (LocalStorage)**: Secara otomatis menyimpan daftar proyek, section, dan status tugas di komputer/browser Anda sehingga tidak perlu login atau koneksi internet.

---

## 🛠️ Panduan Teknologi (Tech Stack)

Aplikasi dibangun menggunakan teknologi modern berstandar industri:
*   **Core**: [Next.js](https://nextjs.org/) (App Router) & [React 19](https://react.dev/).
*   **Styling**: Pure CSS3 Modules (Vanilla CSS) untuk kontrol transisi, keyframes, dan pixel-perfect layout tanpa dependensi berat.
*   **Fonts**: `Fredoka` (untuk tulisan imut), `Outfit` (untuk teks profesional), dan `VT323` (untuk dekorasi retro pixel) yang dimuat menggunakan optimasi Next.js Google Fonts.
*   **Build Tool**: Turbopack compiler bawaan Next.js untuk waktu muat lokal yang super cepat.

---

## 🚀 Cara Menjalankan Secara Lokal (Local Setup)

Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) di komputer Anda, lalu ikuti langkah-langkah di bawah ini:

1.  **Clone Repositori**:
    ```bash
    git clone https://github.com/anindyawita/Blocky-To-Do.git
    cd Blocky-To-Do
    ```

2.  **Instal Dependensi**:
    ```bash
    npm install
    ```

3.  **Jalankan Server Pengembangan**:
    ```bash
    npm run dev
    ```
    Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk menikmati aplikasinya! 🎀

4.  **Membuat Build Produksi**:
    ```bash
    npm run build
    ```

---

## 🍓 Aturan Format Smart Parser

Ingin draf catatan Anda terurai sempurna? Cukup tulis dengan pola sederhana berikut di dalam textarea:

```text
[Nama Section Baru 1]:
- Tugas pertama (awali dengan minus dan spasi)
- Tugas kedua diawali dengan kata kerja

**Nama Section Baru 2**
1. Tugas ketiga (menggunakan angka juga bisa!)
2. Tugas keempat yang sangat mendesak
```

*Parser cerdas kami akan otomatis mengabaikan metadata ulasan paper akademis (seperti rating atau angka skor evaluasi) untuk memastikan daftar tugas Anda tetap bersih dan berorientasi aksi.*

---

## 🧁 Kontribusi & Lisensi

Dibuat dengan cinta (dan banyak stroberi 🍓) oleh senior UI/UX designer & software engineer. Hubungi kami jika Anda ingin menambahkan tema pastel lainnya atau meningkatkan performa parser lokal!

*Lisensi: Open Source untuk semua pecinta estetika pink coquette dan kerapihan catatan.* 💖
