import type { NextFunction, Request, Response } from "express"
import { Controller } from "@/structures/controller.structure"
import { PostService } from "./post.service"
import { partialPostSchema, postSchema } from "./post.schema"

class PostController extends Controller {
  public readonly postService = new PostService()

  constructor() {
    super()
    this.bindRoutes([
      { method: "get", path: "/", handler: this.index },
      { method: "get", path: "/:id", handler: this.show },
      {
        method: "post",
        path: "/",
        handler: this.create,
        schema: postSchema,
        middlewares: [this.hasAccessMiddleware],
      },
      {
        method: "patch",
        path: "/:id",
        handler: this.update,
        schema: partialPostSchema,
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
    const classId = req.params.classId
    const posts = await this.postService.getPosts(Number(classId))
    res.status(200).send(posts)
  }

  async show(req: Request, res: Response) {
    const id = req.params.id
    const post = await this.postService.getPost(Number(id))
    res.status(200).send(post)
  }

  async create(req: Request, res: Response) {
    const classId = req.params.classId
    const data = req.body
    const post = await this.postService.createPost(Number(classId), data)
    res.status(201).send(post)
  }

  async update(req: Request, res: Response) {
    const id = req.params.id
    const data = req.body
    const post = await this.postService.updatePost(Number(id), data)
    res.status(200).send(post)
  }

  async destroy(req: Request, res: Response) {
    const id = req.params.id
    await this.postService.deletePost(Number(id))
    res.status(204).send()
  }

  async hasAccessMiddleware(req: Request, res: Response, next: NextFunction) {
    const { classId } = req.params
    const user = req.user!
    await this.postService.hasAccess(Number(classId), user)

    next()
  }
}

export { PostController }
