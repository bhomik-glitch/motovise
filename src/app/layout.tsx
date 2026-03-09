import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const dmSans = DM_Sans({
    subsets: ['latin'],
    variable: '--font-dm-sans',
    weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
    title: 'Motovise — Precision Automotive Parts',
    description: 'Premium automotive parts and accessories. Precision engineered for drivers who want more.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${dmSans.variable} font-sans antialiased bg-[#F8FAFC]`}>
                <QueryProvider>
                    <AuthProvider>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="light"
                            enableSystem={false}
                            disableTransitionOnChange
                        >
                            <div className="flex flex-col min-h-screen">
                                <Navbar />
                                <main className="flex-grow pt-24">
                                    {children}
                                </main>
                                <Footer />
                            </div>
                        </ThemeProvider>
                    </AuthProvider>
                </QueryProvider>
            </body>
        </html>
    );
}

