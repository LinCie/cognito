import express from "express"
import cors from "cors"
import morgan from "morgan"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import { FRONTEND_URL } from "@/configs/env.config"
import { logger } from "@/utilities/logger.utility"
import { sessionMiddleware } from "./middlewares/session.middleware"
import { errorMiddleware } from "./middlewares/error.middleware"

// Modules import
import { AuthController } from "./modules/auth"
import { ProfileController } from "./modules/profile"
import { StudentController } from "./modules/student"
import { ProfessorController } from "./modules/professor"
import { KelasController } from "./modules/kelas"
import { AiController } from "./modules/ai/"
import { UploadController } from "./modules/upload"
import { AssignmentController } from "./modules/assignment"
import { PostController } from "./modules/post"
import { SubmissionController } from "./modules/submission"
import { QuestionnaireController } from "./modules/questionnaire"
import { AnswerController } from "./modules/answer"
import { PresenceController } from "./modules/presence"

const app = express()

// Before request middlewares
app
  .use(
    morgan("tiny", {
      stream: {
        write: (message) => {
          logger.info(message.trim())
        },
      },
    })
  )
  .use(helmet())
  .use(cors({ origin: FRONTEND_URL, credentials: true }))
  .use(cookieParser())
  .use(express.json())

// Regular Routes
app
  // Index
  .get("/", (req, res) => {
    res.send("Hello World!")
  })
  // Auth
  .use("/auth", new AuthController().router)

// Protected Routes
app
  .use(sessionMiddleware)
  .use("/students", new StudentController().router)
  .use("/professors", new ProfessorController().router)
  .use("/profiles", new ProfileController().router)
  .use("/classes/:classId/posts", new PostController().router)
  .use("/classes/:classId/assignments", new AssignmentController().router)
  .use(
    "/classes/:classId/assignments/:assignmentId/submissions",
    new SubmissionController().router
  )
  .use(
    "/classes/:classId/assignments/:assignmentId/questionnaires",
    new QuestionnaireController().router
  )
  .use(
    "/classes/:classId/assignments/:assignmentId/questionnaires/:questionnaireId/answers",
    new AnswerController().router
  )
  .use("/classes/:classId/presences", new PresenceController().router)
  .use("/classes", new KelasController().router)
  .use("/ai", new AiController().router)
  .use("/upload", new UploadController().router)

// After request middlewares
app.use(errorMiddleware)

export { app }
