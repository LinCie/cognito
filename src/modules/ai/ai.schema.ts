import { z } from "zod"

const promptSchema = z.object({
  prompt: z.string({
    required_error: "Prompt is required",
    invalid_type_error: "Prompt must be a string",
  }),
})

export { promptSchema }
