import { Suspense } from "react";
import DynamicBlog from "./DynamicBlog";

export default function BlogIndexPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#000488]" />}><DynamicBlog /></Suspense>;
}
