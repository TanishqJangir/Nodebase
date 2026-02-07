import { inngest } from "@/inngest/client";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "../init";
import prisma from "@/lib/db";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { toast } from "sonner";

export const appRouter = createTRPCRouter({
    testAi: baseProcedure.mutation(async () => {

        await inngest.send({
            name : "execute/ai"
        })

    }),



    getWorkflows: protectedProcedure.query(({ ctx }) => {
        return prisma.workFlow.findMany();
    }),



    createWorkflow: protectedProcedure.mutation(async () => {

        await inngest.send({
            name: "test/hello.world",
            data: {
                email: "tanishqjangir@gmail.com"
            }
        })

        return { success: true, message: "Job queued" }
    })
});

export type AppRouter = typeof appRouter;