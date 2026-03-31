import { connectDB } from "@/lib/mongodb";
import College from "@/lib/models/College";
import Post from "@/lib/models/Post";
import { CollegeDetailClient } from "./college-detail-client";

export interface CategoryScore {
  score: number;
  positive: number;
  negative: number;
  neutral: number;
}

export interface Post {
  id: string;
  content: string;
  category: string;
  sentiment: "positive" | "negative" | "neutral";
  source: string;
  date: string;
  author: string;
  upvotes: number;
}

export interface CollegeData {
  slug: string;
  name: string;
  fullName: string;
  city: string;
  state: string;
  type: string;
  established: number;
  overallScore: number;
  totalPosts: number;
  categoryScores: Record<string, CategoryScore>;
  sourceCounts: Record<string, number>;
  posts: Post[];
  relatedColleges: { slug: string; name: string; score: number }[];
}

// Map DB category names to UI category keys
const catDbToUi: Record<string, string> = {
  placements: "placements",
  hostel: "hostel",
  mess: "hostel",
  professors: "professors",
  mentalHealth: "mental-health",
  campusLife: "campus-life",
  sports: "sports",
  restrictions: "restrictions",
  infrastructure: "infrastructure",
};

const catPostToUi: Record<string, string> = {
  PLACEMENTS: "placements",
  HOSTEL_MESS: "hostel",
  PROFESSORS: "professors",
  MENTAL_HEALTH: "mental-health",
  CAMPUS_LIFE: "campus-life",
  SPORTS: "sports",
  RESTRICTIONS: "restrictions",
  INFRASTRUCTURE: "infrastructure",
  NEWS_CONTROVERSY: "news",
};

export default async function CollegeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  await connectDB();

  const collegeDoc = await College.findOne({ slug }).lean();

  if (!collegeDoc) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">College Not Found</h1>
          <p className="text-muted-foreground">
            We don&apos;t have data for this college yet.
          </p>
          <a
            href="/"
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  // Fetch posts
  const posts = await Post.find({ collegeSlug: slug, isApproved: true })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  // Build category scores from DB
  const categoryScores: Record<string, CategoryScore> = {};
  const cats = (collegeDoc as any).categories || {};
  for (const [dbKey, uiKey] of Object.entries(catDbToUi)) {
    const cat = cats[dbKey];
    if (cat && cat.score > 0) {
      const catPosts = posts.filter(
        (p: any) => catPostToUi[p.category] === uiKey
      );
      const pos = catPosts.filter((p: any) => p.sentiment === "POSITIVE").length;
      const neg = catPosts.filter((p: any) => p.sentiment === "NEGATIVE").length;
      const neu = catPosts.filter((p: any) => p.sentiment === "NEUTRAL").length;
      categoryScores[uiKey] = {
        score: cat.score,
        positive: pos,
        negative: neg,
        neutral: neu,
      };
    }
  }

  // Build source counts
  const sourceCounts: Record<string, number> = {};
  for (const p of posts) {
    const src = (p as any).source || "reddit";
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  }

  // Transform posts
  const transformedPosts: Post[] = posts.map((p: any) => ({
    id: p._id.toString(),
    content: p.content,
    category: catPostToUi[p.category] || "campus-life",
    sentiment: (p.sentiment || "NEUTRAL").toLowerCase() as "positive" | "negative" | "neutral",
    source: p.source || "reddit",
    date: p.createdAt
      ? new Date(p.createdAt).toISOString().split("T")[0]
      : "2025-01-01",
    author: p.author || "Anonymous",
    upvotes: p.upvotes || 0,
  }));

  // Get related colleges (same type or state, different slug)
  const related = await College.find({
    slug: { $ne: slug },
    $or: [
      { type: (collegeDoc as any).type },
      { state: (collegeDoc as any).state },
    ],
  })
    .limit(3)
    .lean();

  const collegeData: CollegeData = {
    slug: (collegeDoc as any).slug,
    name: (collegeDoc as any).name,
    fullName: (collegeDoc as any).description || (collegeDoc as any).name,
    city: (collegeDoc as any).city,
    state: (collegeDoc as any).state,
    type: (collegeDoc as any).type,
    established: (collegeDoc as any).established || 0,
    overallScore: (collegeDoc as any).overallScore || 0,
    totalPosts: (collegeDoc as any).totalPosts || 0,
    categoryScores,
    sourceCounts,
    posts: transformedPosts,
    relatedColleges: related.map((r: any) => ({
      slug: r.slug,
      name: r.name,
      score: r.overallScore || 0,
    })),
  };

  return <CollegeDetailClient college={collegeData} />;
}
