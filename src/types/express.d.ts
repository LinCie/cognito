import "express"
import type { User } from "@generated/prisma"
import type { z } from "zod"

declare module "express" {
  interface Request {
    user?: User
    validated?: z.infer<z.ZodTypeAny>
  }
}
