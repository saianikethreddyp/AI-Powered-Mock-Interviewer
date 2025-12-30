import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-6 text-center">
            <div className="max-w-md space-y-4">
                <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-12">
                    <span className="text-4xl font-bold text-gray-300">404</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 font-heading">Page Not Found</h2>
                <p className="text-gray-500 text-lg">
                    This page is ghosting us. It might have been moved or doesn't exist.
                </p>
                <div className="pt-8">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20"
                    >
                        Back to Safety
                    </Link>
                </div>
            </div>
        </div>
    );
}
