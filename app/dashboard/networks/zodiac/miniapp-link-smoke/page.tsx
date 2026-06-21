import { Shield, ExternalLink, ShieldAlert, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { ZODIAC_MINIAPP_LINK_SMOKE_MATRIX } from "@/lib/zodiac/zodiac-miniapp-link-smoke-matrix";

export const metadata = {
  title: "Mini App Internal Link Smoke Matrix | Zodiac Network",
};

export default function MiniAppLinkSmokePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Mini App Internal Link Smoke Matrix</h1>
        <p className="text-slate-400">Documentation and verification of expected internal links across the mock Mini App system.</p>
      </div>

      <div className="rounded-lg border border-amber-900/30 bg-amber-900/10 p-4">
        <div className="flex items-center gap-2 text-amber-500 mb-2">
          <ShieldAlert className="h-5 w-5" />
          <h2 className="font-semibold">Internal-link smoke only / No live CTA changes / No production wiring</h2>
        </div>
        <p className="text-sm text-amber-500/80">
          This matrix verifies internal routing. It does not wire the Mini App to live Telegram bot broadcasts or implement real VIP payments.
        </p>
      </div>

      <div className="space-y-8">
        {ZODIAC_MINIAPP_LINK_SMOKE_MATRIX.map((group) => (
          <div key={group.group} className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-200">{group.group}</h2>
              <p className="text-sm text-slate-400">{group.description}</p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/50">
                    <th className="p-3 font-medium text-slate-300">Source Route</th>
                    <th className="p-3 font-medium text-slate-300">Destination</th>
                    <th className="p-3 font-medium text-slate-300">Label</th>
                    <th className="p-3 font-medium text-slate-300">Link Type</th>
                    <th className="p-3 font-medium text-slate-300">Surface</th>
                    <th className="p-3 font-medium text-slate-300">Status</th>
                    <th className="p-3 font-medium text-slate-300">Required</th>
                    <th className="p-3 font-medium text-slate-300">Safety</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {group.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 text-slate-300 font-mono text-xs">{item.sourceRoute}</td>
                      <td className="p-3 text-slate-300 font-mono text-xs">{item.destinationRoute}</td>
                      <td className="p-3 text-slate-300">{item.label}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          item.linkType === 'primary' ? 'bg-blue-900/30 text-blue-400' :
                          item.linkType === 'secondary' ? 'bg-slate-800 text-slate-400' :
                          item.linkType === 'navigation' ? 'bg-purple-900/30 text-purple-400' :
                          item.linkType === 'safety' ? 'bg-emerald-900/30 text-emerald-400' :
                          item.linkType === 'dashboard' ? 'bg-indigo-900/30 text-indigo-400' :
                          'bg-amber-900/30 text-amber-400'
                        }`}>
                          {item.linkType}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{item.sourceSurface}</td>
                      <td className="p-3 text-slate-400">{item.destinationStatus}</td>
                      <td className="p-3">
                        {item.required ? (
                          <span className="text-emerald-500">Yes</span>
                        ) : (
                          <span className="text-slate-500">No</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 ${
                          item.safetyStatus === 'safe' ? 'text-emerald-500' :
                          item.safetyStatus === 'future-only' ? 'text-amber-500' :
                          'text-red-500'
                        }`}>
                          {item.safetyStatus === 'safe' ? <CheckCircle2 className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                          <span className="capitalize">{item.safetyStatus.replace('-', ' ')}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
