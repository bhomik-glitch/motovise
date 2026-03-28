import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Call backend NestJS API
        // BACKEND_URL is server-side only — never exposed to the browser.
        const backendUrl = process.env.BACKEND_URL;
        if (!backendUrl) {
            return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
        }

        try {
            const backendResponse = await axios.post(`${backendUrl}/v1/auth/register`, {
                name,
                email,
                password,
                // Add any other required fields for backend register
            });

            // Backend return { success: true, data: { user, message } } via TransformInterceptor
            // or { message, user } directly if not intercepted.
            // Let's assume standard response based on our audit.
            const result = backendResponse.data.data || backendResponse.data;

            return NextResponse.json(
                {
                    user: result.user,
                    message: "User registered successfully",
                },
                { status: 201 }
            );
        } catch (axiosError: any) {
            console.error("Backend registration error:", axiosError.response?.data || axiosError.message);
            const status = axiosError.response?.status || 500;
            const message = axiosError.response?.data?.message || "Registration failed on backend";
            return NextResponse.json({ error: message }, { status });
        }
    } catch (error) {
        console.error("Registration route error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
