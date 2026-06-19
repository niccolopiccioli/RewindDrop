import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

function esc(value: string) {
  return value.replace(/'/g, "''");
}

function sqlVal(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  if (typeof v === "number") return String(v);
  if (typeof v === "object" && v !== null && "toString" in v && "toFixed" in v) {
    return String(v);
  }
  if (v instanceof Date) return `'${v.toISOString()}'`;
  if (Array.isArray(v)) {
    if (v.length === 0) return "ARRAY[]::text[]";
    return `ARRAY[${v.map((x) => `'${esc(String(x))}'`).join(",")}]::text[]`;
  }
  if (typeof v === "object") return `'${esc(JSON.stringify(v))}'::jsonb`;
  return `'${esc(String(v))}'`;
}

async function main() {
  const categories = await prisma.category.findMany();
  const products = await prisma.product.findMany({
    include: { images: true, variants: true },
  });
  const users = await prisma.user.findMany();
  const addresses = await prisma.address.findMany();
  const orders = await prisma.order.findMany({ include: { items: true } });
  const reviews = await prisma.review.findMany();
  const subscribers = await prisma.newsletterSubscriber.findMany();

  const lines: string[] = [
    "TRUNCATE \"OrderItem\", \"Order\", \"Review\", \"Address\", \"Wishlist\", \"CartItem\", \"Cart\", \"Variant\", \"Image\", \"Product\", \"Category\", \"NewsletterSubscriber\", \"Account\", \"Session\", \"User\" CASCADE;",
  ];

  for (const u of users) {
    lines.push(
      `INSERT INTO "User" (id,email,name,password,role,image,"emailVerified","createdAt","updatedAt") VALUES (${sqlVal(u.id)},${sqlVal(u.email)},${sqlVal(u.name)},${sqlVal(u.password)},${sqlVal(u.role)},${sqlVal(u.image)},${sqlVal(u.emailVerified)},${sqlVal(u.createdAt)},${sqlVal(u.updatedAt)});`
    );
  }

  for (const c of categories) {
    lines.push(
      `INSERT INTO "Category" (id,name,slug,description,image,"parentId","createdAt","updatedAt") VALUES (${sqlVal(c.id)},${sqlVal(c.name)},${sqlVal(c.slug)},${sqlVal(c.description)},${sqlVal(c.image)},${sqlVal(c.parentId)},${sqlVal(c.createdAt)},${sqlVal(c.updatedAt)});`
    );
  }

  for (const p of products) {
    lines.push(
      `INSERT INTO "Product" (id,name,slug,description,price,"comparePrice",sku,barcode,weight,featured,active,tags,"categoryId","createdAt","updatedAt") VALUES (${sqlVal(p.id)},${sqlVal(p.name)},${sqlVal(p.slug)},${sqlVal(p.description)},${sqlVal(p.price)},${sqlVal(p.comparePrice)},${sqlVal(p.sku)},${sqlVal(p.barcode)},${sqlVal(p.weight)},${sqlVal(p.featured)},${sqlVal(p.active)},${sqlVal(p.tags)},${sqlVal(p.categoryId)},${sqlVal(p.createdAt)},${sqlVal(p.updatedAt)});`
    );
    for (const img of p.images) {
      lines.push(
        `INSERT INTO "Image" (id,url,alt,position,"productId") VALUES (${sqlVal(img.id)},${sqlVal(img.url)},${sqlVal(img.alt)},${sqlVal(img.position)},${sqlVal(img.productId)});`
      );
    }
    for (const v of p.variants) {
      lines.push(
        `INSERT INTO "Variant" (id,name,sku,size,color,"colorHex",price,stock,weight,active,"productId") VALUES (${sqlVal(v.id)},${sqlVal(v.name)},${sqlVal(v.sku)},${sqlVal(v.size)},${sqlVal(v.color)},${sqlVal(v.colorHex)},${sqlVal(v.price)},${sqlVal(v.stock)},${sqlVal(v.weight)},${sqlVal(v.active)},${sqlVal(v.productId)});`
      );
    }
  }

  for (const a of addresses) {
    lines.push(
      `INSERT INTO "Address" (id,"userId",name,street,street2,city,province,"postalCode",country,phone,"isDefault") VALUES (${sqlVal(a.id)},${sqlVal(a.userId)},${sqlVal(a.name)},${sqlVal(a.street)},${sqlVal(a.street2)},${sqlVal(a.city)},${sqlVal(a.province)},${sqlVal(a.postalCode)},${sqlVal(a.country)},${sqlVal(a.phone)},${sqlVal(a.isDefault)});`
    );
  }

  for (const o of orders) {
    lines.push(
      `INSERT INTO "Order" (id,number,"userId",status,subtotal,shipping,tax,total,currency,"shippingAddr","billingAddr","paymentIntent","paymentMethod",notes,"createdAt","updatedAt") VALUES (${sqlVal(o.id)},${sqlVal(o.number)},${sqlVal(o.userId)},${sqlVal(o.status)},${sqlVal(o.subtotal)},${sqlVal(o.shipping)},${sqlVal(o.tax)},${sqlVal(o.total)},${sqlVal(o.currency)},${sqlVal(o.shippingAddr)},${sqlVal(o.billingAddr)},${sqlVal(o.paymentIntent)},${sqlVal(o.paymentMethod)},${sqlVal(o.notes)},${sqlVal(o.createdAt)},${sqlVal(o.updatedAt)});`
    );
    for (const item of o.items) {
      lines.push(
        `INSERT INTO "OrderItem" (id,"orderId","productId","variantId",name,sku,quantity,price,total) VALUES (${sqlVal(item.id)},${sqlVal(item.orderId)},${sqlVal(item.productId)},${sqlVal(item.variantId)},${sqlVal(item.name)},${sqlVal(item.sku)},${sqlVal(item.quantity)},${sqlVal(item.price)},${sqlVal(item.total)});`
      );
    }
  }

  for (const r of reviews) {
    lines.push(
      `INSERT INTO "Review" (id,rating,title,comment,"userId","productId",approved,"createdAt","updatedAt") VALUES (${sqlVal(r.id)},${sqlVal(r.rating)},${sqlVal(r.title)},${sqlVal(r.comment)},${sqlVal(r.userId)},${sqlVal(r.productId)},${sqlVal(r.approved)},${sqlVal(r.createdAt)},${sqlVal(r.updatedAt)});`
    );
  }

  for (const s of subscribers) {
    lines.push(
      `INSERT INTO "NewsletterSubscriber" (id,email,"createdAt") VALUES (${sqlVal(s.id)},${sqlVal(s.email)},${sqlVal(s.createdAt)});`
    );
  }

  process.stdout.write(lines.join("\n"));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
