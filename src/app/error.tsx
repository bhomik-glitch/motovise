"use client"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-10 text-center">
            <h2 className="text-xl font-semibold mb-4">
                Something went wrong
            </h2>

            <button
                onClick={() => reset()}
                className="mt-4 rounded bg-black px-6 py-2 text-white hover:bg-gray-800 transition-colors"
            >
                Try again
            </button>
        </div>
    )
}
