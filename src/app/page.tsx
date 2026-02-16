export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">E-commerce Store</h1>
                <p className="text-xl text-muted-foreground mb-8">
                    Production-ready platform coming soon...
                </p>
                <div className="flex gap-4 justify-center">
                    <a
                        href="/admin"
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
                    >
                        Admin Dashboard
                    </a>
                    <a
                        href="/products"
                        className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition"
                    >
                        Browse Products
                    </a>
                </div>
            </div>
        </main>
    );
}
