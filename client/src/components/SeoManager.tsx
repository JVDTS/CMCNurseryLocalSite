import { useEffect } from "react";
import { useLocation } from "wouter";

type SeoConfig = {
  title: string;
  description: string;
};

type NurseryStructuredData = {
  name: string;
  path: string;
  streetAddress: string;
  addressLocality: string;
  postalCode: string;
  telephone: string;
};

const defaultSeo: SeoConfig = {
  title: "Coat of Many Colours Nursery",
  description: "Coat of Many Colours Nursery provides nurturing childcare and early years education across Hayes, Uxbridge, and Hounslow.",
};

const seoByPath: Record<string, SeoConfig> = {
  "/": {
    title: "Coat of Many Colours Nursery | Early Years Childcare",
    description: "Explore Coat of Many Colours Nursery and discover trusted childcare, early learning, and parent support across our nursery locations.",
  },
  "/about": {
    title: "About Us | Coat of Many Colours Nursery",
    description: "Learn about our story, values, leadership team, and commitment to outstanding early years education.",
  },
  "/mission": {
    title: "Our Mission & Vision | Coat of Many Colours Nursery",
    description: "See the mission, vision, and educational approach that guide our nurseries and support every child’s development.",
  },
  "/newsletters": {
    title: "Nursery Newsletters | Coat of Many Colours Nursery",
    description: "Read the latest nursery newsletters, updates, activities, and announcements from all our locations.",
  },
  "/gallery": {
    title: "Nursery Gallery | Coat of Many Colours Nursery",
    description: "View photos from nursery activities, learning spaces, and special events across our settings.",
  },
  "/nurseries/hayes": {
    title: "Hayes Nursery | Coat of Many Colours Nursery",
    description: "Discover our Hayes nursery, facilities, events, and childcare approach for children aged 0 to 5.",
  },
  "/nurseries/uxbridge": {
    title: "Uxbridge Nursery | Coat of Many Colours Nursery",
    description: "Discover our Uxbridge nursery, facilities, events, and childcare approach for children aged 0 to 5.",
  },
  "/nurseries/hounslow": {
    title: "Hounslow Nursery | Coat of Many Colours Nursery",
    description: "Discover our Hounslow nursery, facilities, events, and childcare approach for children aged 0 to 5.",
  },
  "/parent-info/policies": {
    title: "Nursery Policies | Coat of Many Colours Nursery",
    description: "Access key nursery policies and guidance for families at Coat of Many Colours Nursery.",
  },
  "/parent-info/daily-routine": {
    title: "Daily Routine | Coat of Many Colours Nursery",
    description: "See a typical nursery day and how routines support learning, wellbeing, and child development.",
  },
  "/parent-info/sample-menu": {
    title: "Sample Menu | Coat of Many Colours Nursery",
    description: "View example nursery menus and our approach to healthy meals and nutrition for young children.",
  },
  "/parent-info/term-dates": {
    title: "Term Dates | Coat of Many Colours Nursery",
    description: "Find term dates, opening schedules, and holiday closures for our nurseries.",
  },
  "/parent-info/fees": {
    title: "Nursery Fees | Coat of Many Colours Nursery",
    description: "See transparent nursery fees, funding information, and payment details for families.",
  },
  "/parent-info/special-education-needs": {
    title: "Special Education Needs | Coat of Many Colours Nursery",
    description: "Learn about inclusive support and SEN provision at Coat of Many Colours Nursery.",
  },
};

const nurseryStructuredDataByPath: Record<string, NurseryStructuredData> = {
  "/nurseries/hayes": {
    name: "Coat of Many Colours Nursery - Hayes",
    path: "/nurseries/hayes",
    streetAddress: "192 Church Road",
    addressLocality: "Hayes",
    postalCode: "UB3 2LT",
    telephone: "+44 1895 272885",
  },
  "/nurseries/uxbridge": {
    name: "Coat of Many Colours Nursery - Uxbridge",
    path: "/nurseries/uxbridge",
    streetAddress: "4 New Windsor Street",
    addressLocality: "Uxbridge",
    postalCode: "UB8 2TU",
    telephone: "+44 1895 272885",
  },
  "/nurseries/hounslow": {
    name: "Coat of Many Colours Nursery - Hounslow",
    path: "/nurseries/hounslow",
    streetAddress: "488, 490 Great West Rd",
    addressLocality: "Hounslow",
    postalCode: "TW5 0TA",
    telephone: "+44 1895 272885",
  },
};

