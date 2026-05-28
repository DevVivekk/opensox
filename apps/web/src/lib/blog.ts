import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

export type BlogTag = "engineering" | "startup" | "distribution" | "misc";

export interface BlogFrontmatter {
  title: string;
  date: string;
  description: string;
  author: string;
  tag: BlogTag;
}

export interface BlogMeta extends BlogFrontmatter {
  slug: string;
}

export function getAllPosts(): BlogMeta[] {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((filename) => {
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
    } as BlogMeta;
  });

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
  const html = marked.parse(content) as string;

  return {
    frontmatter: data as BlogFrontmatter,
    html,
  };
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}
