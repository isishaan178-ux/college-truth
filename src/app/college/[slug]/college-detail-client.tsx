"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Building,
  MessageSquare,
  ArrowUp,
  ExternalLink,
  Share2,
  PenLine,
} from "lucide-react";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScoreDisplay, ScoreBar } from "@/components/ScoreDisplay";
import { CategoryBadge, type CategoryType } from "@/components/CategoryBadge";
import {
  SentimentIndicator,
  SentimentBreakdown,
} from "@/components/SentimentIndicator";
import { IncidentsSection } from "@/components/IncidentsSection";
import type { CollegeData, Post } from "./page";

const categoryTabs = [
  { value: "all", label: "All" },
  { value: "placements", label: "Placements" },
  { value: "hostel", label: "Hostel & Mess" },
  { value: "professors", label: "Professors" },
  { value: "mental-health", label: "Mental Health" },
  { value: "campus-life", label: "Campus Life" },
  { value: "sports", label: "Sports" },
  { value: "restrictions", label: "Restrictions" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "news", label: "News" },
];

const sourceColors: Record<string, string> = {
  reddit: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  quora: "bg-red-500/20 text-red-400 border-red-500/30",
  shiksha: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  youtube: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  collegedunia: "bg-green-500/20 text-green-400 border-green-500/30",
};

function PostCard({ post, index }: { post: Post; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div className="group rounded-xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm transition-all hover:border-white/10 hover:bg-white/[0.04]">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <CategoryBadge category={post.category as CategoryType} size="sm" />
          <SentimentIndicator sentiment={post.sentiment} size="sm" />
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
              sourceColors[post.source] || "bg-gray-500/20 text-gray-400"
            }`}
          >
            {post.source}
          </span>
          <span className="ml-auto text-xs text-muted-foreground">
            {new Date(post.date).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-gray-300">{post.content}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{post.author}</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowUp className="size-3" />
            {post.upvotes}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function CollegeDetailClient({ college }: { college: CollegeData }) {
  const [activeTab, setActiveTab] = useState("all");

  const filteredPosts =
    activeTab === "all"
      ? college.posts
      : college.posts.filter((p) => p.category === activeTab);

  const activeCategoryScore =
    activeTab !== "all" ? college.categoryScores[activeTab] : null;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* ===== HEADER SECTION ===== */}
      <section className="relative overflow-hidden border-b border-white/5">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-[#0a0a0f] to-purple-950/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.1),transparent_60%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
            {/* Left: College Info */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <Badge
                    variant="outline"
                    className="border-indigo-500/30 bg-indigo-500/10 text-indigo-400"
                  >
                    {college.type}
                  </Badge>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="size-3.5" />
                    Est. {college.established}
                  </span>
                </div>
                <h1 className="mb-1 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {college.name}
                </h1>
                <p className="mb-4 text-lg text-muted-foreground">
                  {college.fullName}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-4 text-indigo-400" />
                    {college.city}, {college.state}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="size-4 text-indigo-400" />
                    {college.totalPosts} reviews
                  </span>
                </div>
              </motion.div>

              {/* Source breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-6 flex flex-wrap gap-2"
              >
                {Object.entries(college.sourceCounts).map(([source, count]) => (
                  <span
                    key={source}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                      sourceColors[source] || ""
                    }`}
                  >
                    {source}
                    <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">
                      {count}
                    </span>
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right: Overall Score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <span className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Truth Score
              </span>
              <ScoreDisplay
                score={college.overallScore}
                size="xl"
                label="/ 10"
              />
            </motion.div>
          </div>

          {/* Category Score Bars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm"
          >
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Category Scores
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(college.categoryScores).map(
                ([category, data]) => (
                  <ScoreBar
                    key={category}
                    score={data.score}
                    label={
                      categoryTabs.find((t) => t.value === category)?.label ||
                      category
                    }
                  />
                )
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Left: Tabs and Posts */}
          <div>
            <Tabs
              defaultValue="all"
              onValueChange={(val: string | number | null) => {
                if (typeof val === "string") setActiveTab(val);
              }}
            >
              <div className="mb-6 overflow-x-auto scrollbar-none">
                <TabsList className="inline-flex h-auto w-auto flex-nowrap gap-1 rounded-xl bg-white/[0.03] p-1.5">
                  {categoryTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium data-active:bg-indigo-600 data-active:text-white"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {categoryTabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  {/* Category sentiment breakdown for specific tabs */}
                  {tab.value !== "all" &&
                    college.categoryScores[tab.value] && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-6 rounded-xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-4 mb-3">
                          <ScoreDisplay
                            score={
                              college.categoryScores[tab.value].score
                            }
                            size="sm"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {tab.label}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {college.categoryScores[tab.value].positive +
                                college.categoryScores[tab.value].negative +
                                college.categoryScores[tab.value].neutral}{" "}
                              reviews in this category
                            </p>
                          </div>
                        </div>
                        <SentimentBreakdown
                          positive={
                            college.categoryScores[tab.value].positive
                          }
                          negative={
                            college.categoryScores[tab.value].negative
                          }
                          neutral={
                            college.categoryScores[tab.value].neutral
                          }
                        />
                      </motion.div>
                    )}

                  {/* Posts */}
                  <div className="space-y-4">
                    {(tab.value === "all"
                      ? college.posts
                      : college.posts.filter(
                          (p) => p.category === tab.value
                        )
                    ).length === 0 ? (
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
                        <p className="text-muted-foreground">
                          No reviews in this category yet.
                        </p>
                      </div>
                    ) : (
                      (tab.value === "all"
                        ? college.posts
                        : college.posts.filter(
                            (p) => p.category === tab.value
                          )
                      ).map((post, i) => (
                        <PostCard key={post.id} post={post} index={i} />
                      ))
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* ===== INCIDENTS SECTION ===== */}
          <div className="col-span-full">
            <IncidentsSection slug={college.slug} />
          </div>

          {/* ===== SIDEBAR (desktop only) ===== */}
          <aside className="hidden lg:block">
            <div className="sticky top-8 space-y-6">
              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Reviews
                      </span>
                      <span className="font-semibold text-white">
                        {college.totalPosts}
                      </span>
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        College Type
                      </span>
                      <span className="font-semibold text-white">
                        {college.type}
                      </span>
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Established
                      </span>
                      <span className="font-semibold text-white">
                        {college.established}
                      </span>
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Best Category
                      </span>
                      <CategoryBadge category="placements" showIcon={false} />
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Worst Category
                      </span>
                      <CategoryBadge
                        category="restrictions"
                        showIcon={false}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Share Your Experience CTA */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="overflow-hidden rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/50 to-purple-950/30 p-6 backdrop-blur-sm">
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-indigo-500/20">
                    <PenLine className="size-5 text-indigo-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    Share Your Experience
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Your honest review can help thousands of students make
                    better decisions.
                  </p>
                  <a
                    href="/submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
                  >
                    <PenLine className="size-4" />
                    Write a Review
                  </a>
                </div>
              </motion.div>

              {/* Related Colleges */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Similar Colleges
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {college.relatedColleges.map((rel) => (
                      <a
                        key={rel.slug}
                        href={`/college/${rel.slug}`}
                        className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-lg bg-white/5">
                            <Building className="size-4 text-muted-foreground" />
                          </div>
                          <span className="text-sm font-medium text-white">
                            {rel.name}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            rel.score >= 7
                              ? "text-emerald-400"
                              : rel.score >= 5
                                ? "text-yellow-400"
                                : "text-red-400"
                          }`}
                        >
                          {rel.score.toFixed(1)}
                        </span>
                      </a>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
