"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUp, Clock, ExternalLink, MessageSquare } from "lucide-react";

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  placements: { bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-400", label: "Placements" },
  hostel: { bg: "bg-orange-500/10 border-orange-500/20", text: "text-orange-400", label: "Hostel & Mess" },
  professors: { bg: "bg-purple-500/10 border-purple-500/20", text: "text-purple-400", label: "Professors" },
  mental_health: { bg: "bg-red-500/10 border-red-500/20", text: "text-red-400", label: "Mental Health" },
  campus_life: { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400", label: "Campus Life" },
  sports: { bg: "bg-yellow-500/10 border-yellow-500/20", text: "text-yellow-400", label: "Sports" },
  restrictions: { bg: "bg-pink-500/10 border-pink-500/20", text: "text-pink-400", label: "Restrictions" },
  infrastructure: { bg: "bg-zinc-500/10 border-zinc-500/20", text: "text-zinc-400", label: "Infrastructure" },
  news: { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400", label: "News" },
};

const SENTIMENT_MAP: Record<string, { emoji: string; label: string }> = {
  positive: { emoji: "+", label: "Positive" },
  negative: { emoji: "-", label: "Negative" },
  neutral: { emoji: "~", label: "Neutral" },
};

const SOURCE_MAP: Record<string, { label: string; color: string }> = {
  reddit: { label: "Reddit", color: "text-orange-400" },
  quora: { label: "Quora", color: "text-red-400" },
  submission: { label: "Direct", color: "text-indigo-400" },
  linkedin: { label: "LinkedIn", color: "text-blue-400" },
};

interface PostCardProps {
  collegeName: string;
  collegeSlug: string;
  category: string;
  content: string;
  sentiment: string;
  source: string;
  timeAgo: string;
  upvotes: number;
}

export default function PostCard({
  collegeName,
  collegeSlug,
  category,
  content,
  sentiment,
  source,
  timeAgo,
  upvotes,
}: PostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const catStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES.news;
  const sentimentInfo = SENTIMENT_MAP[sentiment] || SENTIMENT_MAP.neutral;
  const sourceInfo = SOURCE_MAP[source] || SOURCE_MAP.submission;

  const isLong = content.length > 200;
  const displayContent = expanded || !isLong ? content : content.slice(0, 200) + "...";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 transition-colors"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/college/${collegeSlug}`}
            className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {collegeName}
          </Link>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${catStyle.bg} ${catStyle.text}`}
          >
            {catStyle.label}
          </span>
        </div>
        <div
          className={`flex items-center justify-center h-6 w-6 rounded-md text-xs font-bold ${
            sentiment === "positive"
              ? "bg-emerald-500/10 text-emerald-400"
              : sentiment === "negative"
                ? "bg-red-500/10 text-red-400"
                : "bg-zinc-500/10 text-zinc-400"
          }`}
          title={sentimentInfo.label}
        >
          {sentimentInfo.emoji}
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-zinc-300 leading-relaxed mb-3">{displayContent}</p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-indigo-400 hover:text-indigo-300 mb-3 transition-colors"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-medium ${sourceInfo.color}`}>
            {sourceInfo.label}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-zinc-600">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </span>
        </div>
        <div className="flex items-center gap-1 text-zinc-500">
          <ArrowUp className="h-3.5 w-3.5" />
          <span className="text-xs">{upvotes}</span>
        </div>
      </div>
    </motion.div>
  );
}
