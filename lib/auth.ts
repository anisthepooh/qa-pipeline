'use client'

import { getPb } from './pocketbase'

export async function login(email: string, password: string): Promise<void> {
  const pb = getPb()
  await pb.collection('users').authWithPassword(email, password)
  // Cookie is auto-synced via authStore.onChange in getPb()
}

export async function register(email: string, password: string, passwordConfirm: string): Promise<void> {
  const pb = getPb()
  await pb.collection('users').create({ email, password, passwordConfirm })
  await pb.collection('users').authWithPassword(email, password)
}

export function logout(): void {
  const pb = getPb()
  pb.authStore.clear()
}

export function getCurrentUser() {
  const pb = getPb()
  return pb.authStore.isValid ? pb.authStore.model : null
}

export function isAuthenticated(): boolean {
  const pb = getPb()
  return pb.authStore.isValid
}
