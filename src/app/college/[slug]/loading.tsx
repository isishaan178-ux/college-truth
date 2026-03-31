export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header skeleton */}
      <section className="relative border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-[#0a0a0f] to-purple-950/20" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              {/* Badge + year */}
              <div className="mb-3 flex items-center gap-3">
                <div className="h-5 w-16 animate-pulse rounded-full bg-white/5" />
                <div className="h-4 w-20 animate-pulse rounded bg-white/5" />
              </div>
              {/* Title */}
              <div className="mb-2 h-10 w-72 animate-pulse rounded-lg bg-white/5" />
              {/* Subtitle */}
              <div className="mb-4 h-5 w-56 animate-pulse rounded bg-white/5" />
              {/* Location + reviews */}
              <div className="flex gap-4">
                <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
                <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
              </div>
              {/* Source badges */}
              <div className="mt-6 flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-7 w-20 animate-pulse rounded-full bg-white/5"
                  />
                ))}
              </div>
            </div>
            {/* Score circle */}
            <div className="flex flex-col items-center">
              <div className="mb-2 h-3 w-16 animate-pulse rounded bg-white/5" />
              <div className="size-44 animate-pulse rounded-full bg-white/5" />
            </div>
          </div>

          {/* Category score bars */}
          <div className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-6">
            <div className="mb-4 h-4 w-32 animate-pulse rounded bg-white/5" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
                    <div className="h-4 w-8 animate-pulse rounded bg-white/5" />
                  </div>
                  <div className="h-2 w-full animate-pulse rounded-full bg-white/5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            {/* Tabs skeleton */}
            <div className="mb-6 flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-9 w-24 animate-pulse rounded-lg bg-white/5"
                />
              ))}
            </div>

            {/* Post skeletons */}
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-5"
                >
                  <div className="mb-3 flex gap-2">
                    <div className="h-5 w-20 animate-pulse rounded-full bg-white/5" />
                    <div className="h-5 w-16 animate-pulse rounded-full bg-white/5" />
                    <div className="h-5 w-14 animate-pulse rounded-full bg-white/5" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full animate-pulse rounded bg-white/5" />
                    <div className="h-4 w-full animate-pulse rounded bg-white/5" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
                  </div>
                  <div className="mt-3 flex justify-between">
                    <div className="h-3 w-28 animate-pulse rounded bg-white/5" />
                    <div className="h-3 w-10 animate-pulse rounded bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar skeleton */}
          <aside className="hidden lg:block">
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-6"
                >
                  <div className="mb-4 h-4 w-24 animate-pulse rounded bg-white/5" />
                  <div className="space-y-3">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="flex justify-between">
                        <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
                        <div className="h-4 w-16 animate-pulse rounded bg-white/5" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
