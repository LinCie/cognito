import express from "express"
import cors from "cors"
import morgan from "morgan"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import { FRONTEND_URL } from "@/configs/env.config"
import { logger } from "@/utilities/logger.utility"

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

export { app }
