import Link from "next/link";
import {
  Monitor,
  ArrowRight,
  BarChart3,
  Zap,
  Eye,
  TrendingUp,
  LayoutGrid,
  Play,
} from "lucide-react";
import { AUDIENCE_ATLAS, colorById, nameById, type Surface } from "./atlas-data";
import { STORIES } from "./stories-data";

const SURFACE_BADGE_STYLES: Record<Surface, string> = {
  Banner: "bg-rose-100 text-rose-700 border-rose-200",
  Offer: "bg-blue-100 text-blue-700 border-blue-200",
  "Kiosk Banner": "bg-cyan-100 text-cyan-700 border-cyan-200",
  Toast: "bg-amber-100 text-amber-700 border-amber-200",
};

export default function UseCasesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--dominos-blue)]/10 px-4 py-1.5 text-sm font-medium text-[var(--dominos-blue)]">
          <Zap className="h-4 w-4" />
          Segment CDP Demo
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--dominos-dark-blue)] sm:text-5xl">
          See Segment in Action
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Every audience and every flow you can demo on this site. Start with
          the atlas, then walk through the flow stories — each one ends with a
          repro checklist you can run live.
        </p>
      </div>

      {/* How It Works mini-bar */}
      <div className="mb-12 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Eye, label: "What You See", desc: "The frontend experience a customer gets" },
          { icon: BarChart3, label: "How Segment Powers It", desc: "Audiences, traits, and events at work" },
          { icon: TrendingUp, label: "Business Impact", desc: "Measurable outcomes for the brand" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="rounded-md bg-slate-100 p-2">
              <item.icon className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Audience Atlas */}
      <section className="mb-16">
        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-md bg-slate-100 p-2">
            <LayoutGrid className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Audience Atlas</h2>
            <p className="text-sm text-muted-foreground">
              All {AUDIENCE_ATLAS.length} audiences in one view — trigger, surfaces fired,
              and the fastest way to activate each during a demo.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCE_ATLAS.map((row) => (
            <div
              key={row.id}
              className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start gap-2">
                <span
                  className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${row.color}`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{row.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{row.trigger}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {row.surfaces.length === 0 ? (
                  <span className="text-[10px] text-slate-400">— no UI surface</span>
                ) : (
                  row.surfaces.map((surface) => (
                    <span
                      key={surface}
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${SURFACE_BADGE_STYLES[surface]}`}
                    >
                      {surface}
                    </span>
                  ))
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                <span className="font-medium text-slate-600">Activate:</span>{" "}
                {row.persona}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Story Cards */}
      <section className="space-y-8">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-slate-100 p-2">
            <Play className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Flow Stories</h2>
            <p className="text-sm text-muted-foreground">
              {STORIES.length} customer-moment narratives, each with a live
              repro checklist an SE can run end-to-end.
            </p>
          </div>
        </div>

        {STORIES.map((story, idx) => (
          <article
            key={story.id}
            className={`overflow-hidden rounded-xl border ${story.borderColor} bg-white shadow-sm`}
          >
            {/* Card Header */}
            <div className={`flex items-start gap-4 ${story.bgColor} px-6 py-5`}>
              <div className="rounded-lg bg-white p-2.5 shadow-sm">
                <story.icon className={`h-6 w-6 ${story.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900">
                  {idx + 1}. {story.title}
                </h3>
                <p className="mt-0.5 text-sm text-slate-600">
                  Persona: <span className="font-medium">{story.persona}</span>{" "}
                  — {story.personaDetail}
                </p>
                {story.audienceIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {story.audienceIds.map((id) => (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${colorById(id)}`}
                          aria-hidden
                        />
                        {nameById(id)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Card Body */}
            <div className="grid gap-6 p-6 lg:grid-cols-3">
              {/* The Challenge */}
              <div className="lg:col-span-3">
                <p className="text-base italic text-slate-700">
                  &ldquo;{story.challenge}&rdquo;
                </p>
              </div>

              {/* What You See */}
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  <Eye className="h-4 w-4" />
                  What You&apos;ll See
                </h4>
                <ul className="space-y-2">
                  {story.whatYouSee.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm leading-relaxed text-slate-700"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* How Segment Powers It */}
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  <BarChart3 className="h-4 w-4" />
                  How Segment Powers It
                </h4>
                <ul className="space-y-2">
                  {story.howSegmentPowers.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm leading-relaxed text-slate-700"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--dominos-blue)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Business Impact */}
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  <TrendingUp className="h-4 w-4" />
                  Business Impact
                </h4>
                <p className="text-sm leading-relaxed text-slate-700">
                  {story.businessImpact}
                </p>
                <Link
                  href={story.cta.href}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--dominos-blue)] hover:underline"
                >
                  {story.cta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Try It */}
            <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                <Play className="h-4 w-4" />
                Try It
              </h4>
              <ol className="space-y-2">
                {story.tryIt.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </article>
        ))}
      </section>

      {/* Footer CTA */}
      <div className="mt-16 rounded-xl bg-[var(--dominos-dark-blue)] px-8 py-10 text-center text-white">
        <h2 className="text-2xl font-bold">Ready to explore?</h2>
        <p className="mx-auto mt-2 max-w-lg text-slate-300">
          Toggle the demo toolbar (bottom-right) to load any persona and watch
          audiences, traits, and journeys update in real time.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--dominos-red)] px-5 py-2.5 font-semibold text-white transition hover:bg-[var(--dominos-red)]/90"
          >
            Start Ordering
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/kiosk"
            className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-2.5 font-semibold text-white transition hover:bg-white/10"
          >
            Try the Kiosk
            <Monitor className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
