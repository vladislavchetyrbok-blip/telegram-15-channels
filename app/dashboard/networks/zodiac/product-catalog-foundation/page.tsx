import { AphroditePageHeader } from "@/components/AphroditePageHeader";
import { ShoppingCart, ShieldCheck, Database, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { ZODIAC_CATALOG } from "@/lib/zodiac/zodiac-product-catalog-foundation";

import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";

export default async function ProductCatalogFoundationPage() {
  requireDashboardPageAccess("/dashboard/networks/zodiac/product-catalog-foundation");

  const products = Object.values(ZODIAC_CATALOG);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <AphroditePageHeader 
        title="Zodiac Product Catalog Foundation" 
        description="View the typed foundation for the product catalog."
        badgeText="Foundation Only"
        icon={ShoppingCart}
        backLink="/dashboard/networks/zodiac" 
        backLabel="Back to Zodiac" 
      />

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Product Catalog Foundation</h1>
          <p className="text-slate-400">
            Product catalog foundation only / schema implementation pending / No payments / No VIP access
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-semibold text-slate-100">Status Matrix</h2>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2 shrink-0" />
                <span>Typed foundation implemented</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2 shrink-0" />
                <span>Static product definitions active</span>
              </li>
              <li className="flex items-start">
                <span className="text-rose-500 mr-2 shrink-0">•</span> 
                No payment logic implementation
              </li>
              <li className="flex items-start">
                <span className="text-rose-500 mr-2 shrink-0">•</span> 
                No VIP access boundaries applied
              </li>
              <li className="flex items-start">
                <span className="text-rose-500 mr-2 shrink-0">•</span> 
                No Supabase schema migrations executed
              </li>
            </ul>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-semibold text-slate-100">Implementation Path</h2>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              This package (125) establishes the product definitions. Next steps:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-400">
              <li>Package 124: User Profile Foundation <span className="text-emerald-400 ml-2">(Done)</span></li>
              <li className="text-slate-200 font-medium">Package 125: Product Catalog Foundation <span className="text-emerald-400 ml-2">(Current)</span></li>
              <li>Package 126: Entitlement Model Foundation <span className="text-emerald-400 ml-2">(Done)</span></li>
              <li>Package 127: VIP Access Boundary <span className="text-emerald-400 ml-2">(Done)</span></li>
              <li>Package 128: VIP Compatibility Report <span className="text-emerald-400 ml-2">(Done)</span></li>
            </ol>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-purple-400" />
          Static Catalog Definitions
        </h2>
        
        <div className="grid gap-6 md:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">{product.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 mt-2">
                    Tier: {product.tier}
                  </span>
                </div>
                <div className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-lg font-mono font-bold">
                  {product.priceStars} ★
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-6 flex-grow">{product.description}</p>
              
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Features Included</h4>
                <ul className="space-y-2">
                  {product.features.map(f => (
                    <li key={f.id} className="text-sm">
                      <span className="text-slate-200 font-medium">{f.name}:</span>
                      <span className="text-slate-400 ml-1">{f.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <Link href="/dashboard/networks/zodiac/vip-compatibility-report-foundation" className="inline-block bg-purple-500/20 text-purple-300 px-4 py-2 rounded border border-purple-500/30 hover:bg-purple-500/30 transition-colors text-sm">
          View VIP Compatibility Report Foundation
        </Link>
      </div>
    </div>
  );
}
