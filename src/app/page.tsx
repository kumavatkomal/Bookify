import Link from 'next/link'
import Brand from '@/components/Brand'
import LiveTypingText from '@/components/ai/LiveTypingText'

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-grid-soft bg-gradient-to-br from-amber-50 via-sky-50 to-emerald-50">
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-sky-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-10 h-80 w-80 rounded-full bg-amber-300/40 blur-3xl" />

      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16 lg:py-20">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="fade-up">
            <Brand size={44} showText href="/" />

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Smart scheduling, zero chaos
            </div>

            <h1 className="mt-6 text-5xl font-semibold leading-tight text-slate-900 sm:text-6xl">
              Book appointments that feel{' '}
              <span className="inline-block rounded-2xl bg-gradient-to-r from-fuchsia-200 via-pink-200 to-purple-200 px-2 py-1 text-slate-900 shadow-sm ring-1 ring-fuchsia-200/40">
                effortless
              </span>{' '}
              for everyone.
            </h1>

            <p className="mt-4 text-lg text-slate-600">
              Bookify blends AI suggestions, real-time availability, and clean
              workflows so teams stay booked without the back-and-forth.
            </p>

            <ul className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <li className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/60 px-3 py-2 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-primary-500" />
                Real-time availability across teams
              </li>
              <li className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/60 px-3 py-2 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                AI-driven slot recommendations
              </li>
              <li className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/60 px-3 py-2 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Automated reminders and follow-ups
              </li>
              <li className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/60 px-3 py-2 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                One-click reschedule flows
              </li>
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary">
                Get Started
              </Link>
              <Link href="/login" className="btn-secondary">
                Log In
              </Link>
            </div>
          </div>

          <div className="fade-up fade-up-delay-1 relative">
            <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Next available
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    Today, 3:30 PM
                  </p>
                  <p className="text-sm text-slate-500">Dr. Rao, Product Demo</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Confirmed
                </span>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Discovery Call</p>
                    <p className="text-xs text-slate-500">60 min with Aanya</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">11:00 AM</p>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Team Sync</p>
                    <p className="text-xs text-slate-500">30 min, 4 attendees</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">1:00 PM</p>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Follow-up</p>
                    <p className="text-xs text-slate-500">AI notes ready</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">4:15 PM</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  AI Suggestion
                </p>
                <p className="mt-2 text-sm text-emerald-900">
                  <LiveTypingText />
                </p>
              </div>
            </div>

            <div className="absolute -right-6 top-10 hidden rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-xs text-slate-600 shadow-lg sm:block">
              <p className="text-sm font-semibold text-slate-900">92% fill rate</p>
              <p>Last 30 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
