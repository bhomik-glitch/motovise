import { LoginForm } from "@/modules/account/components/LoginForm";

export default function LoginPage() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950/50">
            <LoginForm />
        </div>
    );
}
