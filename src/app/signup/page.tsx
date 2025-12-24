'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Mail, Lock, User, Sparkles, ArrowLeft } from 'lucide-react';
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
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />

            <div className="w-full max-w-md relative z-10">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
                    <ArrowLeft size={20} />
                    Back to Home
                </Link>

                <Card variant="glass" padding="lg" className="border-white/10 shadow-2xl backdrop-blur-xl">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                            <Sparkles size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
                        <p className="text-slate-400">Start practicing interviews with AI</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
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
                            required
                        />

                        <Input
                            label="Email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={<Mail size={18} />}
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={<Lock size={18} />}
                            required
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            icon={<Lock size={18} />}
                            required
                        />

                        <Button type="submit" fullWidth loading={loading} size="lg">
                            Create Account
                        </Button>
                    </form>

                    <p className="text-center mt-8 text-slate-400">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:text-primary-hover font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                </Card>
            </div>
        </div>
    );
}
