const wonders = [
  {
    emoji: "⬇️",
    title: "The Drop Experiment",
    tag: "Scientific Thinking",
    description:
      "If Leo is dropping things again and again, he is exploring cause and effect.",
  },
  {
    emoji: "📦",
    title: "Container Play",
    tag: "Spatial Reasoning",
    description:
      "Putting things in and taking them out helps build early problem-solving skills.",
  },
  {
    emoji: "🚶",
    title: "Movement & Independence",
    tag: "Motor & Cognitive",
    description:
      "Cruising, crawling, and toddling all build confidence and body awareness.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f6f5] text-[#222]">
      <div className="mx-auto max-w-md pb-10">
        <header className="rounded-b-[32px] bg-gradient-to-b from-indigo-600 to-indigo-500 px-6 pb-8 pt-10 text-white shadow-sm">
          <p className="text-2xl">🌤️</p>
          <p className="mt-3 text-lg">Good morning, Yiz 👋</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Leo&apos;s World Today</h1>
          <p className="mt-2 text-base text-indigo-100">14 months old · Little Physicist</p>
        </header>

        <section className="px-4 pt-5">
          <button className="flex w-full items-center justify-between rounded-3xl border border-[#ece8f9] bg-white p-4 text-left shadow-sm">
            <div>
              <p className="text-lg font-medium">What&apos;s Leo up to?</p>
              <p className="text-sm text-[#777]">Log a moment of wonder</p>
            </div>
            <span className="text-xl">🎤</span>
          </button>
        </section>

        <section className="px-4 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-serif leading-none">Today&apos;s Wonders</h2>
              <p className="mt-1 text-sm text-[#666]">What Leo&apos;s brain is up to right now</p>
            </div>
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
              Little Physicist
            </span>
          </div>

          <div className="space-y-4">
            {wonders.map((wonder) => (
              <article key={wonder.title} className="rounded-3xl border border-[#ececec] bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center gap-3">
                  <span className="rounded-2xl bg-[#f1edfd] px-3 py-2 text-xl">{wonder.emoji}</span>
                  <div>
                    <h3 className="text-2xl font-semibold">{wonder.title}</h3>
                    <span className="mt-1 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                      {wonder.tag}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-lg text-[#555]">{wonder.description}</p>
                <button className="mt-3 text-base font-medium text-indigo-600">Tap to read more</button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
