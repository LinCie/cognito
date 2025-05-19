import type { Request, Response, NextFunction } from "express"
import { Controller } from "@/structures/controller.structure"
import { professorSchema, partialProfessorSchema } from "./professor.schema"
import { ProfessorService } from "./professor.service"

export class ProfessorController extends Controller {
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
        schema: professorSchema,
      },
      {
        method: "patch",
        path: "/:id",
        handler: this.update,
        schema: partialProfessorSchema,
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
    const professors = await this.professorService.getProfessors()
    res.send(professors)
  }

  async show(req: Request, res: Response) {
    const professor = await this.professorService.getProfessor(
      Number(req.params.id)
    )
    res.send(professor)
  }

  async create(req: Request, res: Response) {
    const user = req.user!
    const professor = await this.professorService.createProfessor(
      req.validated,
      user
    )
    res.status(201).send(professor)
  }

  async update(req: Request, res: Response) {
    const professor = await this.professorService.updateProfessor(
      Number(req.params.id),
      req.validated
    )
    res.send(professor)
  }

  async destroy(req: Request, res: Response) {
    await this.professorService.deleteProfessor(Number(req.params.id))
    res.status(204).send()
  }

  async hasAccessMiddleware(req: Request, res: Response, next: NextFunction) {
    const user = req.user!
    const { id } = req.params

    await this.professorService.isProfessor(Number(id), user)

    next()
  }
}
