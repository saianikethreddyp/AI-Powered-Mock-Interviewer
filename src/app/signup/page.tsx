'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Mail, Lock, User, Sparkles, ArrowLeft, AlertCircle } from 'lucide-react';

export default function SignupPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const { error } = await signUp(email, password, fullName);
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
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2 font-heading">Create Account</h1>
                    <p className="text-neutral-500">Start your journey to interview mastery</p>
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
                            label="Full Name"
                            type="text"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            icon={<User size={18} />}
                            variant="light"
                            required
                        />

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

                        <Input
                            label="Password"
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={<Lock size={18} />}
                            variant="light"
                            required
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            icon={<Lock size={18} />}
                            variant="light"
                            required
                        />

                        <Button type="submit" fullWidth loading={loading} size="lg" className="shadow-lg shadow-primary/20">
                            Create Account
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
                        <p className="text-neutral-500 text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary hover:text-primary-600 font-semibold transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
