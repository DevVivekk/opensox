import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";
import type { Metadata } from "next";

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
    <main className="min-h-screen bg-background text-foreground">
      <article className="max-w-2xl mx-auto px-6 py-20">
        <Link
          href="/blog"
          className="text-sm text-text-muted hover:text-foreground transition-colors"
        >
          &larr; Blog
        </Link>

        <header className="mt-8 mb-10">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold leading-tight">
            {post.frontmatter.title}
          </h1>
          <div className="flex items-center gap-3 mt-4 text-sm text-text-muted">
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
          <div className="mt-12 pt-8 border-t border-border">
            <Link
              href={post.frontmatter.tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-full text-text-muted hover:text-foreground hover:border-text-muted transition-colors"
            >
              View original thread on X &rarr;
            </Link>
          </div>
        )}
      </article>
    </main>
  );
}
