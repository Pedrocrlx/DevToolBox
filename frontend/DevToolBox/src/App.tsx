import { useState } from 'react'
import type { FormEvent } from 'react'
import { Check, Copy, KeyRound, LoaderCircle, LockKeyhole, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

const characterOptions = [
  { key: 'letters', title: 'Letras', example: 'a–z, A–Z' },
  { key: 'digits', title: 'Números', example: '0–9' },
  { key: 'punctuation', title: 'Símbolos', example: '!@#$%&*' },
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
          ? 'Demasiados pedidos. Aguarda uns segundos e tenta novamente.'
          : 'Não foi possível gerar a password. Verifica as opções e tenta novamente.')
      }
      const data: unknown = await response.json()
      if (typeof data !== 'object' || data === null || !('password' in data) || typeof data.password !== 'string') {
        throw new Error('A API devolveu uma resposta inesperada.')
      }
      setPassword(data.password)
    } catch (cause) {
      setError(cause instanceof Error && cause.name === 'Error'
        ? cause.message : 'Não foi possível contactar o servidor. Tenta novamente.')
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
      setError('Não foi possível copiar. Seleciona a password e copia manualmente.')
    }
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-3 font-semibold tracking-tight"><img src="/favicon.svg" width={36} height={36} alt="" />DevToolBox</a>
          <span className="hidden text-xs text-muted-foreground sm:block">Pequenas ferramentas. Menos fricção.</span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12 sm:py-20">
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-primary"><KeyRound size={15} /> Password generator</div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Uma nova password, em segundos.</h1>
          <p className="mt-3 max-w-lg text-muted-foreground">Escolhe os caracteres, ajusta o comprimento e gera uma password aleatória pronta a usar.</p>
        </div>
        <Card className="border-border shadow-xl shadow-black/30">
          <CardHeader><CardTitle>Configurar password</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={generate} className="space-y-6">
              <fieldset disabled={loading} className="space-y-6 disabled:opacity-60">
                <div className="flex items-center justify-between gap-4">
                  <div><Label htmlFor="length">Comprimento</Label><p id="length-help" className="mt-1 text-sm text-muted-foreground">Entre 1 e 128 caracteres</p></div>
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
              {selected === 0 && <p role="alert" className="text-sm text-destructive">Seleciona pelo menos um tipo de caracteres.</p>}
              <Button type="submit" disabled={!valid || loading} className="w-full" size="lg">
                {loading ? <LoaderCircle className="animate-spin" /> : <RefreshCw />} {loading ? 'A gerar…' : 'Gerar password'}
              </Button>
            </form>
            <div className="mt-6 rounded-xl border border-dashed bg-background p-5" aria-live="polite" aria-busy={loading}>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">A tua password</p>
              {password ? <><p className="select-all break-all font-mono text-xl leading-relaxed">{password}</p><Button type="button" variant="outline" className="mt-4" onClick={copyPassword}>{copied ? <Check /> : <Copy />}{copied ? 'Copiada' : 'Copiar password'}</Button></> : <p className="text-sm text-muted-foreground">{loading ? 'A preparar a tua password…' : 'A password gerada aparece aqui.'}</p>}
            </div>
            {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>
        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"><LockKeyhole size={14} /> As passwords geradas aqui não são guardadas no servidor.</p>
      </main>
    </div>
  )
}

export default App
