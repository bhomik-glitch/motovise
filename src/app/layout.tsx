import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { FloatingNavbar } from '@/components/FloatingNavbar';
import { Footer } from '@/components/Footer';
import { AnnouncementBars } from '@/components/AnnouncementBars';
import { CartSheet } from '@/components/CartSheet';
import { landingContent } from '@/data/landingContent';

const montserrat = Montserrat({
    subsets: ['latin'],
    variable: '--font-montserrat',
    weight: ['300', '400', '500', '600', '700', '800'],
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
        <html lang="en" className={montserrat.variable} suppressHydrationWarning>
            <body className={`${montserrat.className} font-sans antialiased min-h-screen bg-background`}>
                <QueryProvider>
                    <AuthProvider>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="light"
                            enableSystem={false}
                            disableTransitionOnChange
                        >
                            <div className="min-h-screen flex flex-col">
                                <AnnouncementBars announcements={landingContent.announcements} />
                                <FloatingNavbar />
                                <CartSheet />
                                <main className="flex-1 w-full">
                                    {children}
                                </main>
                                <Footer {...landingContent.footer} />
                            </div>
                        </ThemeProvider>
                    </AuthProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
