import type { Request, Response } from "express"
import { Controller } from "@/structures/controller.structure"
import { SubmissionService } from "./submission.service"
import { partialSubmissionSchema, submissionSchema } from "./submission.schema"

class SubmissionController extends Controller {
  public readonly submissionService = new SubmissionService()

  constructor() {
    super()

    this.bindRoutes([
      {
        method: "get",
        path: "/",
        handler: this.index,
      },
      {
        method: "get",
        path: "/:id",
        handler: this.show,
      },
      {
        method: "post",
        path: "/",
        handler: this.create,
        schema: submissionSchema,
      },
      {
        method: "patch",
        path: "/:id",
        handler: this.update,
        schema: partialSubmissionSchema,
      },
      {
        method: "delete",
        path: "/:id",
        handler: this.destroy,
      },
    ])
  }

  async index(req: Request, res: Response) {
    const { assignmentId } = req.params
    const submissions = await this.submissionService.getSubmissions(
      Number(assignmentId)
    )
    res.status(200).send(submissions)
  }

  async show(req: Request, res: Response) {
    const { id } = req.params
    const submission = await this.submissionService.getSubmission(Number(id))
    res.status(200).send(submission)
  }

  async create(req: Request, res: Response) {
    const { assignmentId } = req.params
    const user = req.user!
    const data = req.body
    const submission = await this.submissionService.createSubmission(
      Number(assignmentId),
      user,
      data
    )
    res.status(201).send(submission)
  }

  async update(req: Request, res: Response) {
    const { id } = req.params
    const data = req.body
    const submission = await this.submissionService.updateSubmission(
      Number(id),
      data
    )
    res.status(200).send(submission)
  }

  async destroy(req: Request, res: Response) {
    const { id } = req.params
    await this.submissionService.deleteSubmission(Number(id))
    res.status(204).send()
  }
}

export { SubmissionController }
