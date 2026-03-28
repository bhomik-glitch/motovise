export default function StoreLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <main className="pt-[100px]">{children}</main>;
}
