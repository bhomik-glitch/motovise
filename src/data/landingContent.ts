export interface NavigationLink {
  label: string;
  href: string;
}

export interface PreviewCard {
  id: string;
  title: string;
  tagline: string;
  price: number;
  image: string;
  tone: "cool" | "warm" | "berry" | "citrus";
}

export interface SolutionCard {
  id: string;
  flavor: string;
  name: string;
  size: string;
  tagline: string;
  badges: readonly string[];
  ingredients: readonly string[];
  ctaLabel: string;
  price: number;
  image: string;
  tone: "cool" | "warm" | "berry";
}

export interface ComparisonRow {
  label: string;
  sip: string;
  drip: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface BlogCard {
  category: string;
  title: string;
  excerpt: string;
  image: string;
}

export const landingContent = {
  announcements: [
    "FREE NEXT-DAY SHIPPING ON ALL ORDERS OVER $100."
  ] as const,
  navigation: {
    brand: "MOTOVISE",
    links: [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/shop" },
      { label: "Products", href: "/products" },
      { label: "About", href: "/about" },
      { label: "FAQ", href: "/faq" }
    ] as const satisfies readonly NavigationLink[],
    utilityItems: ["Account", "Bag"] as const
  },
  hero: {
    sideLabel: "MOTOVISE",
    title: "Precision Automotive Parts",
    description:
      "Precision-engineered automotive parts for drivers who demand more. Built for performance, built to last.",
    ctaLabel: "Shop Now",
    microTop: "Premium Auto Gear",
    microBottom: "Status: Online"
  },
  formulaStrip: {
    title: "Advanced Dashcam Tech",
    subtitle: "All products",
    items: [
      "01 / night vision",
      "02 / loop recording",
      "03 / g-sensor",
      "04 / wide angle lens",
      "05 / hd recording"
    ] as const
  },
  previewCards: [
    {
      id: "playbox-max",
      title: "Playbox Max Video Box CarPlay Adapter",
      tagline: "Ultra-wide screen with seamless 4K DVR.",
      price: 19999,
      image: "/bg-remove-product-thumbnail/remove-bg-product-1.png",
      tone: "berry"
    },
    {
      id: "dashcam-pro",
      title: "Dashcam Pro",
      tagline: "Crystal clear 4K recording with night vision.",
      price: 13999,
      image: "/bg-remove-product-thumbnail/remove-bg-product-2.png",
      tone: "cool"
    },
    {
      id: "y2-android-box",
      title: "Y2 Android Box",
      tagline: "Wireless connectivity for modern driving.",
      price: 4999,
      image: "/bg-remove-product-thumbnail/remove-bg-product-3.png",
      tone: "warm"
    },
    {
      id: "led-upgrade",
      title: "LED Upgrade",
      tagline: "Ultra-bright illumination for darker roads.",
      price: 1999,
      image: "/bg-remove-product-thumbnail/remove-bg-product-4.png",
      tone: "citrus"
    }
  ] as const satisfies readonly PreviewCard[],
  shopBySolution: {
    eyebrow: "Featured Parts",
    title: "Elevate your driving experience.",
    description:
      "Each component is certified. OEM-grade quality built for reliability and peak performance.",
    cards: [
      {
        id: "dashcam-pro",
        flavor: "Safety",
        name: "Dashcam Pro Kit",
        size: "Front & Rear Set",
        tagline: "Complete coverage with a reliable G-sensor for accident detection.",
        badges: ["4k resolution", "night vision", "wifi enabled"],
        ingredients: ["wide angle lens", "loop recording", "parking mode"],
        ctaLabel: "View Details",
        price: 13999,
        image: "/images/products/v2/dashcam-pro.png",
        tone: "cool"
      },
      {
        id: "carplay-adapter",
        flavor: "Convenience",
        name: "Wireless CarPlay",
        size: "Universal Adapter",
        tagline: "Seamless integration without the clutter of cables.",
        badges: ["plug & play", "low latency", "auto-connect"],
        ingredients: ["usb-c included", "5ghz wifi", "compact design"],
        ctaLabel: "View Details",
        price: 4999,
        image: "/images/products/v2/carplay.png",
        tone: "warm"
      },
      {
        id: "playbox-max",
        flavor: "Premium",
        name: "Playbox Max",
        size: "10.26 Inch UHD",
        tagline: "The ultimate car upgrade for navigation and safety.",
        badges: ["4k recording", "carplay", "android auto"],
        ingredients: ["ips screen", "loop recording", "night vision"],
        ctaLabel: "View Details",
        price: 19999,
        image: "/images/products/playbox-max/1.png",
        tone: "cool"
      }
    ] as const satisfies readonly SolutionCard[]
  },
  whyWeExist: {
    eyebrow: "Driver Community",
    intro:
      "Car accessories shouldn't be complicated or unreliable. We build precision gear focused on driving safety, practical utility, and simplicity.",
    fragments: [
      "Engineering that enhances situational awareness.",
      "Installation that takes seconds, not hours.",
      "Reliability that works every time you start the engine."
    ] as const,
    images: [
      "/images/WhatsApp Image 2026-03-19 at 11.56.05 PM.jpeg",
      "/images/WhatsApp Image 2026-03-19 at 11.56.05 PM (1).jpeg"
    ] as const
  },
  credibility: {
    eyebrow: "Our Promise",
    quote:
      "A great driving accessory should feel seamlessly integrated into your vehicle, providing safety and peace of mind without distraction.",
    author: "Motovise Team",
    role: "Automotive Specialists",
    indicators: [
      "OEM-Grade Quality",
      "Certified Components",
      "Expert Technical Support"
    ] as const
  },
  varietyPack: {
    eyebrow: "Starter Bundle",
    title: "The complete setup.",
    description:
      "Get all the essentials for a safer, smarter drive. The starter bundle includes our best-selling dashcam, memory card, and smart mount in one convenient package.",
    includedItems: [
      "1 x Dashcam Pro",
      "1 x 128GB MicroSD",
      "1 x Smart Mount Pro"
    ] as const
  },
  comparison: {
    eyebrow: "Motovise vs Others",
    title: "The gear is simply built better.",
    rows: [
      {
        label: "Quality",
        sip: "OEM-grade certified components",
        drip: "Cheap plastic, prone to breaking"
      },
      {
        label: "Installation",
        sip: "Plug & play in minutes",
        drip: "Complicated wiring required"
      },
      {
        label: "Support",
        sip: "Expert enthusiast support",
        drip: "Automated phone menus"
      },
      {
        label: "Longevity",
        sip: "Built for extreme cabin temps",
        drip: "Fails during summer heat"
      }
    ] as const satisfies readonly ComparisonRow[]
  },
  faq: {
    eyebrow: "FAQs",
    title: "Installation & Compatibility",
    items: [
      {
        question: "How difficult is installation?",
        answer:
          "Most of our products are designed for plug-and-play installation taking less than 5 minutes. No permanent modifications are required."
      },
      {
        question: "Is it compatible with my vehicle?",
        answer:
          "Our accessories are universally compatible with any vehicle featuring a standard 12V port or USB connection."
      },
      {
        question: "Do your products come with a warranty?",
        answer:
          "Yes. Every component includes a 1-year manufacturer warranty covering any defects or performance issues."
      },
      {
        question: "How do I access my dashcam footage?",
        answer:
          "You can securely connect to the camera via WiFi and review or download footage instantly through our companion app."
      }
    ] as const satisfies readonly FaqItem[]
  },
  blog: {
    eyebrow: "Garage Notes",
    title: "Guides on installation, gear, and driving.",
    cards: [
      {
        category: "Safety",
        title: "Why every driver needs a 4K dashcam",
        excerpt: "Protecting yourself from liability with undisputed evidence.",
        image: "/images/image/e.jpg.jpeg"
      },
      {
        category: "Guides",
        title: "Clean wire hiding techniques for your interior",
        excerpt: "Keep your cabin looking OEM-fresh after installing accessories.",
        image: "/images/image/b.jpg.jpeg"
      },
      {
        category: "Tech",
        title: "Understanding modern camera sensors for night driving",
        excerpt: "How hardware advancements are changing low-light visibility.",
        image: "/images/image/c.jpg.jpeg"
      }
    ] as const satisfies readonly BlogCard[]
  },
  newsletter: {
    eyebrow: "Newsletter",
    title: "Join the Motovise community.",
    description:
      "Get priority updates on new arrivals, exclusive discounts, and driving insights."
  },
  footer: {
    columns: [
      {
        title: "Support",
        items: ["My Account", "Shipping Policy", "Returns & Refunds", "Privacy Policy"]
      },
      {
        title: "Shop",
        items: ["All Products", "New Arrivals", "Best Sellers", "Accessories"]
      },
      {
        title: "Follow",
        items: ["Instagram", "Facebook", "YouTube", "Twitter"]
      }
    ] as const,
    location: "Los Angeles, CA",
    hours: "Mon-Fri 09:00 - 18:00 PST"
  }
};
