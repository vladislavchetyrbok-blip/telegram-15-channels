/**
 * zodiac-product-catalog-foundation.ts
 *
 * This file provides the "Typed foundation only" for the product catalog.
 *
 * Important boundaries respected:
 * - No live database schema creation (we operate in json/typed mode).
 * - No payment processing logic.
 * - No VIP access logic or session modifications.
 *
 * It serves only as the domain definition for the items users can purchase in the future.
 */

export type ProductTier = "daily" | "weekly" | "natal" | "compatibility";

export interface ProductFeature {
  id: string;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  tier: ProductTier;
  title: string;
  description: string;
  priceStars: number;
  features: ProductFeature[];
  isActive: boolean;
}

/**
 * A static mapping of the initial catalog.
 * This represents the pure foundation of the items that will be seeded into the database later.
 */
export const ZODIAC_CATALOG: Record<string, Product> = {
  "zodiac-vip-daily": {
    id: "prod_zodiac_vip_daily",
    tier: "daily",
    title: "Daily VIP Horoscope",
    description: "Get detailed, personalized daily readings based on your birth chart.",
    priceStars: 50,
    isActive: true,
    features: [
      { id: "feat_daily_details", name: "Detailed Daily Forecasts", description: "Beyond the basic overview." },
      { id: "feat_lucky_numbers", name: "Lucky Numbers & Colors", description: "Daily lucky elements." },
    ],
  },
  "zodiac-vip-weekly": {
    id: "prod_zodiac_vip_weekly",
    tier: "weekly",
    title: "Weekly Deep Dive",
    description: "Comprehensive weekly astrological transits and their impact on you.",
    priceStars: 150,
    isActive: true,
    features: [
      { id: "feat_weekly_transit", name: "Transit Analysis", description: "How planetary movements affect you this week." },
      { id: "feat_love_finance", name: "Love & Career Focus", description: "Specific sections for romance and money." },
    ],
  },
  "zodiac-natal-chart": {
    id: "prod_zodiac_natal_chart",
    tier: "natal",
    title: "Complete Natal Chart Reading",
    description: "A one-time deep dive into your entire birth chart.",
    priceStars: 500,
    isActive: true,
    features: [
      { id: "feat_all_houses", name: "12 Houses Analysis", description: "Every house interpreted." },
      { id: "feat_aspects", name: "Planetary Aspects", description: "Trines, squares, and conjunctions explained." },
    ],
  },
};

/**
 * Pure function to retrieve an active product by ID from the static catalog.
 * This does not perform any database queries.
 */
export function getProductById(productId: string): Product | null {
  const products = Object.values(ZODIAC_CATALOG);
  const found = products.find(p => p.id === productId);
  return found && found.isActive ? found : null;
}
