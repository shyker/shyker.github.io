import { notFound } from "next/navigation";
import { ColosseumScene } from "@/components/gallery/ColosseumScene";
import { ElectricGuitarProduct } from "@/components/gallery/ElectricGuitarProduct";
import { MoonTreeScene } from "@/components/gallery/MoonTreeScene";
import { MythicNaturecore } from "@/components/gallery/MythicNaturecore";
import { SpaceTravelLanding } from "@/components/gallery/SpaceTravelLanding";
import { VelorahHero } from "@/components/gallery/VelorahHero";

const pages = {
  "moon-tree": {
    title: "Moon Tree",
  },
  "electric-guitar": {
    title: "Astra X1 Electric Guitar",
  },
  colosseum: {
    title: "Colosseum",
  },
  velorah: {
    title: "Velorah",
  },
  "space-travel": {
    title: "Cinematic Space Travel",
  },
  "mythic-naturecore": {
    title: "Mythic Naturecore",
  },
};

type GallerySlug = keyof typeof pages;

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = pages[slug as GallerySlug];

  return {
    title: page ? `${page.title} | Gallery` : "Gallery",
  };
}

export default async function GallerySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug === "moon-tree") {
    return <MoonTreeScene />;
  }

  if (slug === "electric-guitar") {
    return <ElectricGuitarProduct />;
  }

  if (slug === "colosseum") {
    return <ColosseumScene />;
  }

  if (slug === "velorah") {
    return <VelorahHero />;
  }

  if (slug === "space-travel") {
    return <SpaceTravelLanding />;
  }

  if (slug === "mythic-naturecore") {
    return <MythicNaturecore />;
  }

  notFound();
}
