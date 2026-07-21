import { useState, type FormEvent } from "react"
import { LoaderCircle, Sparkles } from "lucide-react"

import { signIn, signUp } from "@/lib/auth-client"

export function AuthScreen() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in")
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const isSignUp = mode === "sign-up"

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsLoading(true)

    const result = isSignUp
      ? await signUp.email({ email, password, name, username })
      : await signIn.email({ email, password })

    setIsLoading(false)
    if (result.error) setError(result.error.message ?? "Unable to continue.")
  }

  async function continueWithGithub() {
    setError("")
    setIsLoading(true)
    // Better Auth redirects the browser to GitHub and returns to this app afterward.
    const result = await signIn.social({ provider: "github", callbackURL: window.location.origin })
    setIsLoading(false)
    if (result.error) setError(result.error.message ?? "GitHub sign-in could not start.")
  }

  return (
    <main className="grid min-h-svh place-items-center bg-zinc-100 p-5 text-zinc-950">
      <section className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-zinc-950 text-white">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="font-semibold tracking-tight">ContextAI</p>
            <p className="text-xs text-zinc-500">Your private document assistant</p>
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          {isSignUp ? "Create your workspace" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          {isSignUp ? "Start asking questions about your documents." : "Sign in to continue your conversations."}
        </p>

        <button
          className="mt-7 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 text-sm font-medium transition hover:bg-zinc-50 disabled:opacity-60"
          disabled={isLoading}
          onClick={continueWithGithub}
          type="button"
        >
          <span className="text-base leading-none">●</span> Continue with GitHub
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-zinc-400">
          <span className="h-px flex-1 bg-zinc-200" /> or continue with email <span className="h-px flex-1 bg-zinc-200" />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <Field label="Name" value={name} onChange={setName} autoComplete="name" />
              <Field label="Username" value={username} onChange={setUsername} autoComplete="username" hint="5–25 letters, numbers, _ or -" />
            </>
          )}
          <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
          <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete={isSignUp ? "new-password" : "current-password"} />

          {error && <p className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-700">{error}</p>}

          <button className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60" disabled={isLoading} type="submit">
            {isLoading && <LoaderCircle className="size-4 animate-spin" />}
            {isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          {isSignUp ? "Already have an account?" : "New here?"}{" "}
          <button className="font-medium text-zinc-950 underline underline-offset-4" onClick={() => { setMode(isSignUp ? "sign-in" : "sign-up"); setError("") }} type="button">
            {isSignUp ? "Sign in" : "Create an account"}
          </button>
        </p>
      </section>
    </main>
  )
}

function Field({ label, value, onChange, type = "text", autoComplete, hint }: { label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete: string; hint?: string }) {
  return (
    <label className="block text-sm font-medium text-zinc-700">
      {label}
      <input className="mt-1.5 h-11 w-full rounded-xl border border-zinc-300 px-3 font-normal outline-none transition placeholder:text-zinc-400 focus:border-zinc-950" required autoComplete={autoComplete} onChange={(event) => onChange(event.target.value)} type={type} value={value} />
      {hint && <span className="mt-1 block text-xs font-normal text-zinc-400">{hint}</span>}
    </label>
  )
}
