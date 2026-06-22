import ProductMarquee, {
  type HomeCarouselProduct,
} from "@/components/home/product-marquee";

export type { HomeCarouselProduct };

export default function ProductCarouselSection({
  title,
  href,
  products,
  badge,
  reverse = false,
  variant = "light",
}: {
  title: string;
  href: string;
  products: HomeCarouselProduct[];
  badge?: "new" | "sale" | null;
  reverse?: boolean;
  variant?: "light" | "dark";
}) {
  return (
    <ProductMarquee
      title={title}
      href={href}
      products={products}
      badge={badge}
      reverse={reverse}
      variant={variant}
    />
  );
}
