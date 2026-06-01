import { Fredoka, Outfit, VT323 } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-cute",
  weight: ["300", "400", "500", "600", "700"]
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-standard",
  weight: ["300", "400", "500", "600", "700", "800"]
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata = {
  title: "Blocky Todo 🎀 cute + AI + blocky",
  description: "Aplikasi To-Do List otomatis bertema pink coquette dan block game game pixel yang lucu. Ketik/paste draf tugasmu dan parser lokal yang cerdas akan otomatis membaginya menjadi section-section checklist secara instan!",
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${fredoka.variable} ${outfit.variable} ${vt323.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
