import type { NextFunction, Request, Response } from "express"
import { Controller } from "@/structures/controller.structure"
import { PresenceService } from "./presence.service"
import { partialPresenceSchema, presenceSchema } from "./presence.schema"

class PresenceController extends Controller {
  public readonly presenceService = new PresenceService()

  constructor() {
    super()
    this.bindRoutes([
      // --- Professor Routes ---
      {
        method: "get",
        path: "/",
        handler: this.index,
        middlewares: [this.isProfessorMiddleware],
      },
      {
        method: "get",
        path: "/:id",
        handler: this.show,
        middlewares: [this.isProfessorMiddleware],
      },
      {
        method: "post",
        path: "/",
        handler: this.create,
        schema: presenceSchema,
        middlewares: [this.isProfessorMiddleware],
      },
      {
        method: "patch",
        path: "/:id",
        handler: this.update,
        schema: partialPresenceSchema,
        middlewares: [this.isProfessorMiddleware],
      },
      {
        method: "delete",
        path: "/:id",
        handler: this.destroy,
        middlewares: [this.isProfessorMiddleware],
      },
      // --- Student Route ---
      {
        method: "post",
        path: "/:id/attend",
        handler: this.attend,
        middlewares: [this.isStudentInClassForPresenceMiddleware],
      },
    ])
  }

  // --- Professor Handlers ---

  async index(req: Request, res: Response) {
    const classId = req.params.classId
    const presences = await this.presenceService.getPresences(Number(classId))
    res.status(200).send(presences)
  }

  async show(req: Request, res: Response) {
    const id = req.params.id
    const presence = await this.presenceService.getPresence(Number(id))
    res.status(200).send(presence)
  }

  async create(req: Request, res: Response) {
    const classId = req.params.classId
    const data = req.body
    const presence = await this.presenceService.createPresence(
      Number(classId),
      data
    )
    res.status(201).send(presence)
  }

  async update(req: Request, res: Response) {
    const id = req.params.id
    const data = req.body
    const presence = await this.presenceService.updatePresence(Number(id), data)
    res.status(200).send(presence)
  }

  async destroy(req: Request, res: Response) {
    const id = req.params.id
    await this.presenceService.deletePresence(Number(id))
    res.status(204).send()
  }

  // --- Student Handler ---

  async attend(req: Request, res: Response) {
    const id = req.params.id
    const user = req.user!
    const presence = await this.presenceService.attendPresence(Number(id), user)
    res
      .status(200)
      .send({ message: "Successfully marked as present.", presence })
  }

  // --- Middlewares ---

  /**
   * Middleware to verify the user is the professor of the class specified in `req.params.classId`.
   * Used for routes where only the class professor has access.
   */
  async isProfessorMiddleware(req: Request, res: Response, next: NextFunction) {
    const { classId } = req.params
    const user = req.user!
    await this.presenceService.isProfessorOfClass(Number(classId), user)
    next()
  }

  /**
   * Middleware to verify the user is a student in the class associated with the presence session.
   * Used for the 'attend' route. It finds the class ID from the presence ID.
   */
  async isStudentInClassForPresenceMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const presenceId = req.params.id
    const user = req.user!
    // First, get the presence to find out its classId
    const presence = await this.presenceService.getPresence(Number(presenceId))
    // Then, verify the user is a student in that specific class
    await this.presenceService.isStudentInClass(presence.kelasId, user)
    next()
  }
}

export { PresenceController }
