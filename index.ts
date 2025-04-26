import { app } from "@/server"
import { PORT } from "@/config/env.config"
import { logger } from "@/utilities/logger.utilities"

app.listen(PORT, () => {
  logger.info(`Server is listening to port ${PORT} 🦊`)
})
