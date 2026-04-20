import "@/app/globals.css";
import { RegisterForm } from "@/modules/account/components/RegisterForm";

export default function RegisterPage() {
    return (
        <main className="min-h-screen flex items-center justify-center px-4 pt-24 relative overflow-hidden">

            <div className="absolute inset-0 -z-10">
                <div className="w-full h-full bg-[url('/images/Form-bg-content.png')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-black/30" />
            </div>

            <RegisterForm />

        </main>
    );
}

