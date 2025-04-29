import type { NextFunction, Request, Response } from "express"
import { Controller } from "@/structures/controller.structure"
import { StudentService } from "./student.service"
import { partialStudentSchema, studentSchema } from "./student.schema"

class StudentController extends Controller {
  public readonly studentService: StudentService

  constructor() {
    super()
    this.studentService = new StudentService()

    this.bindRoutes([
      { method: "get", path: "/", handler: this.index },
      { method: "get", path: "/:id", handler: this.show },
      {
        method: "post",
        path: "/",
        handler: this.create,
        schema: studentSchema,
      },
      {
        method: "patch",
        path: "/:id",
        handler: this.update,
        schema: partialStudentSchema,
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
    const { page = 1, show = 10 } = req.query
    const students = await this.studentService.getStudents(
      Number(page),
      Number(show)
    )

    res.status(200).send(students)
  }

  async show(req: Request, res: Response) {
    const { id } = req.params
    const student = await this.studentService.getStudent(Number(id))

    res.status(200).send(student)
  }

  async create(req: Request, res: Response) {
    const user = req.user!
    const student = await this.studentService.createStudent(req.validated, user)

    res.status(201).send(student)
  }

  async update(req: Request, res: Response) {
    const { id } = req.params
    const student = await this.studentService.updateStudent(
      req.validated,
      Number(id)
    )

    res.status(200).send(student)
  }

  async destroy(req: Request, res: Response) {
    const { id } = req.params
    await this.studentService.deleteStudent(Number(id))

    res.status(204).send()
  }

  async hasAccessMiddleware(req: Request, res: Response, next: NextFunction) {
    const user = req.user!
    const { id } = req.params

    await this.studentService.hasAccess(Number(id), user)

    next()
  }
}

export { StudentController }
