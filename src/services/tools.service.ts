import axios from "axios"

export default class ToolsService {
    static async getToolData(slug: string) {
        try {
            const url = `${process.env.LARAVEL_BACKEND_SERVER_URL}/api/singlePrompt/details?slug=${slug}`
            const toolResponse = await axios.get(url, { headers: { app: "MTIzfFdsd2Vi" } })
            if (toolResponse.status === 200)
                return toolResponse.data.data
        } catch (error: any) {
            return Promise.reject(error)
        }
    }
}