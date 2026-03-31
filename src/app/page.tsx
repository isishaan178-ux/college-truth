"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  GraduationCap,
  Heart,
  Flame,
  Landmark,
  Megaphone,
  Music2,
  ShieldAlert,
  Trophy,
  Users,
  Wrench,
  ArrowRight,
  TrendingDown,
  Eye,
  Sparkles,
} from "lucide-react";
import SearchBar from "@/components/SearchBar";
import CollegeCard from "@/components/CollegeCard";
import PostCard from "@/components/PostCard";

// ─── Mock Data ──────────────────────────────────────────────────────────────

const TRENDING_COLLEGES = [
  {
    name: "IIT Bombay",
    slug: "iit-bombay",
    city: "Mumbai",
    type: "IIT",
    overallScore: 8.7,
    totalPosts: 1243,
    topCategories: [
      { name: "placements", score: 9.4 },
      { name: "infrastructure", score: 8.8 },
      { name: "campus_life", score: 8.2 },
    ],
  },
  {
    name: "IIT Delhi",
    slug: "iit-delhi",
    city: "New Delhi",
    type: "IIT",
    overallScore: 8.4,
    totalPosts: 1087,
    topCategories: [
      { name: "placements", score: 9.2 },
      { name: "professors", score: 8.1 },
      { name: "infrastructure", score: 7.9 },
    ],
  },
  {
    name: "BITS Pilani",
    slug: "bits-pilani",
    city: "Pilani",
    type: "BITS",
    overallScore: 8.1,
    totalPosts: 876,
    topCategories: [
      { name: "campus_life", score: 9.0 },
      { name: "placements", score: 8.5 },
      { name: "professors", score: 7.6 },
    ],
  },
  {
    name: "IIT Madras",
    slug: "iit-madras",
    city: "Chennai",
    type: "IIT",
    overallScore: 8.6,
    totalPosts: 998,
    topCategories: [
      { name: "placements", score: 9.1 },
      { name: "infrastructure", score: 8.9 },
      { name: "sports", score: 7.8 },
    ],
  },
  {
    name: "NIT Trichy",
    slug: "nit-trichy",
    city: "Tiruchirappalli",
    type: "NIT",
    overallScore: 7.8,
    totalPosts: 654,
    topCategories: [
      { name: "placements", score: 8.2 },
      { name: "hostel", score: 7.1 },
      { name: "campus_life", score: 7.5 },
    ],
  },
  {
    name: "NIT Warangal",
    slug: "nit-warangal",
    city: "Warangal",
    type: "NIT",
    overallScore: 7.5,
    totalPosts: 589,
    topCategories: [
      { name: "placements", score: 7.9 },
      { name: "professors", score: 7.2 },
      { name: "campus_life", score: 7.4 },
    ],
  },
  {
    name: "VIT Vellore",
    slug: "vit-vellore",
    city: "Vellore",
    type: "Private",
    overallScore: 6.2,
    totalPosts: 1567,
    topCategories: [
      { name: "infrastructure", score: 8.0 },
      { name: "placements", score: 5.8 },
      { name: "hostel", score: 5.5 },
    ],
  },
  {
    name: "DTU Delhi",
    slug: "dtu-delhi",
    city: "New Delhi",
    type: "State",
    overallScore: 7.1,
    totalPosts: 723,
    topCategories: [
      { name: "placements", score: 7.6 },
      { name: "campus_life", score: 7.0 },
      { name: "professors", score: 6.5 },
    ],
  },
];

