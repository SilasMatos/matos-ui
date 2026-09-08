"use client";

import { CoverImage } from "@/registry/new-york-v4/ui/cover-image";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

const BOOKS: Array<{
  id: string;
  label: string;
  alt: string;
  src?: string | null;
  sanitize?: boolean;
  placeholder?: string;
}> = [
  {
    id: "gatsby",
    label: "loads",
    alt: "The Great Gatsby",
    src: "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
  },
  {
    id: "mockingbird",
    label: "colour placeholder",
    alt: "To Kill a Mockingbird",
    src: "https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg",
    placeholder: "oklch(0.5 0.1 150)",
  },
  {
    id: "orwell",
    label: "http:// — sanitize on",
    alt: "1984",
    src: "http://books.google.com/books/content?id=kotPYEqx7kMC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    sanitize: true,
  },
  {
    id: "missing",
    label: "no src",
    alt: "The Pale King",
    src: null,
  },
  {
    id: "broken",
    label: "src that 404s",
    alt: "Infinite Jest",
    src: "https://covers.openlibrary.org/b/isbn/0000000000000-L.jpg?default=false",
  },
  {
    id: "brave",
    label: "loads",
    alt: "Brave New World",
    src: "https://covers.openlibrary.org/b/isbn/9780060850524-L.jpg",
  },
];

export default function CoverImageDemo() {
  return (
    <div className="mx-auto w-full max-w-md space-y-8 py-6">
      <div className="grid grid-cols-3 gap-x-4 gap-y-3">
        {BOOKS.map((book) => (
          <figure key={book.id} className="flex flex-col gap-2">
            <CoverImage
              src={book.src}
              alt={book.alt}
              sanitize={book.sanitize}
              placeholder={book.placeholder}
            />
            <figcaption className="text-[11px] text-muted-foreground">
              {book.label}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-muted-foreground text-xs">
          The same missing cover at two depths — the fallback is a surface, so
          it steps with its substrate.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {(
            [
              ["in a card", 1],
              ["in a detail dialog", 4],
            ] as const
          ).map(([label, offset]) => (
            <Elevated key={label} offset={offset} className="rounded-xl p-4">
              <p className="mb-3 font-mono text-[11px] text-muted-foreground">
                {label}
              </p>
              <CoverImage src={null} alt="No cover" className="mx-auto w-20" />
            </Elevated>
          ))}
        </div>
      </div>
    </div>
  );
}
