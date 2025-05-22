import type { NextFunction, Request, Response } from "express"
import { Controller } from "@/structures/controller.structure"
import { AssignmentService } from "./assignment.service"
import { partialAssignmentSchema, assignmentSchema } from "./assignment.schema"
import { ProfessorService } from "@/modules/professor/professor.service"

export class AssignmentController extends Controller {
  private assignmentService = new AssignmentService()
  private professorService = new ProfessorService()

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
        schema: assignmentSchema,
        middlewares: [this.hasAccessMiddleware],
      },
      {
        method: "patch",
        path: "/:id",
        handler: this.update,
        schema: partialAssignmentSchema,
        middlewares: [this.hasAccessMiddleware],
      },
      {
        method: "delete",
        path: "/:id",
        handler: this.destroy,
        middlewares: [this.hasAccessMiddleware],
      },
    ])
  }

  async index(req: Request, res: Response) {
    const assignments = await this.assignmentService.findMany()

    res.send(assignments)
  }

  async show(req: Request, res: Response) {
    const { id } = req.params
    const assignment = await this.assignmentService.findOne(Number(id))

    res.send(assignment)
  }

  async create(req: Request, res: Response) {
    const assignment = await this.assignmentService.create(req.validated)
    res.status(201).send(assignment)
  }

  async update(req: Request, res: Response) {
    const { id } = req.params
    const assignment = await this.assignmentService.update(
      Number(id),
      req.validated
    )

    res.send(assignment)
  }

  async destroy(req: Request, res: Response) {
    const { id } = req.params
    await this.assignmentService.delete(Number(id))

    res.status(204).send()
  }

  async hasAccessMiddleware(req: Request, res: Response, next: NextFunction) {
    const user = req.user!
    const { id } = req.params

    await this.professorService.getProfessor(Number(id))
    await this.assignmentService.isProfessor(Number(id), user)

    next()
  }
}
