import { env } from "@/config"
import { createAuthClient } from "better-auth/react"


export const authClient = createAuthClient({


    baseURL: env.SERVER_URL
})

export const { signIn, signUp, useSession } = createAuthClient()