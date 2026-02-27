import { Polar } from "@polar-sh/sdk";

export const polarClient = new Polar({
    accessToken : process.env.POLAR_ACCESS_TOKEN,
    server : "production" //DEV: Change it to sandbox for the development environment,
    
})
