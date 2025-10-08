'use server'

import { z } from 'zod'
import { getSupabaseClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signupSchema = loginSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export async function loginArtist(formData: FormData) {
  try {
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const validated = loginSchema.parse(data)

    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, redirect: '/artist/dashboard' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Login failed' }
  }
}

export async function signupArtist(formData: FormData) {
  try {
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    }

    const validated = signupSchema.parse(data)

    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/artist/dashboard`
      }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { 
      success: true, 
      message: 'Check your email to verify your account',
      redirect: '/artist/login?verify=1'
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Signup failed' }
  }
}

export async function logoutArtist() {
  try {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    
    return { success: true, redirect: '/artist/login' }
  } catch (error) {
    return { success: false, error: 'Logout failed' }
  }
}
