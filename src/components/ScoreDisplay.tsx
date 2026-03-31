"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ScoreDisplayProps {
  score: number;
  maxScore?: number;
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  showRing?: boolean;
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 7) return "text-emerald-400";
  if (score >= 5) return "text-yellow-400";
  return "text-red-400";
}

function getScoreGradient(score: number): { start: string; end: string } {
  if (score >= 7) return { start: "#34d399", end: "#10b981" };
  if (score >= 5) return { start: "#fbbf24", end: "#f59e0b" };
  return { start: "#f87171", end: "#ef4444" };
}

function getTrailColor(score: number): string {
  if (score >= 7) return "rgba(52, 211, 153, 0.15)";
  if (score >= 5) return "rgba(251, 191, 36, 0.15)";
  return "rgba(248, 113, 113, 0.15)";
}

const sizeMap = {
  sm: { container: "size-16", text: "text-lg", label: "text-[10px]", stroke: 4 },
  md: { container: "size-24", text: "text-2xl", label: "text-xs", stroke: 5 },
  lg: { container: "size-32", text: "text-4xl", label: "text-sm", stroke: 6 },
  xl: { container: "size-44", text: "text-5xl", label: "text-base", stroke: 7 },
};

export function ScoreDisplay({
  score,
  maxScore = 10,
  size = "md",
  label,
  showRing = true,
  className,
}: ScoreDisplayProps) {
  const normalized = Math.min(Math.max(score, 0), maxScore);
  const percentage = (normalized / maxScore) * 100;
  const gradient = getScoreGradient(normalized);
  const s = sizeMap[size];

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const gradientId = `score-gradient-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <div className={cn("relative", s.container)}>
        {showRing && (
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 -rotate-90"
            style={{ width: "100%", height: "100%" }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={gradient.start} />
                <stop offset="100%" stopColor={gradient.end} />
              </linearGradient>
            </defs>
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={getTrailColor(normalized)}
              strokeWidth={s.stroke}
            />
            {/* Score ring */}
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={s.stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            />
          </svg>
        )}
        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={cn("font-bold", s.text, getScoreColor(normalized))}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {normalized.toFixed(1)}
          </motion.span>
          {label && (
            <span className={cn("text-muted-foreground mt-0.5", s.label)}>
              {label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface ScoreBarProps {
  score: number;
  maxScore?: number;
  label: string;
  className?: string;
}

export function ScoreBar({ score, maxScore = 10, label, className }: ScoreBarProps) {
  const normalized = Math.min(Math.max(score, 0), maxScore);
  const percentage = (normalized / maxScore) * 100;
  const gradient = getScoreGradient(normalized);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-semibold", getScoreColor(normalized))}>
          {normalized.toFixed(1)}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${gradient.start}, ${gradient.end})`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
        />
      </div>
    </div>
  );
}
