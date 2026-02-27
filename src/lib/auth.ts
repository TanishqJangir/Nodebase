import { checkout, polar, portal } from "@polar-sh/better-auth";
import { betterAuth} from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";
import { polarClient } from "./polar";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),

    emailAndPassword: {
        enabled: true,
        autoSignIn: true
    },

    

    socialProviders:{
        github:{
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
        google:{
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },

    plugins : [
        polar({
            client : polarClient,
            createCustomerOnSignUp : true,
            use : [
                checkout({
                    products : [
                        {
                            // productId : "09a2be65-e29b-4ecc-b358-51c2387f6597", DEV: this is fow the development (sandbox)
                            productId: "e3684b44-161e-4c0f-9808-6a3786f60db0",
                            slug : "pro"
                        }
                    ],
                    successUrl : process.env.POLAR_SUCCESS_URL,
                    authenticatedUsersOnly : true
                }),
                portal()
            ]
        })
    ]
})