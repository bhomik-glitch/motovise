import "@/app/globals.css";
import { LoginForm } from "@/modules/account/components/LoginForm";

export default function LoginPage() {
    return (
        <main className="min-h-screen flex items-center justify-center px-4 pt-24 relative overflow-hidden">

            <div className="absolute inset-0 -z-10">
                <div className="w-full h-full bg-[url('/images/form-bg-content.png')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-black/30" />
            </div>

            <LoginForm />

        </main>
    );
}