const RECENT_POSTS = [
  {
    collegeName: "IIT Bombay",
    collegeSlug: "iit-bombay",
    category: "placements",
    content:
      "The placement season this year was brutal. Only top CSE students got the dream offers. Most mechanical and civil branches struggled to even get shortlisted. The median package dropped by 2 LPA compared to last year. The placement cell needs to diversify company outreach beyond just tech.",
    sentiment: "negative",
    source: "reddit",
    timeAgo: "2 hours ago",
    upvotes: 234,
  },
  {
    collegeName: "BITS Pilani",
    collegeSlug: "bits-pilani",
    category: "campus_life",
    content:
      "BITS fest culture is genuinely unmatched. BOSM and Oasis were incredible this year. The freedom here is something you won't find at any IIT. No attendance policy, no curfew, complete autonomy. It teaches you responsibility the hard way.",
    sentiment: "positive",
    source: "reddit",
    timeAgo: "4 hours ago",
    upvotes: 187,
  },
  {
    collegeName: "VIT Vellore",
    collegeSlug: "vit-vellore",
    category: "restrictions",
    content:
      "They literally lock the hostel gates at 9 PM. If you're caught outside after curfew, they call your parents. In 2026. A so-called 'university'. The biometric attendance system tracks your every move. We are engineering students, not prisoners.",
    sentiment: "negative",
    source: "submission",
    timeAgo: "5 hours ago",
    upvotes: 456,
  },
  {
    collegeName: "IIT Delhi",
    collegeSlug: "iit-delhi",
    category: "mental_health",
    content:
      "The academic pressure here is no joke. Two of my batchmates had to take a semester break for mental health reasons. The counseling center exists but the wait time is 3 weeks. We need more therapists on campus urgently.",
    sentiment: "negative",
    source: "submission",
    timeAgo: "6 hours ago",
    upvotes: 312,
  },
  {
    collegeName: "NIT Trichy",
    collegeSlug: "nit-trichy",
    category: "hostel",
    content:
      "The new hostel block is surprisingly good. AC rooms, attached bathrooms, decent WiFi. Mess food is still the same old dal-chawal story but at least the living conditions have improved. 7/10 would recommend.",
    sentiment: "positive",
    source: "quora",
    timeAgo: "8 hours ago",
    upvotes: 98,
  },
  {
    collegeName: "SRM Chennai",
    collegeSlug: "srm-chennai",
    category: "professors",
    content:
      "Half the professors just read from slides. The other half don't even show up. Had a course where the prof came for 12 out of 40 lectures. The internal marks are completely arbitrary. Pay 20L fees for YouTube-quality education.",
    sentiment: "negative",
    source: "reddit",
    timeAgo: "10 hours ago",
    upvotes: 567,
  },
];

