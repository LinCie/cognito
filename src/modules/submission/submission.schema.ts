import { z } from "zod"

const submissionSchema = z.object({
  attachments: z.array(z.object({ name: z.string(), url: z.string() })),
})

const partialSubmissionSchema = submissionSchema.partial()

export { submissionSchema, partialSubmissionSchema }
