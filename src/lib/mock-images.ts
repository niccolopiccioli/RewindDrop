/** Curated Unsplash URLs for demo / seed data (streetwear, designer-style apparel). */

const unsplash = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1743764180148-b712e5293800?w=1920&h=1200&fit=crop&crop=entropy&q=80&auto=format";

export const CATEGORY_IMAGES = {
  "t-shirts": unsplash("photo-1583743814966-8936f5b7be1a"),
  felpe: unsplash("photo-1556828686-fc7a0d657fb1"),
  pantaloni: unsplash("photo-1624378515194-6bbdb73f2194"),
  cappelli: unsplash("photo-1521369909029-2afed882baee"),
  borse: unsplash("photo-1590874103328-eac38a683ce7"),
  giacche: unsplash("photo-1603189343302-e603f7add05a"),
  sneakers: unsplash("photo-1542291026-7eec264c27ff"),
} as const;

export type CategoryImageKey = keyof typeof CATEGORY_IMAGES;

export const EDITORIAL_IMAGES = {
  felpe: unsplash("photo-1742237424056-ea5cbb674d66", 1200),
  tShirts: unsplash("photo-1743764179699-d3038d1a93e7", 1200),
  giacche: unsplash("photo-1603189343302-e603f7add05a", 1200),
  lookbook: unsplash("photo-1574015974293-817f0ebebb74", 1200),
  details: unsplash("photo-1485518882345-15568b007407", 1200),
} as const;

/** Capi stile firmato / logo visibile — solo immagini demo Unsplash. */
const BRANDED_PRODUCT_POOL: Record<CategoryImageKey, string[]> = {
  "t-shirts": [
    unsplash("photo-1583743814966-8936f5b7be1a"),
    unsplash("photo-1622445275463-606ca54f9fab"),
    unsplash("photo-1576566588028-4147f3842f27"),
    unsplash("photo-1521572163474-6864f9cf17ab"),
    unsplash("photo-1618354691373-d851c5c3f990"),
    unsplash("photo-1581655353564-df123a1eb820"),
    unsplash("photo-1503341504253-dff4815485f1"),
    unsplash("photo-1562157873-818bc072bf37"),
  ],
  felpe: [
    unsplash("photo-1556828686-fc7a0d657fb1"),
    unsplash("photo-1611312449504-5377fdf0b4f9"),
    unsplash("photo-1620799140408-edc6dcb6d633"),
    unsplash("photo-1578587018452-892b134fd8cf"),
    unsplash("photo-1556821840-3a63f95609a7"),
    unsplash("photo-1602810318383-e386cc2a3bf0"),
  ],
  pantaloni: [
    unsplash("photo-1624378515194-6bbdb73f2194"),
    unsplash("photo-1594938298603-c8148c4dae35"),
    unsplash("photo-1542272604-787c3835535d"),
    unsplash("photo-1473966968600-fa801b869a1a"),
    unsplash("photo-1541099649105-f69ad21f3246"),
  ],
  cappelli: [
    unsplash("photo-1521369909029-2afed882baee"),
    unsplash("photo-1575428652377-2c5d2a264e36"),
    unsplash("photo-1588850561407-ed78c282e89b"),
    unsplash("photo-1514325602697-e1694dd97527"),
    unsplash("photo-1556306535-0f09f537fc0a"),
  ],
  borse: [
    unsplash("photo-1590874103328-eac38a683ce7"),
    unsplash("photo-1548036328-d9bbdebd27f0"),
    unsplash("photo-1564422176142-7b1d55fa7cc6"),
    unsplash("photo-1622560480654-d9623fdc25eb"),
    unsplash("photo-1553062407-98eeb64c6a62"),
  ],
  giacche: [
    unsplash("photo-1544022613-e87ca75a784f"),
    unsplash("photo-1591047139829-d91aecb6caea"),
    unsplash("photo-1551028719-00167b16eac5"),
    unsplash("photo-1521227750158-454ac75fe1fd"),
    unsplash("photo-1495105787525-993b8d242259"),
    unsplash("photo-1591047139829-d91aecb6caea", 900),
  ],
  sneakers: [
    unsplash("photo-1542291026-7eec264c27ff"),
    unsplash("photo-1606107557195-0e29a4b5b4aa"),
    unsplash("photo-1608231387042-66d1773070a5"),
    unsplash("photo-1595950653106-6c9ebd614d3a"),
    unsplash("photo-1460353581641-37baddab0fa2"),
    unsplash("photo-1556906781-9a412961c28c"),
  ],
};

const PRODUCT_POOL = BRANDED_PRODUCT_POOL;

export function getProductImageUrl(
  category: CategoryImageKey,
  index: number
): string {
  const pool = PRODUCT_POOL[category];
  return pool[index % pool.length];
}

export function getBrandedProductImageUrl(
  category: CategoryImageKey,
  index: number
): string {
  return getProductImageUrl(category, index);
}
