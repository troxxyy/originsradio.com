import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import ts from 'typescript'

const require = createRequire(import.meta.url)
function loadAction(file) {
  const source = readFileSync(new URL(`../src/app/actions/${file}.ts`, import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const exports = {}
  vm.runInNewContext(outputText, {
    exports,
    require(name) {
      if (name === '@/lib/supabase') return { getSupabaseClient() { throw new Error('Unexpected backend call') } }
      if (name === 'next/headers') return {}
      return require(name)
    },
    process: { env: {} },
  })
  return exports
}
function form(values) {
  const result = new FormData()
  for (const [name, value] of Object.entries(values)) result.set(name, value)
  return result
}

test('login returns Zod validation issues without calling the backend', async () => {
  const { loginArtist } = loadAction('auth')
  const result = await loginArtist(form({ email: 'invalid', password: '123456' }))
  assert.equal(result.success, false)
  assert.equal(result.error, 'Invalid email address')
})

test('signup preserves password confirmation validation after Zod upgrade', async () => {
  const { signupArtist } = loadAction('auth')
  const result = await signupArtist(form({ email: 'artist@example.com', password: '123456', confirmPassword: '654321' }))
  assert.equal(result.success, false)
  assert.equal(result.error, "Passwords don't match")
})

test('invite returns field validation errors and keeps valid submissions unavailable', async () => {
  const { submitInviteForm } = loadAction('invite')
  const invalid = await submitInviteForm(form({ name: '', email: 'artist@example.com', phone: '', message: '', eventSlug: 'test' }))
  assert.equal(invalid.success, false)
  assert.equal(invalid.error, 'Name is required')
  const valid = await submitInviteForm(form({ name: 'Artist', email: 'artist@example.com', phone: '', message: '', eventSlug: 'test' }))
  assert.equal(valid.success, false)
  assert.match(valid.error, /currently unavailable/)
})
