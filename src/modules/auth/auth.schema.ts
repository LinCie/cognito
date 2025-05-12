import { z } from "zod"

const userSchema = z.object({
  username: z
    .string()
    .min(4, "Username must be at least 4 characters long")
    .max(32, "Username must not exceed 32 characters long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(99, "password must not exceed 99 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number."
    ),
})

export { userSchema }
