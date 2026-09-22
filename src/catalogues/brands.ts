import { asset } from "../app/base";
export type BrandLogo = {
  slug: string;
  title: string;
  path: string;
  website?: string;
  license?: string;
  aliases?: string[];
};
const bundled = [
  "linkedin",
  "facebook",
  "whatsapp",
  "telegram",
  "instagram",
  "youtube",
  "x",
  "microsoft-excel",
  "google-sheets",
];
export function brandSource(brand: BrandLogo) {
  return bundled.includes(brand.slug)
    ? asset(`brand-icons/${brand.slug}.svg`)
    : `https://thesvg.org${brand.path}`;
}
export function defaultBrand(name: string): BrandLogo | undefined {
  const slug = (
    {
      linkedin: "linkedin",
      facebook: "facebook",
      whatsapp: "whatsapp",
      telegram: "telegram",
      instagram: "instagram",
      youtube: "youtube",
      x: "x",
      twitter: "x",
      excel: "microsoft-excel",
      "microsoft excel": "microsoft-excel",
      "google sheets": "google-sheets",
    } as Record<string, string>
  )[name.toLowerCase()];
  return slug
    ? { slug, title: name, path: `/icons/${slug}/default.svg` }
    : undefined;
}
let registry: Promise<BrandLogo[]> | undefined;
export async function findBrand(name: string, website = "") {
  registry ||= fetch(asset("catalogues/brands.json"))
    .then((response) => {
      if (!response.ok) throw new Error("Logo catalogue unavailable");
      return response.json() as Promise<BrandLogo[]>;
    })
    .catch((error) => {
      registry = undefined;
      throw error;
    });
  const brands = await registry;
  const normalized = (s: string) =>
    s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  const host = (url: string) => {
    try {
      return new URL(
        url.includes("://") ? url : `https://${url}`,
      ).hostname.replace(/^(www|web)\./, "");
    } catch {
      return "";
    }
  };
  const domain = host(website);
  const query = normalized(name);
  return (
    brands.find((b) => domain && host(b.website || "") === domain) ||
    brands.find(
      (b) =>
        query &&
        [b.title, b.slug, ...(b.aliases || [])].some(
          (x) => normalized(x) === query,
        ),
    )
  );
}
