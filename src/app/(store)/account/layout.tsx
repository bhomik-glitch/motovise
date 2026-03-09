import { AccountLayout } from "@/modules/account/components/AccountLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
    return <AccountLayout>{children}</AccountLayout>;
}
