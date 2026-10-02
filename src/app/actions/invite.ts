'use server'

import { z } from 'zod'

const inviteSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().optional(),
  eventSlug: z.string().min(1),
})

export async function submitInviteForm(formData: FormData) {
  try {
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
      eventSlug: formData.get('eventSlug'),
    }

    // Validate input
    inviteSchema.parse(data)

    // No delivery or persistence is configured for this form yet.
    return {
      success: false,
      error: 'Online invite requests are currently unavailable. Please contact info@originsradio.com.'
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors[0].message 
      }
    }
    
    return { 
      success: false, 
      error: 'Failed to submit invite request' 
    }
  }
}
