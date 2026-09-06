import { Suspense } from "react";
import CategoryArchive from "./CategoryArchive";

export default function CategoryPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#000488]" />}><CategoryArchive /></Suspense>;
}
