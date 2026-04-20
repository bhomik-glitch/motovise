import { FloatingNavbar } from '@/components/FloatingNavbar';
import { Footer } from '@/components/Footer';
import { AnnouncementBars } from '@/components/AnnouncementBars';
import { CartSheet } from '@/components/CartSheet';
import { landingContent } from '@/data/landingContent';

export default function StorefrontLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen flex flex-col">
            <AnnouncementBars announcements={landingContent.announcements} />
            <FloatingNavbar />
            <CartSheet />
            <main className="flex-1 w-full">
                {children}
            </main>
            <Footer {...landingContent.footer} />
        </div>
    );
}
