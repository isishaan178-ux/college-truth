import { cn } from "@/lib/utils";
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";

export type SentimentType = "positive" | "negative" | "neutral";

const sentimentConfig: Record<
  SentimentType,
  { label: string; emoji: string; color: string; bg: string; icon: React.ElementType }
> = {
  positive: {
    label: "Positive",
    emoji: "\u{1F44D}",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    icon: ThumbsUp,
  },
  negative: {
    label: "Negative",
    emoji: "\u{1F44E}",
    color: "text-red-400",
    bg: "bg-red-500/10",
    icon: ThumbsDown,
  },
  neutral: {
    label: "Neutral",
    emoji: "\u{1F610}",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    icon: Minus,
  },
};

interface SentimentIndicatorProps {
  sentiment: SentimentType;
  showLabel?: boolean;
  showEmoji?: boolean;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SentimentIndicator({
  sentiment,
  showLabel = true,
  showEmoji = true,
  showIcon = false,
  size = "sm",
  className,
}: SentimentIndicatorProps) {
  const config = sentimentConfig[sentiment];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        config.color,
        config.bg,
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        size === "lg" && "px-4 py-1.5 text-base",
        className
      )}
    >
      {showEmoji && <span>{config.emoji}</span>}
      {showIcon && <Icon className={size === "sm" ? "size-3" : "size-4"} />}
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

interface SentimentBreakdownProps {
  positive: number;
  negative: number;
  neutral: number;
  className?: string;
}

export function SentimentBreakdown({
  positive,
  negative,
  neutral,
  className,
}: SentimentBreakdownProps) {
  const total = positive + negative + neutral;
  if (total === 0) return null;

  const pPct = Math.round((positive / total) * 100);
  const nPct = Math.round((negative / total) * 100);
  const neuPct = 100 - pPct - nPct;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/5">
        {pPct > 0 && (
          <div
            className="bg-emerald-500 transition-all duration-500"
            style={{ width: `${pPct}%` }}
          />
        )}
        {neuPct > 0 && (
          <div
            className="bg-yellow-500 transition-all duration-500"
            style={{ width: `${neuPct}%` }}
          />
        )}
        {nPct > 0 && (
          <div
            className="bg-red-500 transition-all duration-500"
            style={{ width: `${nPct}%` }}
          />
        )}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span className="text-emerald-400">{positive} positive</span>
        <span className="text-yellow-400">{neutral} neutral</span>
        <span className="text-red-400">{negative} negative</span>
      </div>
    </div>
  );
}
