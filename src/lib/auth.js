import { isSupabaseConfigured, requireSupabase } from './supabase.js'

export async function getCurrentSession() {
  if (!isSupabaseConfigured) return null
  const client = requireSupabase()
  const { data, error } = await client.auth.getSession()
  if (error) throw error
  return data.session
}

export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured) return () => {}
  const client = requireSupabase()
  const { data } = client.auth.onAuthStateChange((_event, session) => callback(session))
  return () => data.subscription.unsubscribe()
}

export async function signUp({ name, email, password }) {
  const client = requireSupabase()
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })
  if (error) throw error
  return data
}

export async function signIn({ email, password }) {
  const client = requireSupabase()
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const client = requireSupabase()
  const { error } = await client.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email) {
  const client = requireSupabase()
  const redirectTo = `${window.location.origin}/`
  const { data, error } = await client.auth.resetPasswordForEmail(email, { redirectTo })
  if (error) throw error
  return data
}
