import HeroScrollCanvas from '@/components/HeroScrollCanvas';

export default function Home() {
    return (
        <main className="bg-white text-black min-h-screen">
            <HeroScrollCanvas />

            <section className="h-screen bg-white">
                <div className="flex items-center justify-center h-full">
                    <h1 className="text-4xl font-semibold">
                        Next Section
                    </h1>
                </div>
            </section>
        </main>
    );
}
