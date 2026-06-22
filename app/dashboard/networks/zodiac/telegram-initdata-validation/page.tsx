import React from "react";
import { AlertTriangle, ShieldCheck, Database, KeyRound, ServerCrash } from "lucide-react";

export default function TelegramInitDataValidationPage() {
  return (
    <div className="min-h-screen bg-[#070b14] p-6 lg:p-12">
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Telegram initData Validation Foundation</h1>
          <p className="text-slate-400">
            Validation foundation only / No Telegram API call / No database write
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-6">
            <h3 className="text-emerald-400 font-semibold flex items-center mb-4">
              <ShieldCheck className="w-5 h-5 mr-2" />
              What this does
            </h3>
            <ul className="space-y-2 text-sm text-emerald-200/70">
              <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Validates raw initData securely</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Extracts user payload</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Enforces auth_date expiry</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Prevents tampering</li>
            </ul>
          </div>

          <div className="bg-rose-950/30 border border-rose-900/50 rounded-xl p-6">
            <h3 className="text-rose-400 font-semibold flex items-center mb-4">
              <AlertTriangle className="w-5 h-5 mr-2" />
              What this does NOT do
            </h3>
            <ul className="space-y-2 text-sm text-rose-200/70">
              <li className="flex items-start"><span className="text-rose-500 mr-2">•</span> Does not trust initDataUnsafe</li>
              <li className="flex items-start"><span className="text-rose-500 mr-2">•</span> No Telegram API call</li>
              <li className="flex items-start"><span className="text-rose-500 mr-2">•</span> No bot sending logic</li>
              <li className="flex items-start"><span className="text-rose-500 mr-2">•</span> No database write</li>
              <li className="flex items-start"><span className="text-rose-500 mr-2">•</span> No session persistence</li>
              <li className="flex items-start"><span className="text-rose-500 mr-2">•</span> No payment</li>
              <li className="flex items-start"><span className="text-rose-500 mr-2">•</span> No real VIP access</li>
              <li className="flex items-start"><span className="text-rose-500 mr-2">•</span> No active Telegram CTA logic changed</li>
              <li className="flex items-start"><span className="text-rose-500 mr-2">•</span> No production launch</li>
            </ul>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">Validation Algorithm</h2>
          <div className="space-y-4 text-sm text-slate-400">
            <p>1. Parse raw <code>initData</code> as URL query string.</p>
            <p>2. Extract <code>hash</code> parameter.</p>
            <p>3. Remove <code>hash</code> and sort remaining parameters alphabetically by key.</p>
            <p>4. Join sorted parameters with newline to create the <code>data-check-string</code>.</p>
            <p>5. Generate secret key via HMAC-SHA256 of bot token with key <code>WebAppData</code>.</p>
            <p>6. Generate validation hash via HMAC-SHA256 of <code>data-check-string</code> with the secret key.</p>
            <p>7. Compare the calculated validation hash with the provided <code>hash</code>.</p>
            <p>8. Validate <code>auth_date</code> is within the acceptable <code>maxAgeSeconds</code>.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
