"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { clearApiSessionCache } from "@/lib/api-client"

const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
})

type FormData = z.infer<typeof loginSchema>

export function LoginForm() {
    const router = useRouter()
    const [showPassword, setShowPassword] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)
        setError(null)

        try {
            // POST /auth/login is typically handled by NextAuth credentials provider
            const result = await signIn("credentials", {
                redirect: false,
                email: data.email,
                password: data.password,
            })

            if (result?.error) {
                setError("Invalid email or password")
                return
            }

            // Bust cached token so the next API call picks up the fresh JWT
            clearApiSessionCache();

            // Fetch session to check role
            const session = await getSession();

            if (session?.user?.role === "ADMIN") {
                router.push("/admin/dashboard");
            } else {
                router.push("/account");
            }

            router.refresh()
        } catch (err) {
            setError("An unexpected error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md mx-auto relative z-10"
        >
            {/* Card — premium POUCH style glassmorphism */}
            <div className="max-w-md w-full mx-auto bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-2xl shadow-2xl">
                <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">Welcome back</h2>
                <p className="text-sm text-white/70 mb-6">
                    Enter your credentials to access your account
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
                            {error}
                        </div>
                    )}

                    <div>
                        <label 
                            htmlFor="email" 
                            className={`block mb-1 text-xs tracking-wider uppercase ${errors.email ? "text-red-400" : "text-white/60"}`}
                        >
                            Email Address
                        </label>
                        <input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                            {...register("email")}
                            className={`w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all ${errors.email ? "border-red-500/50" : ""}`}
                        />
                        {errors.email && (
                            <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label 
                                htmlFor="password" 
                                className={`block text-xs tracking-wider uppercase ${errors.password ? "text-red-400" : "text-white/60"}`}
                            >
                                Password
                            </label>
                            <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                                Forgot password?
                            </a>
                        </div>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                disabled={isLoading}
                                {...register("password")}
                                className={`w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 pr-10 transition-all ${errors.password ? "border-red-500/50" : ""}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition transform active:scale-[0.98] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Sign In
                    </button>
                </form>

                <div className="text-center mt-8 pt-6 border-t border-white/10">
                    <p className="text-sm text-white/50">
                        Don&apos;t have an account?{" "}
                        <a href="/register" className="font-semibold text-white hover:underline transition-all">
                            Sign up
                        </a>
                    </p>
                </div>
            </div>
        </motion.div>
    )
}
