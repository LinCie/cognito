import { stdin, stdout } from "node:process"
import { createInterface } from "readline"

// Prompt user for file path
function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout })
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  )
}

async function uploadFile() {
  const filePath = await prompt(
    "Enter the path to the file you want to upload: "
  )

  try {
    const file = Bun.file(filePath)

    const form = new FormData()
    form.append("file", file)

    const response = await fetch("https://upload.gofile.io/uploadFile", {
      method: "POST",
      body: form,
      headers: {
        Authorization: `Bearer ${Bun.env.GOFILE_API_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`)
    }

    const result = await response.json()
    console.log("Upload response:", result)
  } catch (err) {
    console.error("Error uploading file:", err)
  }
}

uploadFile()