function normalizePath(path: string): string {
  if (!path) return "/";
  const cleanPath = path.split("?")[0].split("#")[0];
  if (cleanPath.length > 1 && cleanPath.endsWith("/")) {
    return cleanPath.slice(0, -1);
  }
  return cleanPath;
}

function setMeta(selector: string, attrs: Record<string, string>) {
  let meta = document.head.querySelector<HTMLMetaElement>(selector);
  if (!meta) {
    meta = document.createElement("meta");
    if (attrs.name) meta.setAttribute("name", attrs.name);
    if (attrs.property) meta.setAttribute("property", attrs.property);
    document.head.appendChild(meta);
  }

  Object.entries(attrs).forEach(([key, value]) => {
    meta!.setAttribute(key, value);
  });
}

function setCanonical(url: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

function setStructuredData(scriptId: string, schema: Record<string, unknown> | null) {
  const existingScript = document.getElementById(scriptId);

  if (!schema) {
    if (existingScript) {
      existingScript.remove();
    }
    return;
  }

  const script = existingScript ?? document.createElement("script");
  script.setAttribute("id", scriptId);
  script.setAttribute("type", "application/ld+json");
  script.textContent = JSON.stringify(schema);

  if (!existingScript) {
    document.head.appendChild(script);
  }
}

export default function SeoManager() {
  const [location] = useLocation();

  useEffect(() => {
    const path = normalizePath(location);
    const seo = seoByPath[path] ?? defaultSeo;

    const siteUrl = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || window.location.origin;
    const canonicalUrl = `${siteUrl}${path === "/" ? "" : path}`;
    const imageUrl = `${siteUrl}/images/cmc-logo.png`;
    const isAdminRoute = path.startsWith("/admin") || path.startsWith("/admin-old") || path === "/view-contact-submissions";
    const nurseryData = nurseryStructuredDataByPath[path];

    document.title = seo.title;

    setMeta('meta[name="description"]', { name: "description", content: seo.description });
    setMeta('meta[name="robots"]', {
      name: "robots",
      content: isAdminRoute ? "noindex, nofollow" : "index, follow",
    });

    setMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    setMeta('meta[property="og:title"]', { property: "og:title", content: seo.title });
    setMeta('meta[property="og:description"]', { property: "og:description", content: seo.description });
    setMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    setMeta('meta[property="og:image"]', { property: "og:image", content: imageUrl });

    setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: seo.title });
    setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: seo.description });
    setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: imageUrl });

    setCanonical(canonicalUrl);

    if (nurseryData) {
      setStructuredData("structured-data-childcare", {
        "@context": "https://schema.org",
        "@type": "ChildCare",
        "name": nurseryData.name,
        "url": `${siteUrl}${nurseryData.path}`,
        "image": imageUrl,
        "telephone": nurseryData.telephone,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": nurseryData.streetAddress,
          "addressLocality": nurseryData.addressLocality,
          "postalCode": nurseryData.postalCode,
          "addressCountry": "GB",
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
            ],
            "opens": "07:30",
            "closes": "18:00",
          },
        ],
        "sameAs": [
          "https://www.facebook.com/cmcnursery",
          "https://www.instagram.com/cmcnursery/?hl=en-gb",
        ],
      });
    } else {
      setStructuredData("structured-data-childcare", null);
    }

    if (path === "/") {
      setStructuredData("structured-data-organization", {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Coat of Many Colours Nursery",
        "url": siteUrl,
        "logo": imageUrl,
        "image": imageUrl,
        "telephone": "+44 1895 272885",
        "sameAs": [
          "https://www.facebook.com/cmcnursery",
          "https://www.instagram.com/cmcnursery/?hl=en-gb",
        ],
      });
    } else {
      setStructuredData("structured-data-organization", null);
    }
  }, [location]);

  return null;
}
