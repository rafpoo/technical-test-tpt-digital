import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().default(''),
})

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().default(''),
  price: z.number().positive('Price must be greater than zero'),
  category_id: z.string().uuid('Select a valid category'),
  stock_quantity: z.number().int().min(0, 'Stock cannot be negative'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type ProductInput = z.infer<typeof productSchema>

export type Category = CategoryInput & {
  id: string
  created_at: string
  updated_at: string
}

export type Product = ProductInput & {
  id: string
  created_at?: string
  updated_at?: string
}

export type DashboardStats = {
  total_products: number
  total_categories: number
  total_inventory_value: number
  low_stock_products: Product[]
}
