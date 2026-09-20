import { useState } from 'react'
import type { FormEvent } from 'react'
import { Check, Copy, KeyRound, LoaderCircle, LockKeyhole, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

const characterOptions = [
  { key: 'letters', title: 'Letters', example: 'a–z, A–Z' },
  { key: 'digits', title: 'Numbers', example: '0–9' },
  { key: 'punctuation', title: 'Symbols', example: '!@#$%&*' },
] as const

function App() {
  const [length, setLength] = useState('16')
  const [options, setOptions] = useState({ letters: true, digits: true, punctuation: true })
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const selected = Object.values(options).filter(Boolean).length
  const valid = selected > 0 && Number.isInteger(Number(length)) && Number(length) >= 1 && Number(length) <= 128

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valid || loading) return
    setLoading(true)
    setError('')
    setPassword('')
    setCopied(false)
    try {
      const response = await fetch('/api/passwords/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ length: Number(length), ...options }),
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
      })
      if (!response.ok) {
        throw new Error(response.status === 429
          ? 'Too many requests. Wait a few seconds and try again.'
          : 'Could not generate a password. Check your settings and try again.')
      }
      const data: unknown = await response.json()
      if (typeof data !== 'object' || data === null || !('password' in data) || typeof data.password !== 'string') {
        throw new Error('Could not load your password. Try again.')
      }
      setPassword(data.password)
    } catch (cause) {
      setError(cause instanceof Error && cause.name === 'Error'
        ? cause.message : 'Could not reach the server. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function copyPassword() {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setError('')
    } catch {
      setError('Could not copy. Select the password and copy it manually.')
    }
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <main className="mx-auto max-w-3xl px-6 py-8 sm:py-20">
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-primary"><KeyRound size={15} /> Password generator</div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Generate your password in seconds.</h1>
          <p className="mt-3 max-w-lg text-muted-foreground">Choose the characters and length, then generate a random password.</p>
        </div>
        <Card className="border-border shadow-xl shadow-black/30">
          <CardHeader><CardTitle>Password settings</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={generate} className="space-y-6">
              <fieldset disabled={loading} className="space-y-6 disabled:opacity-60">
                <div className="flex items-center justify-between gap-4">
                  <div><Label htmlFor="length">Length</Label><p id="length-help" className="mt-1 text-sm text-muted-foreground">1–128 characters</p></div>
                  <Input id="length" type="number" min={1} max={128} step={1} required value={length} onChange={(event) => setLength(event.target.value)} aria-describedby="length-help" className="w-24 bg-background text-center" />
                </div>
                <div className="divide-y rounded-xl border px-4">
                  {characterOptions.map(({ key, title, example }) => (
                    <div key={key} className="flex items-center justify-between py-4">
                      <div><Label htmlFor={key}>{title}</Label><p className="mt-1 font-mono text-xs text-muted-foreground">{example}</p></div>
                      <Switch id={key} checked={options[key]} onCheckedChange={(checked) => setOptions((current) => ({ ...current, [key]: checked }))} />
                    </div>
                  ))}
                </div>
              </fieldset>
              {selected === 0 && <p role="alert" className="text-sm text-destructive">Choose at least one character type.</p>}
              <Button type="submit" disabled={!valid || loading} className="w-full" size="lg">
                {loading ? <LoaderCircle className="animate-spin" /> : <RefreshCw />} {loading ? 'Generating…' : 'Generate password'}
              </Button>
            </form>
            <div className="mt-6 rounded-xl border border-dashed bg-background p-5" aria-live="polite" aria-busy={loading}>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Your password</p>
              {password ? <><p className="select-all break-all font-mono text-xl leading-relaxed">{password}</p><Button type="button" variant="outline" className="mt-4" onClick={copyPassword}>{copied ? <Check /> : <Copy />}{copied ? 'Copied' : 'Copy password'}</Button></> : <p className="text-sm text-muted-foreground">{loading ? 'Generating your password…' : 'Your password will appear here.'}</p>}
            </div>
            {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>
        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"><LockKeyhole size={14} /> Generated passwords are not stored on the server.</p>
      </main>
    </div>
  )
}

export default App
