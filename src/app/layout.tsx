import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

const montserrat = Montserrat({
    subsets: ['latin'],
    variable: '--font-montserrat',
    display: 'swap',
    weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
    title: 'Motovise — Precision Automotive Parts',
    description: 'Premium automotive parts and accessories. Precision engineered for drivers who want more.',
    openGraph: {
        title: 'Motovise — Precision Automotive Parts',
        description: 'Premium automotive parts and accessories. Precision engineered for drivers who want more.',
        url: 'https://motovise-pied.vercel.app',
        siteName: 'Motovise',
        images: [
            {
                url: 'https://motovise-pied.vercel.app/motovise-logo.png',
                width: 1200,
                height: 630,
                alt: 'Motovise — Precision Automotive Parts',
            },
        ],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Motovise — Precision Automotive Parts',
        description: 'Premium automotive parts and accessories. Precision engineered for drivers who want more.',
        images: ['https://motovise-pied.vercel.app/motovise-logo.png'],
    },
    verification: {
        google: 'YOUR_GOOGLE_CODE',
        other: {
            'msvalidate.01': 'YOUR_BING_CODE',
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${montserrat.variable} ${montserrat.className}`} suppressHydrationWarning>
            <body className={`${montserrat.className} antialiased min-h-screen bg-background`}>
                <QueryProvider>
                    <AuthProvider>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="light"
                            enableSystem={false}
                            disableTransitionOnChange
                        >
                            {children}
                        </ThemeProvider>
                    </AuthProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
