import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Shield, Code2, Globe, ArrowRight } from 'lucide-react'
import Navbar from '../components/Navbar'

const FEATURES = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    desc: 'Streamed responses with real-time token delivery — no waiting for the full answer.',
  },
  {
    icon: Code2,
    title: 'Code First',
    desc: 'Beautiful syntax highlighting for 100+ languages with one-click copy.',
  },
  {
    icon: Shield,
    title: 'Private & Secure',
    desc: 'Your conversations are encrypted. We never train on your data.',
  },
  {
    icon: Globe,
    title: 'Multi-Model',
    desc: 'Switch between GPT-4o, Claude, and more — all in one interface.',
  },
]

function FeatureCard({ icon: Icon, title, desc, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col gap-4 p-6 rounded-2xl bg-surface-card border border-border hover:border-brand-500/30 transition-colors"
    >
      <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-brand-400" />
      </div>
      <div>
        <h3 className="font-semibold text-txt-primary mb-1">{title}</h3>
        <p className="text-sm text-txt-secondary leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface text-txt-primary">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium mb-6">
              <Zap className="w-3 h-3" /> Now in Beta
            </span>

            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-txt-primary mb-6 leading-tight">
              Meet{' '}
              <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
                AQIZA AI
              </span>
            </h1>

            <p className="text-xl text-txt-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              Your intelligent AI assistant — powered by the world's best language
              models. Ask anything, code anything, learn anything.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-colors shadow-lg shadow-brand-500/20"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-card border border-border hover:border-brand-500/40 text-txt-primary font-semibold transition-colors"
              >
                Learn More
              </a>
            </div>
          </motion.div>

          {/* Preview mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 rounded-2xl bg-surface-card border border-border overflow-hidden shadow-2xl"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-sidebar">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="ml-2 text-xs text-txt-muted">AQIZA AI</span>
            </div>
            <div className="p-6 flex flex-col gap-4 min-h-[200px]">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-brand-500/80 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">A</div>
                <div className="bg-surface-hover rounded-xl px-4 py-3 text-sm text-txt-secondary max-w-lg">
                  Hello! I'm AQIZA AI. I can help you code, write, analyze data, and much more. What would you like to explore today?
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <div className="bg-brand-500 rounded-xl px-4 py-3 text-sm text-white">
                  Write a Python function to reverse a linked list
                </div>
                <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">U</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-txt-primary mb-4">
              Everything you need
            </h2>
            <p className="text-txt-secondary max-w-xl mx-auto">
              Built for developers, researchers, and curious minds — AQIZA AI
              brings the power of AI into a seamless experience.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-txt-primary mb-4">
            Start for free today
          </h2>
          <p className="text-txt-secondary mb-8">
            No credit card required. Get instant access to AQIZA AI.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-colors shadow-lg shadow-brand-500/20 text-lg"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center">
        <p className="text-sm text-txt-muted">
          © {new Date().getFullYear()} AQIZA AI. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
