"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CategoryScore {
  name: string;
  score: number;
}

interface CollegeCardProps {
  name: string;
  slug: string;
  city: string;
  type: string;
  overallScore: number;
  totalPosts: number;
  topCategories: CategoryScore[];
}

function getScoreColor(score: number): string {
  if (score >= 8) return "text-emerald-400";
  if (score >= 6) return "text-yellow-400";
  if (score >= 4) return "text-orange-400";
  return "text-red-400";
}

function getScoreBgColor(score: number): string {
  if (score >= 8) return "bg-emerald-500/10 border-emerald-500/20";
  if (score >= 6) return "bg-yellow-500/10 border-yellow-500/20";
  if (score >= 4) return "bg-orange-500/10 border-orange-500/20";
  return "bg-red-500/10 border-red-500/20";
}

function getTypeBadgeColor(type: string): string {
  switch (type) {
    case "IIT":
      return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    case "NIT":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "BITS":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "Private":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}

export default function CollegeCard({
  name,
  slug,
  city,
  type,
  overallScore,
  totalPosts,
  topCategories,
}: CollegeCardProps) {
  return (
    <Link href={`/college/${slug}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-5 hover:border-indigo-500/20 hover:bg-white/[0.04] transition-colors cursor-pointer min-w-[280px]"
      >
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 mr-3">
            <h3 className="text-base font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3 text-zinc-600" />
              <span className="text-xs text-zinc-500">{city}</span>
            </div>
          </div>
          <div
            className={`flex flex-col items-center justify-center h-14 w-14 rounded-xl border ${getScoreBgColor(overallScore)}`}
          >
            <span className={`text-lg font-bold ${getScoreColor(overallScore)}`}>
              {overallScore.toFixed(1)}
            </span>
            <span className="text-[10px] text-zinc-500">/10</span>
          </div>
        </div>

        {/* Type badge & posts */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${getTypeBadgeColor(type)}`}
          >
            {type}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-zinc-500">
            <TrendingUp className="h-3 w-3" />
            {totalPosts} posts
          </span>
        </div>

        {/* Category scores */}
        <div className="space-y-2">
          {topCategories.slice(0, 3).map((cat) => (
            <div key={cat.name} className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 capitalize">
                {cat.name.replace(/_/g, " ")}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      cat.score >= 8
                        ? "bg-emerald-500"
                        : cat.score >= 6
                          ? "bg-yellow-500"
                          : cat.score >= 4
                            ? "bg-orange-500"
                            : "bg-red-500"
                    }`}
                    style={{ width: `${cat.score * 10}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${getScoreColor(cat.score)}`}>
                  {cat.score.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </Link>
  );
}
