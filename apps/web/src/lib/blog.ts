import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

export type BlogTag = "engineering" | "startup" | "distribution" | "misc";

export interface BlogFrontmatter {
  title: string;
  date: string;
  description: string;
  author: string;
  tag: BlogTag;
  tweetUrl?: string;
  draft?: boolean;
}

export interface BlogMeta extends BlogFrontmatter {
  slug: string;
}

export function getAllPosts(): BlogMeta[] {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  const posts = files
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8");
      const { data } = matter(raw);

      return {
        slug,
        title: data.title,
        date: data.date,
        description: data.description,
        author: data.author,
        tag: data.tag,
        tweetUrl: data.tweetUrl,
        draft: data.draft,
      } as BlogMeta;
    })
    .filter((post) => !post.draft);

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(slug: string): { frontmatter: BlogFrontmatter; html: string } | null {
  const sanitized = path.basename(slug);
  const filePath = path.join(BLOG_DIR, `${sanitized}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  if (data.draft) return null;
  const rawHtml = marked.parse(content) as string;
  const safeHtml = sanitizeHtml(rawHtml, {
    allowedTags: (sanitizeHtml as any).defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      ...(sanitizeHtml as any).defaults.allowedAttributes,
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
    },
  });
  const html = safeHtml.replace(
    /<a href="([^"]*)">/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">'
  );

  return {
    frontmatter: data as BlogFrontmatter,
    html,
  };
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .filter((f) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, f), "utf-8");
      const { data } = matter(raw);
      return !data.draft;
    })
    .map((f) => f.replace(/\.mdx$/, ""));
}
