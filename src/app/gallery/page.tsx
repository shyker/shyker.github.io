import Link from "next/link";

const galleryItems = [
  {
    slug: "moon-tree",
    title: "Moon Tree",
    image: "/image/gallery/moon-tree-red.png",
  },
  {
    slug: "electric-guitar",
    title: "Astra X1 Electric Guitar",
    image: "/image/gallery/electric-guitar-red.png",
  },
  {
    slug: "colosseum",
    title: "Colosseum",
    image: "/image/gallery/colosseum/colosseum-thumb.png",
  },
  {
    slug: "velorah",
    title: "Velorah",
    image: "",
    fallback: "Velorah",
  },
  {
    slug: "space-travel",
    title: "Cinematic Space Travel",
    image: "",
    fallback: "Aeon",
  },
  {
    slug: "mythic-naturecore",
    title: "Mythic Naturecore",
    image: "",
    fallback: "Mythic",
  },
];

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-[#000488] px-6 py-16 text-white">
      <div className="mx-auto grid w-full max-w-5xl gap-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-white/40">
              Frontend Gallery
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal">
              Gallery
            </h1>
          </div>
          <Link className="text-sm text-white/50 transition hover:text-white" href="/">
            Home
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {galleryItems.map((item) => (
            <Link
              className="group overflow-hidden rounded-sm border border-white/10 bg-white/[0.03]"
              href={`/gallery/${item.slug}`}
              key={item.slug}
            >
              {item.image ? (
                <div
                  className="aspect-video bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-[#002942] transition duration-500 group-hover:scale-[1.03]">
                  <span className="font-serif text-5xl tracking-tight text-white">
                    {item.fallback}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium">{item.title}</span>
                <span className="text-xs uppercase tracking-[0.24em] text-white/35 group-hover:text-white/70">
                  Open
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
