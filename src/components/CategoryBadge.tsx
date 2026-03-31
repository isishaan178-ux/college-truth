import { cn } from "@/lib/utils";
import {
  Briefcase,
  Building2,
  Users,
  Brain,
  PartyPopper,
  Dumbbell,
  ShieldAlert,
  Landmark,
  Newspaper,
} from "lucide-react";

export type CategoryType =
  | "placements"
  | "hostel"
  | "professors"
  | "mental-health"
  | "campus-life"
  | "sports"
  | "restrictions"
  | "infrastructure"
  | "news";

const categoryConfig: Record<
  CategoryType,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  placements: {
    label: "Placements",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15 border-emerald-500/30",
    icon: Briefcase,
  },
  hostel: {
    label: "Hostel & Mess",
    color: "text-orange-400",
    bg: "bg-orange-500/15 border-orange-500/30",
    icon: Building2,
  },
  professors: {
    label: "Professors",
    color: "text-blue-400",
    bg: "bg-blue-500/15 border-blue-500/30",
    icon: Users,
  },
  "mental-health": {
    label: "Mental Health",
    color: "text-purple-400",
    bg: "bg-purple-500/15 border-purple-500/30",
    icon: Brain,
  },
  "campus-life": {
    label: "Campus Life",
    color: "text-pink-400",
    bg: "bg-pink-500/15 border-pink-500/30",
    icon: PartyPopper,
  },
  sports: {
    label: "Sports",
    color: "text-cyan-400",
    bg: "bg-cyan-500/15 border-cyan-500/30",
    icon: Dumbbell,
  },
  restrictions: {
    label: "Restrictions",
    color: "text-red-400",
    bg: "bg-red-500/15 border-red-500/30",
    icon: ShieldAlert,
  },
  infrastructure: {
    label: "Infrastructure",
    color: "text-amber-400",
    bg: "bg-amber-500/15 border-amber-500/30",
    icon: Landmark,
  },
  news: {
    label: "News & Controversies",
    color: "text-rose-400",
    bg: "bg-rose-500/15 border-rose-500/30",
    icon: Newspaper,
  },
};

interface CategoryBadgeProps {
  category: CategoryType;
  showIcon?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function CategoryBadge({
  category,
  showIcon = true,
  size = "sm",
  className,
}: CategoryBadgeProps) {
  const config = categoryConfig[category];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        config.bg,
        config.color,
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
    >
      {showIcon && (
        <Icon className={size === "sm" ? "size-3" : "size-4"} />
      )}
      {config.label}
    </span>
  );
}

export { categoryConfig };