const CATEGORIES = [
  { key: "placements", label: "Placements", icon: Briefcase, count: 3420, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { key: "hostel", label: "Hostel & Mess", icon: Building2, count: 2890, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  { key: "professors", label: "Professors", icon: GraduationCap, count: 2156, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  { key: "mental_health", label: "Mental Health", icon: Heart, count: 1876, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  { key: "campus_life", label: "Campus Life", icon: Music2, count: 2340, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { key: "sports", label: "Sports", icon: Trophy, count: 890, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  { key: "restrictions", label: "Restrictions", icon: ShieldAlert, count: 1654, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
  { key: "infrastructure", label: "Infrastructure", icon: Wrench, count: 1230, color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/20" },
  { key: "news", label: "News", icon: Megaphone, count: 756, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
];

const WORST_RATED = [
  {
    name: "Lovely Professional University",
    slug: "lpu-jalandhar",
    city: "Jalandhar",
    overallScore: 3.2,
    worstCategory: "Placements",
    worstScore: 2.1,
    reason: "Mass recruitment inflates placement stats; actual median is below 4 LPA",
  },
  {
    name: "Amity University Noida",
    slug: "amity-noida",
    city: "Noida",
    overallScore: 3.8,
    worstCategory: "Professors",
    worstScore: 2.8,
    reason: "High faculty turnover; many visiting lecturers with no industry experience",
  },
  {
    name: "Chandigarh University",
    slug: "chandigarh-university",
    city: "Mohali",
    overallScore: 4.0,
    worstCategory: "Restrictions",
    worstScore: 1.9,
    reason: "Extreme surveillance, mandatory attendance biometrics, phone confiscation",
  },
  {
    name: "Galgotias University",
    slug: "galgotias-university",
    city: "Greater Noida",
    overallScore: 3.5,
    worstCategory: "Infrastructure",
    worstScore: 2.5,
    reason: "Labs outdated, frequent power cuts, poor maintenance of buildings",
  },
  {
    name: "SRM Chennai",
    slug: "srm-chennai",
    city: "Chennai",
    overallScore: 4.2,
    worstCategory: "Value for Money",
    worstScore: 2.3,
    reason: "20L+ fees for education quality that doesn't justify the cost",
  },
];

// ─── Animations ─────────────────────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

// ─── Page ───────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Hero gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-transparent" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/8 rounded-full blur-3xl" />
          <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24">
          <motion.div
            className="flex flex-col items-center text-center"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            {/* Badge */}
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-xs font-medium text-indigo-400 mb-6">
                <Sparkles className="h-3 w-3" />
                100% Anonymous & Unfiltered
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl leading-[1.1]"
            >
              The{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Unfiltered Truth
              </span>{" "}
              About Indian Colleges
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed"
            >
              Real reviews from real students. No sugarcoating. No paid promotions.
            </motion.p>

            {/* Search */}
            <motion.div variants={fadeUp} className="mt-10 w-full max-w-xl">
              <SearchBar large />
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap items-center justify-center gap-8 sm:gap-12"
            >
              {[
                { value: "500+", label: "Colleges" },
                { value: "10,000+", label: "Reviews" },
                { value: "100%", label: "Anonymous" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl font-bold text-white">
                    {stat.value}
                  </span>
                  <span className="text-xs sm:text-sm text-zinc-500 mt-1">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── TRENDING COLLEGES ────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-orange-400" />
                <h2 className="text-2xl sm:text-3xl font-bold">Trending Colleges</h2>
              </div>
              <p className="text-sm text-zinc-500">Most discussed colleges this month</p>
            </div>
            <Link
              href="/colleges"
              className="hidden sm:flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {TRENDING_COLLEGES.map((college, i) => (
              <motion.div
                key={college.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex-shrink-0"
              >
                <CollegeCard {...college} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECENT CONFESSIONS ───────────────────────────── */}
      <section className="py-16 sm:py-20 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-5 w-5 text-indigo-400" />
                <h2 className="text-2xl sm:text-3xl font-bold">Recent Confessions</h2>
              </div>
              <p className="text-sm text-zinc-500">Latest unfiltered student experiences</p>
            </div>
            <Link
              href="/confessions"
              className="hidden sm:flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RECENT_POSTS.map((post, i) => (
              <motion.div
                key={`${post.collegeSlug}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <PostCard {...post} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Browse by Category</h2>
            <p className="text-sm text-zinc-500">
              Explore what students are saying about specific topics
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {CATEGORIES.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.key}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <Link href={`/category/${cat.key}`}>
                    <div
                      className={`group flex flex-col items-center gap-3 rounded-2xl border p-6 transition-all hover:scale-[1.03] cursor-pointer ${cat.bg} hover:border-opacity-40`}
                    >
                      <Icon className={`h-7 w-7 ${cat.color}`} />
                      <span className="text-sm font-semibold text-white">{cat.label}</span>
                      <span className="text-xs text-zinc-500">
                        {cat.count.toLocaleString()} posts
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WORST RATED ──────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-red-400" />
                <h2 className="text-2xl sm:text-3xl font-bold">Worst Rated</h2>
              </div>
              <p className="text-sm text-zinc-500">
                Colleges students complain about the most
              </p>
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {WORST_RATED.map((college, i) => (
              <motion.div
                key={college.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <Link href={`/college/${college.slug}`}>
                  <div className="group rounded-2xl border border-red-500/10 bg-red-500/[0.02] p-5 hover:border-red-500/20 hover:bg-red-500/[0.04] transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 mr-2">
                        <h3 className="text-sm font-semibold text-white truncate group-hover:text-red-300 transition-colors">
                          {college.name}
                        </h3>
                        <p className="text-xs text-zinc-600 mt-0.5">{college.city}</p>
                      </div>
                      <div className="flex flex-col items-center justify-center h-11 w-11 rounded-lg bg-red-500/10 border border-red-500/20 flex-shrink-0">
                        <span className="text-sm font-bold text-red-400">
                          {college.overallScore}
                        </span>
                        <span className="text-[8px] text-zinc-600">/10</span>
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className="text-[10px] font-medium text-red-400/80">
                        Worst: {college.worstCategory} ({college.worstScore}/10)
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                      {college.reason}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl border border-indigo-500/10 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent p-10 sm:p-16 text-center overflow-hidden"
          >
            {/* CTA background accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl -z-10" />

            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Share Your{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                College Experience
              </span>
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto mb-8 leading-relaxed">
              Your story can help thousands of students make better decisions. All submissions
              are completely anonymous and verified before publishing.
            </p>
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/20"
            >
              Submit Your Story
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
