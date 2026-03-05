import { Link } from 'react-router-dom';
import { Code2, Heart, Zap, Shield, Users, Sparkles } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-dark-900 to-accent-900/20" />
        <div className="relative max-w-6xl mx-auto px-4 py-8">
          <nav className="flex items-center justify-between mb-20">
            <span className="text-2xl font-bold gradient-text font-mono">&lt;DevMatch /&gt;</span>
            <div className="flex gap-3">
              <Link to="/login" className="btn-secondary text-sm">Log in</Link>
              <Link to="/register" className="btn-primary text-sm">Sign up</Link>
            </div>
          </nav>

          <div className="text-center max-w-3xl mx-auto pb-20">
            <div className="inline-flex items-center gap-2 bg-primary-900/30 border border-primary-700/30 rounded-full px-4 py-1.5 text-sm text-primary-300 mb-6">
              <Sparkles size={16} />
              Where code meets connection
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Find your <span className="gradient-text">perfect match</span><br />
              in tech
            </h1>

            <p className="text-xl text-dark-400 mb-10 max-w-2xl mx-auto">
              DevMatch connects software engineers based on tech stacks, personality,
              and shared passion for building. No swiping on selfies — match on what actually matters.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                Get Started — It's Free
              </Link>
              <a href="#features" className="btn-secondary text-lg px-8 py-3">
                See How It Works
              </a>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-dark-500">
              <span className="flex items-center gap-1"><Users size={16} /> 10k+ developers</span>
              <span className="flex items-center gap-1"><Heart size={16} /> 5k+ matches</span>
              <span className="flex items-center gap-1"><Code2 size={16} /> 200+ tech stacks</span>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">
          Built <span className="gradient-text">by developers</span>, for developers
        </h2>
        <p className="text-dark-400 text-center mb-16 max-w-xl mx-auto">
          We understand that compatibility goes beyond looks. Match on what makes you, you.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Code2,
              title: 'Stack Match %',
              desc: 'Our algorithm calculates compatibility based on your tech stack overlap, experience level, and work style preferences.',
            },
            {
              icon: Zap,
              title: 'Smart Icebreakers',
              desc: '"Tabs vs Spaces?" Start conversations with fun, tech-themed prompts that actually lead somewhere interesting.',
            },
            {
              icon: Shield,
              title: 'GitHub Verified',
              desc: 'Connect your GitHub to earn badges, showcase your languages, and prove you actually write code.',
            },
            {
              icon: Heart,
              title: 'Multiple Modes',
              desc: 'Looking for love, a hackathon buddy, or a co-founder? Set your matching mode and find the right connection.',
            },
            {
              icon: Users,
              title: 'Dev Community',
              desc: 'From Frontend to DevOps, QA to ML — connect with engineers who speak your language.',
            },
            {
              icon: Sparkles,
              title: 'Gamified Badges',
              desc: 'Earn badges like "Bug Slayer", "Refactor Master", and "CI/CD Champion" to flex on your profile.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card hover:border-primary-700/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-primary-900/50 flex items-center justify-center mb-4 group-hover:bg-primary-800/50 transition-colors">
                <Icon size={24} className="text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-dark-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="card bg-gradient-to-r from-primary-900/50 to-accent-900/50 border-primary-700/30 text-center py-16">
          <h2 className="text-3xl font-bold mb-4">Ready to find your match?</h2>
          <p className="text-dark-300 mb-8 max-w-md mx-auto">
            Join thousands of developers who found their person (or their co-founder) on DevMatch.
          </p>
          <Link to="/register" className="btn-primary text-lg px-10 py-3">
            Create Your Profile
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-700 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-mono gradient-text">&lt;DevMatch /&gt;</span>
          <p className="text-sm text-dark-500">Built with love and too much caffeine.</p>
        </div>
      </footer>
    </div>
  );
}
