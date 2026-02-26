import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
    title: 'E-commerce Store',
    description: 'Production-ready E-commerce platform',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="bg-black text-white antialiased">
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
