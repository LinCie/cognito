import { z } from "zod"

const postSchema = z.object({
  title: z.string({
    required_error: "Title is required",
    invalid_type_error: "Title must be a string",
  }),
  description: z.string({
    required_error: "Description is required",
    invalid_type_error: "Description must be a string",
  }),
  attachments: z
    .array(z.object({ name: z.string(), url: z.string() }))
    .optional(),
})

const partialPostSchema = postSchema.partial()

export { postSchema, partialPostSchema }
