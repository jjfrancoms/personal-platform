import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Personal Platform - Spatial Frosted Workstation",
  description: "Unified modular hub for files, 3D assets, multimedia pipelines, and personal projects.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} dark`}>
      <body className="antialiased min-h-screen text-slate-100 flex flex-col relative font-sans selection:bg-amber-500/30 selection:text-amber-200">
        
        {/* Cinematic Ambient Depth Background */}
        <div className="fixed inset-0 -z-50 overflow-hidden bg-[#070b14]">
          {/* Warm Amber Glowing Light Source (like in reference image 1 & 2) */}
          <div className="absolute top-[5%] right-[20%] w-[45vw] h-[45vw] rounded-full bg-amber-500/15 blur-[140px] pointer-events-none" />
          
          {/* Deep Indigo/Violet Room Light */}
          <div className="absolute bottom-[10%] left-[10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/15 blur-[160px] pointer-events-none" />
          
          {/* Cyber Cyan Accent Flare */}
          <div className="absolute top-[35%] left-[30%] w-[35vw] h-[35vw] rounded-full bg-cyan-600/10 blur-[150px] pointer-events-none" />
          
          {/* Subtle Orange Rim Highlights */}
          <div className="absolute top-[-5%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-orange-600/12 blur-[130px] pointer-events-none" />
          
          {/* Geometric Radial Mesh Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />
        </div>

        {children}
      </body>
    </html>
  );
}
