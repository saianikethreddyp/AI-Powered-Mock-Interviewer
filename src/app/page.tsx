'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Mic, Brain, BarChart3, Sparkles, CheckCircle, ArrowRight, Play, Users, Target, Zap } from 'lucide-react';
import styles from './page.module.css';

export default function HomePage() {
  const { user, loading } = useAuth();

  const features = [
    { icon: <Mic size={32} />, title: 'Voice-Based Interviews', description: 'Practice with natural voice conversations. Our AI listens and responds just like a real interviewer.' },
    { icon: <Brain size={32} />, title: 'AI-Powered Questions', description: 'Dynamic questions tailored to your job role, experience, and resume using Google Gemini AI.' },
    { icon: <BarChart3 size={32} />, title: 'Comprehensive Analysis', description: 'Get detailed feedback on communication, technical skills, confidence, and more.' },
    { icon: <Sparkles size={32} />, title: 'Personalized Tips', description: 'Receive actionable advice to improve your interview performance.' },
  ];

  const stats = [
    { value: '10K+', label: 'Interviews Completed' },
    { value: '95%', label: 'Success Rate' },
    { value: '4.9/5', label: 'User Rating' },
  ];

  const steps = [
    { step: 1, title: 'Set Up', description: 'Enter job details and upload your resume' },
    { step: 2, title: 'Practice', description: 'Have a voice conversation with our AI interviewer' },
    { step: 3, title: 'Analyze', description: 'Review your performance and improvement areas' },
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-dark-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-heading font-bold text-2xl tracking-tight hover:opacity-90 transition-opacity">
            <Sparkles className="text-primary" />
            <span>InterviewAI</span>
          </Link>
          <div className="flex items-center gap-4">
            {loading ? null : user ? (
              <Link href="/dashboard">
                <Button variant="primary" className="shadow-lg shadow-primary/20">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" className="text-slate-300 hover:text-white">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" className="shadow-lg shadow-primary/20">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="animate-enter">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
              <Zap size={14} />
              <span>AI-Powered Interview Practice</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold font-heading leading-[1.1] mb-6 tracking-tight">
              Master Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500">Interview</span>
            </h1>

            <p className="text-xl text-slate-400 mb-10 max-w-lg leading-relaxed">
              Practice with our AI interviewer using voice technology. Get real-time feedback,
              comprehensive analysis, and personalized tips to land your dream job.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link href="/signup">
                <Button size="lg" variant="primary" className="w-full sm:w-auto text-lg px-8 h-14 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-1">
                  Start Practicing Free
                  <ArrowRight size={20} />
                </Button>
              </Link>
              <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 h-14 bg-white/5 border-white/10 hover:bg-white/10">
                <Play size={20} />
                Watch Demo
              </Button>
            </div>

            <div className="flex gap-12 pt-8 border-t border-white/5">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-float hidden lg:block">
            <div className="glass-card rounded-3xl overflow-hidden shadow-2xl border-white/10 ring-1 ring-white/5">
              <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-widest">Live Session</div>
              </div>

              <div className="p-8 space-y-6 bg-dark-800/50">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">AI</div>
                  <div className="p-4 rounded-2xl bg-indigo-500/10 text-slate-200 text-lg border border-indigo-500/20 rounded-tl-none max-w-[80%]">
                    Tell me about a challenging project you worked on and how you overcame obstacles.
                  </div>
                </div>

                <div className="flex items-start gap-4 flex-row-reverse">
                  <div className="w-10 h-10 rounded-xl bg-slate-700/50 text-slate-300 flex items-center justify-center font-bold text-sm">You</div>
                  <div className="p-4 rounded-2xl bg-white/5 text-slate-300 text-lg border border-white/10 rounded-tr-none max-w-[80%] text-right">
                    In my last role, I led a team to migrate our legacy system to a microservices architecture...
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-emerald-400 text-sm font-medium bg-emerald-500/10 py-2 rounded-lg border border-emerald-500/20">
                  <BarChart3 size={16} />
                  <span>Real-time Confidence Analysis: 92%</span>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-500/30 blur-2xl rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/30 blur-2xl rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Why Choose <span className="text-gradient">InterviewAI</span></h2>
            <p className="text-lg text-slate-400">Everything you need to master your interview skills and boost your confidence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="glass-card p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-6 ring-1 ring-white/10">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-dark-bg/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -skew-y-3 transform origin-top-left scale-110" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">How It <span className="text-gradient">Works</span></h2>
            <p className="text-lg text-slate-400">Three simple steps to your dream job</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />

            {steps.map((item, index) => (
              <div key={index} className="relative text-center group">
                <div className="w-24 h-24 mx-auto bg-dark-900 border border-white/10 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-8 relative z-10 group-hover:border-primary/50 transition-colors shadow-2xl">
                  {item.step}
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/30 transition-all opacity-0 group-hover:opacity-100" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Ace Your Interview?</h2>
              <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                Join thousands of candidates getting hired at top companies. Start your AI-powered practice today.
              </p>
              <Link href="/signup">
                <Button size="lg" variant="primary" className="text-lg h-16 px-10 shadow-2xl shadow-primary/30 hover:scale-105 transition-transform">
                  Start Free Practice
                  <ArrowRight size={20} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-dark-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Sparkles className="text-primary" size={24} />
            <span>InterviewAI</span>
          </div>
          <p className="text-slate-500 text-sm">© 2024 InterviewAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
