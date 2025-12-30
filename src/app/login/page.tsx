'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Mail, Lock, Sparkles, ArrowLeft, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await signIn(email, password);
            if (error) {
                setError(error.message);
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-8 font-medium text-sm"
                >
                    <ArrowLeft size={18} />
                    Back to Home
                </Link>

                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-xl mb-6 shadow-lg shadow-primary/20">
                        <Sparkles size={24} className="text-white" />
                    </Link>
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2 font-heading">Welcome Back</h1>
                    <p className="text-neutral-500">Sign in to continue your interview practice</p>
                </div>

                <Card variant="default" padding="xl" className="shadow-xl shadow-neutral-200/50">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 rounded-xl bg-danger-light border border-danger/20 text-danger text-sm flex items-start gap-3">
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                {error}
                            </div>
                        )}

                        <Input
                            label="Email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={<Mail size={18} />}
                            variant="light"
                            required
                        />

                        <div className="space-y-1">
                            <Input
                                label="Password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                icon={<Lock size={18} />}
                                variant="light"
                                required
                            />
                            <div className="flex justify-end">
                                <Link
                                    href="#"
                                    className="text-xs font-medium text-primary hover:text-primary-600 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <Button type="submit" fullWidth loading={loading} size="lg" className="shadow-lg shadow-primary/20">
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
                        <p className="text-neutral-500 text-sm">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="text-primary hover:text-primary-600 font-semibold transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
