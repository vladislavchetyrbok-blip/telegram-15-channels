import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  ShieldAlert,
  Activity,
  Lock,
  Search,
  Zap,
  Terminal,
  FileText,
  Calendar,
  Eye,
  ListChecks,
  ServerCrash
} from "lucide-react";
import Link from "next/link";
import { ZodiacStabilityMatrix } from "@/lib/zodiac/zodiac-stability-matrix";

export default function ZodiacStabilityMatrixPage() {
  return (
    <div className="space-y-6 text-slate-200">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Activity className="h-8 w-8 text-blue-500" />
          Zodiac Stability Matrix
        </h1>
        <p className="text-slate-400 mt-2">
          Diagnostic read-only control page. This matrix protects the already-working daily/weekly automation and provides a health check baseline.
        </p>
      </div>

      {/* Do Not Touch Block */}
      <div className="rounded-xl border border-rose-900/50 bg-[#0f1b33]/80 p-6 shadow-sm">
        <h2 className="text-xl font-bold tracking-tight text-rose-400 flex items-center gap-2 mb-4">
          <ShieldAlert className="h-5 w-5" />
          &quot;Do Not Touch&quot; Protection Area
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-sm text-slate-300">Package 100 explicitly <strong>DOES NOT MODIFY</strong> the following:</p>
            <ul className="space-y-2 text-sm text-slate-400 border-l-2 border-rose-900/50 pl-3">
              <li className="flex items-center gap-2"><Lock className="h-3 w-3 text-rose-500" /> <code>.github/workflows</code></li>
              <li className="flex items-center gap-2"><Lock className="h-3 w-3 text-rose-500" /> cron schedules</li>
              <li className="flex items-center gap-2"><Lock className="h-3 w-3 text-rose-500" /> publish scripts</li>
              <li className="flex items-center gap-2"><Lock className="h-3 w-3 text-rose-500" /> live bot sending logic</li>
              <li className="flex items-center gap-2"><Lock className="h-3 w-3 text-rose-500" /> production env</li>
              <li className="flex items-center gap-2"><Lock className="h-3 w-3 text-rose-500" /> database schema</li>
                      <li><Link href="/dashboard/networks/zodiac/invoice-draft-safety-hardening" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Invoice Draft Safety Hardening</Link></li>
        </ul>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white">Current Baseline Summary (Package 99.1):</p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" /> 
                <span><strong>Package 99 commit:</strong> <code>1bf42a7728c62e96513ee6e265c46623ea5cafd3</code></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" /> 
                <span><strong>Package 99.1 commit:</strong> <code>0e4aaaa</code></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" /> 
                <span>Manual Review is UI/read-only only</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" /> 
                <span>Daily automation remains unblocked</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" /> 
                <span>Cron/workflows/publish scripts were not changed</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Known Safe Checks */}
      <div className="rounded-xl border border-slate-800 bg-[#0f1b33] p-6 shadow-sm">
        <h2 className="text-xl font-bold tracking-tight text-white mb-4">Known Safe Checks</h2>
        <p className="text-sm text-slate-400 mb-4">The following commands are allowed for verification without risking live data:</p>
        <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-emerald-400 space-y-1 mb-4">
          <p>npm run build</p>
          <p>npm run zodiac:dashboard:qa</p>
          <p>npm run production:safety:check</p>
          <p>git diff --check</p>
        </div>
        <div className="text-sm text-amber-400/80 bg-amber-500/10 p-3 rounded-lg flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>Note: <code>production:safety:check</code> may show <strong>expected locked/missing env</strong> output when live env variables are not configured. This is normal and expected.</p>
        </div>
      </div>

      {/* Automation Status Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-white">Automation Status</h2>
        
        <div className="rounded-xl border border-slate-800 overflow-hidden bg-[#0f1b33]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs text-slate-400 bg-slate-900 border-b border-slate-800">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Area</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Risk Level</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Protected Component</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Constraint</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {ZodiacStabilityMatrix.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{item.area}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                        ${item.status === 'passing' || item.status === 'protected' ? 'bg-emerald-500/10 text-emerald-500' : ''}
                        ${item.status === 'read-only' ? 'bg-sky-500/10 text-sky-500' : ''}
                        ${item.status === 'expected locked' ? 'bg-amber-500/10 text-amber-500' : ''}
                      `}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium
                        ${item.riskLevel === 'Low' ? 'bg-emerald-500/10 text-emerald-400' : ''}
                        ${item.riskLevel === 'Medium' ? 'bg-amber-500/10 text-amber-400' : ''}
                        ${item.riskLevel === 'High' ? 'bg-rose-500/10 text-rose-400' : ''}
                      `}>
                        {item.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-400">{item.protectedComponent}</td>
                    <td className="px-4 py-3 text-rose-300">{item.doNotModify}</td>
                    <td className="px-4 py-3 text-slate-400">{item.recommendedAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Next Safe Development Gates */}
      <div className="rounded-xl border border-blue-900/30 bg-blue-950/20 p-6 shadow-sm">
        <h2 className="text-xl font-bold tracking-tight text-blue-400 mb-4">Next Safe Development Gates</h2>
        <div className="space-y-4 text-sm text-slate-300">
          <p>Before proceeding to new product features, the following gates must be cleared:</p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Stabilize dashboard navigation.</li>
            <li>Verify all Zodiac dashboard pages build correctly.</li>
            <li>Verify Mini App smoke command.</li>
            <li>Verify daily / weekly / ledger references.</li>
            <li>Only after this, proceed to new product features:
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-slate-400">
                <li>affirmations</li>
                <li>mystic numbers</li>
                <li>compatibility improvements</li>
                <li>VIP logic</li>
                <li>relationship map</li>
                <li>lunar calendar</li>
                <li>mobile app strategy</li>
              </ul>
            </li>
          </ol>
        </div>
      </div>

      {/* Cross Links */}
      <div className="space-y-4 mt-8 pt-8 border-t border-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-white">Связанные модули</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/networks/zodiac/manual-review" className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-2 text-white mb-1"><ListChecks className="h-4 w-4 text-emerald-400" /> Manual Review</div>
            <div className="text-xs text-slate-400">Approval Gate UI</div>
          </Link>
          <Link href="/dashboard/networks/zodiac/preview-review" className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-2 text-white mb-1"><Eye className="h-4 w-4 text-sky-400" /> Preview Review</div>
            <div className="text-xs text-slate-400">Просмотр примеров</div>
          </Link>
          <Link href="/dashboard/networks/zodiac/ledger" className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-2 text-white mb-1"><Terminal className="h-4 w-4 text-slate-400" /> Ledger</div>
            <div className="text-xs text-slate-400">Журнал публикаций</div>
          </Link>
          <Link href="/dashboard/networks/zodiac/daily-system" className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-2 text-white mb-1"><Activity className="h-4 w-4 text-blue-400" /> Daily System</div>
            <div className="text-xs text-slate-400">Ежедневный движок</div>
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-3">
          <Link href="/dashboard/networks/zodiac/miniapp-monetization-architecture" className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-2 text-white mb-1"><Activity className="h-4 w-4 text-amber-400" /> Monetization</div>
            <div className="text-xs text-slate-400">Architecture Spec</div>
          </Link>
          <Link href="/dashboard/networks/zodiac/real-implementation-path" className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-2 text-white mb-1"><Activity className="h-4 w-4 text-amber-500" /> Real Implementation</div>
            <div className="text-xs text-slate-400">Identity First Path</div>
          </Link>
          <Link href="/dashboard/networks/zodiac/telegram-initdata-validation" className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-2 text-white mb-1"><Activity className="h-4 w-4 text-emerald-400" /> Telegram initData</div>
            <div className="text-xs text-slate-400">Validation Foundation</div>
          </Link>
          <Link href="/dashboard/networks/zodiac/user-profile-foundation" className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 transition-colors">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">User Profile Foundation</h3>
            <p className="text-xs text-slate-400 mt-2">Package 124 completion</p>
          </Link>
          <Link href="/dashboard/networks/zodiac/product-catalog-foundation" className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 transition-colors">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">Product Catalog Foundation</h3>
            <p className="text-xs text-slate-400 mt-2">Package 125 completion</p>
          </Link>
          <Link href="/dashboard/networks/zodiac/entitlement-foundation" className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 transition-colors">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">Entitlement Foundation</h3>
            <p className="text-xs text-slate-400 mt-2">Package 126 completion</p>
          </Link>
          <Link href="/dashboard/networks/zodiac/vip-access-boundary" className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 transition-colors">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">VIP Access Boundary</h3>
            <p className="text-xs text-slate-400 mt-2">Package 127 completion</p>
          </Link>
          <Link href="/dashboard/networks/zodiac/vip-compatibility-report-foundation" className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 transition-colors">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">VIP Compatibility Report</h3>
            <p className="text-xs text-slate-400 mt-2">Package 128 completion</p>
          </Link>
          <Link href="/dashboard/networks/zodiac/vip-compatibility-report-preview" className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 transition-colors">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">VIP Report Preview</h3>
            <p className="text-xs text-slate-400 mt-2">Package 129 completion</p>
          </Link>
          <Link href="/dashboard/networks/zodiac/telegram-stars-payment-prototype" className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 transition-colors">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">Stars Payment Prototype</h3>
            <p className="text-xs text-slate-400 mt-2">Package 130 completion</p>
          </Link>
          <Link href="/dashboard/networks/zodiac/stars-payment-safety-review" className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 transition-colors">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">Stars Payment Safety Review</h3>
            <p className="text-xs text-slate-400 mt-2">Package 131 completion</p>
          </Link>
          <Link href="/dashboard/networks/zodiac/telegram-stars-invoice-draft" className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 transition-colors">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">Stars Invoice Draft</h3>
            <p className="text-xs text-slate-400 mt-2">Package 132 completion</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
