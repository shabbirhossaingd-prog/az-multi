import { requireSupabase } from './supabase.js'

async function currentUserId() {
  const client = requireSupabase()
  const { data, error } = await client.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('No authenticated user')
  return data.user.id
}

export async function getBrandProfile() {
  const client = requireSupabase()
  const userId = await currentUserId()
  const { data, error } = await client.from('brand_profiles').select('*').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data
}

export async function saveBrandProfile(profile) {
  const client = requireSupabase()
  const userId = await currentUserId()
  const payload = { ...profile, user_id: userId, updated_at: new Date().toISOString() }
  const { data, error } = await client.from('brand_profiles').upsert(payload, { onConflict: 'user_id' }).select().single()
  if (error) throw error
  return data
}

export async function listPosts() {
  const client = requireSupabase()
  const userId = await currentUserId()
  const { data, error } = await client.from('posts').select('*').eq('user_id', userId).order('scheduled_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createPost(post) {
  const client = requireSupabase()
  const userId = await currentUserId()
  const { data, error } = await client.from('posts').insert({ ...post, user_id: userId }).select().single()
  if (error) throw error
  return data
}

export async function deletePost(id) {
  const client = requireSupabase()
  const userId = await currentUserId()
  const { error } = await client.from('posts').delete().eq('id', id).eq('user_id', userId)
  if (error) throw error
}

export async function listContacts() {
  const client = requireSupabase()
  const userId = await currentUserId()
  const { data, error } = await client.from('contacts').select('*').eq('user_id', userId).order('updated_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function listCampaigns() {
  const client = requireSupabase()
  const userId = await currentUserId()
  const { data, error } = await client.from('campaigns').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function listAdCampaigns() {
  const client = requireSupabase()
  const userId = await currentUserId()
  const { data, error } = await client.from('ad_campaigns').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
