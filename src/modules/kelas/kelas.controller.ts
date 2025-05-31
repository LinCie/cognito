import type { NextFunction, Request, Response } from "express"
import { Controller } from "@/structures/controller.structure"
import { KelasService } from "./kelas.service"
import { partialKelasSchema, kelasSchema } from "./kelas.schema"

export class KelasController extends Controller {
  private readonly kelasService: KelasService

  constructor() {
    super()
    this.kelasService = new KelasService()

    this.bindRoutes([
      { method: "get", path: "/", handler: this.index },
      { method: "get", path: "/:id", handler: this.show },
      { method: "post", path: "/", handler: this.create, schema: kelasSchema },
      { method: "post", path: "/:id/join", handler: this.join },
      {
        method: "patch",
        path: "/:id",
        handler: this.update,
        schema: partialKelasSchema,
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
    const { as = "student" } = req.query
    const kelas = await this.kelasService.getAll(as as string, req.user!)
    res.status(200).send(kelas)
  }

  async show(req: Request, res: Response) {
    const id = req.params.id
    const kelas = await this.kelasService.getOne(Number(id))
    res.status(200).send(kelas)
  }

  async create(req: Request, res: Response) {
    const data = req.body
    const kelas = await this.kelasService.create(data, req.user!)
    res.status(201).send(kelas)
  }

  async join(req: Request, res: Response) {
    const id = req.params.id
    const studentId = req.body.studentId
    const kelas = await this.kelasService.join(Number(id), Number(studentId))
    res.status(200).send(kelas)
  }

  async update(req: Request, res: Response) {
    const id = req.params.id
    const data = req.body
    const kelas = await this.kelasService.update(Number(id), data)
    res.status(200).send(kelas)
  }

  async destroy(req: Request, res: Response) {
    const id = req.params.id
    await this.kelasService.delete(Number(id))
    res.status(204).send()
  }

  async hasAccessMiddleware(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id
    await this.kelasService.isProfessor(Number(id), req.user!)

    next()
  }
}
