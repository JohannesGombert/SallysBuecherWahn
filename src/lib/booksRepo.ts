import { supabase } from './supabase'
import type { Book, BookLookupResult, ReadingStatus } from '../types'

export async function fetchBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Book[]
}

export async function addBook(
  lookup: BookLookupResult,
  status: ReadingStatus,
): Promise<Book> {
  const { data: userData } = await supabase.auth.getUser()
  const user_id = userData.user?.id
  if (!user_id) throw new Error('Nicht angemeldet')

  const { data, error } = await supabase
    .from('books')
    .insert({ ...lookup, status, user_id })
    .select()
    .single()
  if (error) throw error
  return data as Book
}

export async function updateBook(
  id: string,
  patch: Partial<Book>,
): Promise<void> {
  const { data, error } = await supabase
    .from('books')
    .update(patch)
    .eq('id', id)
    .select()
  if (error) throw error
  // Kein Fehler, aber 0 Zeilen geändert = fehlende Schreibrechte (RLS-Policy).
  if (!data || data.length === 0) {
    throw new Error(
      'Änderung wurde nicht gespeichert – vermutlich fehlt die UPDATE-Berechtigung (RLS) in Supabase.',
    )
  }
}

export async function deleteBook(id: string): Promise<void> {
  const { error } = await supabase.from('books').delete().eq('id', id)
  if (error) throw error
}
