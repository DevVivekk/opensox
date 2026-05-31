"use client";

import { useState } from "react";
import Link from "next/link";
import type { BlogMeta, BlogTag } from "@/lib/blog";

const tags: BlogTag[] = ["engineering", "startup", "distribution", "misc"];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function BlogList({ posts }: { posts: BlogMeta[] }) {
  const [activeTag, setActiveTag] = useState<BlogTag | null>(null);

  const filtered = activeTag
    ? posts.filter((p) => p.tag === activeTag)
    : posts;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <header className="mb-12">
          <Link
            href="/"
            className="text-sm text-text-muted hover:text-foreground transition-colors"
          >
            &larr; Home
          </Link>
          <h1 className="font-heading text-4xl font-bold mt-6">
            Opensox Blog
          </h1>
          <p className="text-text-secondary mt-2">
            Thoughts on open source, startups, and building in public.
          </p>
        </header>

        {/* Tag filters */}
        <div className="flex gap-2 mb-10 flex-wrap">
          <button
            onClick={() => setActiveTag(null)}
            aria-pressed={activeTag === null}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              activeTag === null
                ? "border-brand-purple text-brand-purple"
                : "border-border text-text-muted hover:text-foreground hover:border-text-muted"
            }`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              aria-pressed={activeTag === tag}
              className={`px-3 py-1 text-sm rounded-full border transition-colors capitalize ${
                activeTag === tag
                  ? "border-brand-purple text-brand-purple"
                  : "border-border text-text-muted hover:text-foreground hover:border-text-muted"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Blog list */}
        <div className="flex flex-col">
          {filtered.length === 0 ? (
            <p className="text-text-muted py-8">No posts found.</p>
          ) : (
            filtered.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group py-5 border-b border-border first:border-t"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-heading text-lg font-medium text-foreground group-hover:text-brand-purple transition-colors">
                    {post.title}
                  </h2>
                  <time className="text-sm text-text-muted whitespace-nowrap font-mono">
                    {formatDate(post.date)}
                  </time>
                </div>
                <p className="text-text-secondary text-sm mt-1.5 line-clamp-2">
                  {post.description}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
