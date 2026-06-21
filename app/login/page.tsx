"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShieldAlert, ShieldCheck, Lock } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      })

      if (res.ok) {
        router.push("/dashboard/networks/aphrodite")
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || "Ошибка авторизации")
      }
    } catch (err) {
      setError("Ошибка сети")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1122] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-[#0f1b33] rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
              <Lock className="h-8 w-8" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Вход в Афродиту</h1>
            <p className="text-sm text-slate-400">Закрытая панель управления Telegram-модулями.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Логин</label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors"
                placeholder="Имя пользователя"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-lg text-center">
                {error}
                {error.includes("настроена") && (
                  <p className="mt-1 text-xs text-rose-300">
                    задайте APHRODITE_ADMIN_LOGIN, APHRODITE_ADMIN_PASSWORD и APHRODITE_SESSION_SECRET.
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[#0f1b33] disabled:opacity-50"
            >
              {isLoading ? "Проверка..." : "Войти"}
            </button>
          </form>
        </div>
        
        <div className="bg-slate-900/50 px-8 py-4 border-t border-slate-800/80 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-400/80 leading-relaxed">
            Доступ только для администратора. Live-публикации не запускаются с этой страницы.
          </p>
        </div>
      </div>
    </div>
  )
}
