'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, FeatureCard } from '@/components/ui/Card';
import { Avatar, AvatarGroup } from '@/components/ui/Avatar';
import {
  Mic,
  Brain,
  BarChart3,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Play,
  Users,
  Target,
  Zap,
  Star,
  Quote,
  Building2,
  TrendingUp,
  Shield,
  Clock
} from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();

  const features = [
    {
      icon: <Mic size={28} />,
      title: 'Voice-Based Interviews',
      description: 'Practice with natural voice conversations. Our AI listens and responds just like a real interviewer.'
    },
    {
      icon: <Brain size={28} />,
      title: 'AI-Powered Questions',
      description: 'Dynamic questions tailored to your job role, experience, and resume using Google Gemini AI.'
    },
    {
      icon: <BarChart3 size={28} />,
      title: 'Comprehensive Analysis',
      description: 'Get detailed feedback on communication, technical skills, confidence, and more.'
    },
    {
      icon: <Sparkles size={28} />,
      title: 'Personalized Tips',
      description: 'Receive actionable advice to improve your interview performance.'
    },
  ];

  const stats = [
    { value: '10K+', label: 'Interviews Completed', icon: <Target size={20} /> },
    { value: '95%', label: 'Success Rate', icon: <TrendingUp size={20} /> },
    { value: '4.9/5', label: 'User Rating', icon: <Star size={20} /> },
  ];

  const steps = [
    {
      step: 1,
      title: 'Set Up Your Interview',
      description: 'Enter job details and upload your resume. Our AI personalizes questions based on your profile.',
      icon: <Target size={24} />
    },
    {
      step: 2,
      title: 'Practice with AI',
      description: 'Have a natural voice conversation with our AI interviewer. It adapts to your responses in real-time.',
      icon: <Mic size={24} />
    },
    {
      step: 3,
      title: 'Get Your Analysis',
      description: 'Review detailed performance metrics, improvement areas, and personalized coaching tips.',
      icon: <BarChart3 size={24} />
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer at Google',
      avatar: '',
      content: 'InterviewAI helped me prepare for my Google interviews. The AI feedback was incredibly accurate and helped me improve my communication skills.',
      rating: 5
    },
    {
      name: 'Michael Torres',
      role: 'Product Manager at Meta',
      avatar: '',
      content: 'The voice-based practice felt so real. I was much more confident going into my actual interviews after using this platform.',
      rating: 5
    },
    {
      name: 'Emily Johnson',
      role: 'Data Scientist at Amazon',
      avatar: '',
      content: 'The personalized questions based on my resume made all the difference. Highly recommend for anyone preparing for tech interviews.',
      rating: 5
    },
  ];

  const companies = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix'];

  return (
    <div className="min-h-screen bg-surface-50 text-neutral-900 font-sans selection:bg-primary/10 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-heading font-bold text-xl tracking-tight hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="text-neutral-900">InterviewAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              How it Works
            </Link>
            <Link href="#testimonials" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              Testimonials
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {loading ? null : user ? (
              <Link href="/dashboard">
                <Button variant="primary">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary">
                    Get Started
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-6 bg-gradient-hero">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-mesh-light pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16 animate-enter">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary font-medium text-sm mb-8">
              <Zap size={16} />
              <span>AI-Powered Interview Practice</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold font-heading leading-[1.1] mb-6 tracking-tight text-neutral-900">
              Master Your Next{' '}
              <span className="text-gradient-primary">Interview</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Practice with our AI interviewer using voice technology. Get real-time feedback,
              comprehensive analysis, and personalized tips to land your dream job.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/signup">
                <Button size="lg" variant="primary" className="w-full sm:w-auto text-base px-8 h-14 shadow-lg hover:shadow-glow-primary hover:-translate-y-1 transition-all">
                  Start Practicing Free
                  <ArrowRight size={20} />
                </Button>
              </Link>
              <Button size="lg" variant="secondary" className="w-full sm:w-auto text-base px-8 h-14">
                <Play size={20} />
                Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-neutral-500">
              <div className="flex items-center gap-2">
                <AvatarGroup
                  avatars={[
                    { name: 'John D' },
                    { name: 'Sarah M' },
                    { name: 'Mike R' },
                    { name: 'Emily C' },
                  ]}
                  size="sm"
                />
                <span>Join 10,000+ candidates</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-neutral-300" />
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={16} className="fill-warning text-warning" />
                ))}
                <span className="ml-1">4.9/5 rating</span>
              </div>
            </div>
          </div>

          {/* Hero Visual - Interview Preview Card */}
          <div className="max-w-4xl mx-auto animate-float">
            <Card variant="glass" padding="none" className="shadow-2xl border-neutral-200/50 overflow-hidden">
              {/* Browser Chrome */}
              <div className="px-4 py-3 border-b border-neutral-100 bg-surface-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-danger" />
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <div className="w-3 h-3 rounded-full bg-success" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-neutral-200 text-xs text-neutral-500">
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                  Live Session
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-8 bg-white space-y-6">
                {/* AI Message */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    AI
                  </div>
                  <div className="flex-1 p-4 rounded-2xl rounded-tl-sm bg-surface-50 border border-neutral-100 text-neutral-700">
                    Tell me about a challenging project you worked on and how you overcame obstacles.
                  </div>
                </div>

                {/* User Message */}
                <div className="flex items-start gap-4 flex-row-reverse">
                  <Avatar name="You" size="md" />
                  <div className="flex-1 p-4 rounded-2xl rounded-tr-sm bg-primary-50 border border-primary-100 text-neutral-700 text-right">
                    In my last role, I led a team to migrate our legacy system to a microservices architecture...
                  </div>
                </div>

                {/* Analysis Bar */}
                <div className="flex items-center justify-center gap-3 text-success font-medium bg-success-light py-3 rounded-xl border border-success/20">
                  <BarChart3 size={18} />
                  <span>Real-time Confidence Analysis: 92%</span>
                  <TrendingUp size={16} />
                </div>
              </div>
            </Card>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-white border border-neutral-200 shadow-soft">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-primary-50 flex items-center justify-center text-primary">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-neutral-900 font-heading mb-1">{stat.value}</div>
                <div className="text-sm text-neutral-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary text-sm font-medium mb-6">
              <Sparkles size={14} />
              Features
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6 text-neutral-900">
              Why Choose <span className="text-gradient-primary">InterviewAI</span>
            </h2>
            <p className="text-lg text-neutral-600">
              Everything you need to master your interview skills and boost your confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                className="group"
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 md:py-32 px-6 bg-surface-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-light opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary text-sm font-medium mb-6">
              <Clock size={14} />
              Simple Process
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6 text-neutral-900">
              How It <span className="text-gradient-primary">Works</span>
            </h2>
            <p className="text-lg text-neutral-600">Three simple steps to your dream job</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            {steps.map((item, index) => (
              <div key={index} className="relative text-center group">
                {/* Step number */}
                <div className="relative z-10 w-24 h-24 mx-auto bg-white border-2 border-neutral-200 rounded-full flex items-center justify-center text-3xl font-bold text-neutral-900 mb-8 shadow-soft group-hover:border-primary group-hover:shadow-glow-primary transition-all duration-300">
                  {item.step}
                  <div className="absolute inset-0 bg-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Icon badge */}
                <div className="absolute top-16 left-1/2 translate-x-4 -translate-y-2 w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                  {item.icon}
                </div>

                <h3 className="text-xl font-bold text-neutral-900 mb-3">{item.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 md:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary text-sm font-medium mb-6">
              <Users size={14} />
              Testimonials
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6 text-neutral-900">
              Loved by <span className="text-gradient-primary">Thousands</span>
            </h2>
            <p className="text-lg text-neutral-600">See what our users have to say about their experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {testimonials.map((testimonial, index) => (
              <Card key={index} variant="default" padding="lg" hover className="group">
                {/* Quote icon */}
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  <Quote size={20} />
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-warning text-warning" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-neutral-600 mb-6 leading-relaxed">"{testimonial.content}"</p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                  <Avatar name={testimonial.name} size="md" />
                  <div>
                    <div className="font-semibold text-neutral-900">{testimonial.name}</div>
                    <div className="text-sm text-neutral-500">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Company logos */}
          <div className="text-center">
            <p className="text-sm text-neutral-500 mb-6">Our users have landed jobs at</p>
            <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
              {companies.map((company, index) => (
                <div key={index} className="flex items-center gap-2 text-neutral-400 font-semibold text-lg">
                  <Building2 size={20} />
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 px-6 bg-gradient-to-br from-primary via-primary-600 to-primary-700 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-mesh-dark opacity-30 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white font-medium text-sm mb-8">
            <Shield size={16} />
            <span>Free to Start • No Credit Card Required</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold font-heading text-white mb-6">
            Ready to Ace Your Interview?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of candidates getting hired at top companies. Start your AI-powered practice today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-primary hover:bg-neutral-100 w-full sm:w-auto text-base h-14 px-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                Start Free Practice
                <ArrowRight size={20} />
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} />
              <span>Unlimited practice sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-neutral-900">InterviewAI</span>
            </div>

            <div className="flex items-center gap-8 text-sm text-neutral-600">
              <Link href="#" className="hover:text-neutral-900 transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-neutral-900 transition-colors">Terms</Link>
              <Link href="#" className="hover:text-neutral-900 transition-colors">Contact</Link>
            </div>

            <p className="text-neutral-500 text-sm">© 2024 InterviewAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
