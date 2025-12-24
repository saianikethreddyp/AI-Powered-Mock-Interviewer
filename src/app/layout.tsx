import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: "AI Mock Interview | Practice Interviews with AI",
  description: "Practice job interviews with our AI-powered voice interviewer. Get real-time feedback and comprehensive analysis to improve your interview skills.",
  keywords: ["interview prep", "AI interview", "mock interview", "job interview practice", "interview coach"],
  authors: [{ name: "AI Mock Interview" }],
  openGraph: {
    title: "AI Mock Interview",
    description: "Practice job interviews with AI-powered voice technology",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
