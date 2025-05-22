import { GOFILE_API_KEY } from "@/configs/env.config"
import { Service } from "@/structures/service.structure"

class UploadService extends Service {
  public async uploadFile(file: File) {
    const form = new FormData()
    form.append("file", file)

    const response = await fetch("https://upload.gofile.io/uploadFile", {
      method: "POST",
      body: form,
      headers: {
        Authorization: `Bearer ${GOFILE_API_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`)
    }

    const result = await response.json()
    return result
  }
}

export { UploadService }
