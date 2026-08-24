export type FeatureIcon = "zap" | "cpu" | "wifi";

export interface SiteHero {
  eyebrow: string;
  title: string;
  tagline: string;
  typingLines: string[];
}

export interface SiteFeature {
  title: string;
  description: string;
  icon: FeatureIcon;
}

export interface SiteSpec {
  label: string;
  value: string;
}

export interface SiteLink {
  label: string;
  url: string;
}

export interface SiteContent {
  version: number;
  hero: SiteHero;
  features: SiteFeature[];
  specs: SiteSpec[];
  links: SiteLink[];
}

export const siteContent: SiteContent = {
  version: 1,
  hero: {
    eyebrow: "// Your useful little companion",
    title: "Hexaboard",
    tagline: "Your 2x3 Keyboard for Ultimate Productivity.",
    typingLines: ["powered by zmk"],
  },
  features: [
    {
      icon: "zap",
      title: "Hot-Swappable PCB",
      description:
        "Effortlessly swap switches in seconds without soldering. Customize your typing sound and feel to match your exact preference anytime.",
    },
    {
      icon: "cpu",
      title: "Powered by ZMK",
      description:
        "Industry-leading open source firmware. Remap keys, create complex macros, and define layers with ease. Your keyboard, your rules.",
    },
    {
      icon: "wifi",
      title: "Universal Connectivity",
      description:
        "High-speed USB-C interface ensures low-latency performance and seamless compatibility across Mac, Windows, and Linux devices.",
    },
  ],
  specs: [
    { label: "Layout", value: "Compact 2x3" },
    { label: "Switches", value: "Hot-Swappable" },
    { label: "Firmware", value: "ZMK (Open Source)" },
    { label: "Connectivity", value: "USB-C" },
    { label: "Material", value: "PLA" },
    { label: "Keycaps", value: "PBT Double-Shot" },
    { label: "Battery", value: "Rechargeable Lipo" },
    { label: "Display", value: "OLED" },
  ],
  links: [
    {
      label: "GitHub",
      url: "https://github.com/siliconsniffer/zmk-keyboard-hexaboard",
    },
  ],
};
