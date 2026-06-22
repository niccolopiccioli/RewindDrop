import Link from "next/link";
import MediaImage from "@/components/ui/media-image";
import type { ImageFit } from "@/lib/image-fit";
import { normalizeImageFit } from "@/lib/image-fit";

export default function EditorialBanner({
  title,
  subtitle,
  href,
  image,
  imageAlt,
  objectFit,
  className = "",
}: {
  title: string;
  subtitle?: string;
  href: string;
  image?: string | null;
  imageAlt: string;
  objectFit?: ImageFit | string | null;
  className?: string;
}) {
  const fit = normalizeImageFit(objectFit);

  return (
    <Link
      href={href}
      className={`group relative block overflow-hidden bg-surface aspect-[3/4] md:aspect-[4/5] ${className}`}
    >
      <MediaImage
        src={image}
        alt={imageAlt}
        fill
        fit={fit}
        imageWidth={900}
        loading="lazy"
        className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        sizes="(max-width: 768px) 100vw, 50vw"
        iconClassName="w-10 h-10"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <h3 className="text-display text-lg md:text-xl font-semibold text-white mb-1">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-white/70">{subtitle}</p>
        )}
      </div>
    </Link>
  );
}
