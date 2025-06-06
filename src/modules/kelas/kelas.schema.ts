import { z } from "zod"

const kelasSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must not exceed 50 characters long"),
})

const partialKelasSchema = kelasSchema.partial()

const joinKelasSchema = z.object({studentId: z.number()})

export { kelasSchema, partialKelasSchema, joinKelasSchema }
