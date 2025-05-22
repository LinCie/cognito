import { z } from "zod"

const assignmentSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters long"),
  description: z
    .string()
    .min(2, "Description must be at least 2 characters long"),
  deadline: z.date().min(new Date(), "Deadline must be after current date"),
  attachments: z.array(z.object({ name: z.string(), url: z.string() })),
  kelasId: z.number(),
})

const partialAssignmentSchema = assignmentSchema.partial()

export { assignmentSchema, partialAssignmentSchema }
