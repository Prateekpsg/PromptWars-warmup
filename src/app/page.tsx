export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <header className="border-b border-slate-800/80 backdrop-blur sticky top-0 z-50 bg-slate-950/70">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white text-base shadow-lg shadow-indigo-500/20">
              ▲
            </span>
            <span>CloudLaunch</span>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#deploy" className="hover:text-white transition-colors">Deployment</a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-slate-700 hover:border-slate-500 text-slate-200 transition-all hover:bg-slate-800"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-24 pb-20 px-6">
          {/* Subtle gradient glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Ready for GitHub & Vercel Deployment
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
              Modern Next.js Demo{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-teal-300 bg-clip-text text-transparent">
                Built to Ship Fast
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              A clean starter landing page configured with Tailwind CSS and Next.js App Router, ready to connect with your GitHub repository and deploy directly to Vercel.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-white text-slate-950 font-semibold text-sm hover:bg-slate-200 transition-all shadow-lg hover:shadow-white/10 active:scale-[0.98]"
              >
                Deploy to Vercel
              </a>
              <a
                href="#pipeline"
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-800 hover:text-white transition-all active:scale-[0.98]"
              >
                View Pipeline Status
              </a>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section id="features" className="py-16 px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold mb-4">
                01
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Next.js App Router</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Powered by Next.js 16 with React 19, server components, and optimized asset bundling.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-4">
                02
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">GitHub Integration</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Version-controlled codebase with automated branch tracking and continuous integration triggers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold mb-4">
                03
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Vercel Edge Ready</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Instant zero-configuration deployment with global CDN caching, SSL, and preview environments.
              </p>
            </div>
          </div>
        </section>

        {/* Deployment Checklist / Status Section */}
        <section id="pipeline" className="py-16 px-6 max-w-4xl mx-auto">
          <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900/80 border border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-2">Deployment Checklist</h2>
            <p className="text-sm text-slate-400 mb-6">Track progress from local project setup to production live URL.</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/70 border border-emerald-900/40">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">✓</span>
                  <div>
                    <p className="text-sm font-medium text-white">Landing Page UI</p>
                    <p className="text-xs text-slate-400">Next.js App router layout and responsive hero created</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Ready</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">⋯</span>
                  <div>
                    <p className="text-sm font-medium text-white">GitHub Repository</p>
                    <p className="text-xs text-slate-400">Initialize local git repository and push to GitHub remote</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">In Progress</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold">3</span>
                  <div>
                    <p className="text-sm font-medium text-white">Vercel Deployment</p>
                    <p className="text-xs text-slate-400">Link GitHub repository to Vercel for automated CI/CD builds</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} CloudLaunch Demo. Designed for Next.js & Vercel deployment.</p>
      </footer>
    </div>
  );
}
