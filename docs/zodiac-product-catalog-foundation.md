# Zodiac Product Catalog Foundation

The product catalog defines the purchasable items that users can acquire in the Zodiac platform. Currently implemented as a "Typed foundation only," the catalog serves as the single source of truth for what products exist before a live database schema is safe to deploy.

## Core Models

### `Product`
Defines an item available for purchase:
- `id`: Unique identifier (e.g., `prod_zodiac_vip_daily`).
- `tier`: Classification (e.g., `daily`, `weekly`, `natal`).
- `priceStars`: Cost in Telegram Stars.
- `features`: Array of features the product unlocks.

## Architecture Guidelines

1. **No Live Database**: The foundation uses static TypeScript definitions (`ZODIAC_CATALOG`).
2. **No Payments**: Defining a product does not implement the ability to buy it.
3. **No Entitlements**: This foundation only defines *what* can be bought, not *who* owns it.

## Future Path
Once `DATABASE_URL` configuration is safe and Supabase transitions to primary source of truth, these static definitions will be seeded into a `products` table, and `getProductById` will be refactored to fetch from the database.
