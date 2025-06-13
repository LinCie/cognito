import { z } from "zod"

// Schema for creating a new presence session.
// Only the deadline is required from the user.
const presenceSchema = z.object({
  deadline: z
    .string({
      required_error: "Deadline is required",
    })
    .datetime({
      message: "Invalid datetime string. Must be in ISO 8601 format.",
    }),
})

// Schema for updating a presence session, making all fields optional.
const partialPresenceSchema = presenceSchema.partial()

export { presenceSchema, partialPresenceSchema }
