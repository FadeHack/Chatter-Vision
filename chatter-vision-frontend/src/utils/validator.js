import * as z from "zod"

// Login schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
})

// Registration schema
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9]{8,}$/,
      "Password must contain at least one letter and one number"
    ),
})

// Validation helper functions
export const validateLogin = (data) => {
  try {
    loginSchema.parse(data)
    return { success: true, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message
      }
    }
    return { success: false, error: "Validation failed" }
  }
}

export const validateRegister = (data) => {
  try {
    registerSchema.parse(data)
    return { success: true, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message
      }
    }
    return { success: false, error: "Validation failed" }
  }
} 