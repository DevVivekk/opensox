import { getAllPosts } from "@/lib/blog";
import type { Metadata } from "next";
import BlogList from "./blog-list";

export const metadata: Metadata = {
  title: "Opensox Blog",
  description: "Thoughts on open source, startups, and building in public.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return <BlogList posts={posts} />;
}
