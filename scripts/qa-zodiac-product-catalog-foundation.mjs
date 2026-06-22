import fs from "fs";
import path from "path";
import { ZODIAC_CATALOG, getProductById } from "../lib/zodiac/zodiac-product-catalog-foundation.ts";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

async function main() {
  console.log("Starting Product Catalog Foundation QA...\n");

  // 1. Check getProductById for existing product
  const dailyProd = getProductById("prod_zodiac_vip_daily");
  assert(dailyProd !== null, "getProductById returns existing daily product");
  assert(dailyProd?.tier === "daily", "daily product has correct tier");
  assert(dailyProd?.priceStars === 50, "daily product has correct price");

  // 2. Check getProductById for non-existing product
  const missingProd = getProductById("prod_missing_123");
  assert(missingProd === null, "getProductById returns null for missing product");

  // 3. Check ZODIAC_CATALOG contents
  assert(Object.keys(ZODIAC_CATALOG).length >= 3, "Catalog contains at least 3 base products");
  assert(ZODIAC_CATALOG["zodiac-vip-weekly"] !== undefined, "Catalog contains weekly product");
  assert(ZODIAC_CATALOG["zodiac-natal-chart"] !== undefined, "Catalog contains natal product");

  // 4. Verify structural boundaries
  // Check that the file doesn't import database clients (e.g. Prisma or Supabase)
  const libPath = path.join(process.cwd(), "lib", "zodiac", "zodiac-product-catalog-foundation.ts");
  const content = fs.readFileSync(libPath, "utf-8");
  
  assert(!content.includes("import { PrismaClient }"), "Foundation does not import Prisma");
  assert(!content.includes("import { createClient }"), "Foundation does not import Supabase");
  assert(!content.includes("fetch("), "Foundation does not make API calls");

  console.log("\nProduct Catalog Foundation QA: " + (failed === 0 ? "PASS" : "FAIL"));
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
