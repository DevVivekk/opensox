import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";
import type { Metadata } from "next";
import BlogThemeSelector from "../blog-theme";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.frontmatter.title} - Opensox Blog`,
    description: post.frontmatter.description,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const date = new Date(post.frontmatter.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <main className="blog-page min-h-screen">
      <article className="max-w-2xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between">
          <Link
            href="/blog"
            className="text-sm blog-link transition-colors"
          >
            &larr; Blog
          </Link>
          <BlogThemeSelector />
        </div>

        <header className="mt-8 mb-10">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold leading-tight">
            {post.frontmatter.title}
          </h1>
          <div className="flex items-center gap-3 mt-4 text-sm blog-text-muted">
            <span>{post.frontmatter.author}</span>
            <span>&middot;</span>
            <time>{date}</time>
          </div>
        </header>

        <div
          className="prose-blog"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {post.frontmatter.tweetUrl && (
          <div className="mt-12 pt-8 border-t blog-border">
            <Link
              href={post.frontmatter.tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border rounded-full blog-link transition-colors"
            >
              View original thread on X &rarr;
            </Link>
          </div>
        )}
      </article>
    </main>
  );
}
