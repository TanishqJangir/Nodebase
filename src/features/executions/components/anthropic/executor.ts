import Handlebars from "handlebars"
import { NonRetriableError } from "inngest";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic"
import type { NodeExecutor} from "@/features/executions/types";
import { anthropicChannel } from "@/inngest/channels/anthropic";
import { AVAILABLE_MODELS } from "./dialog";
import prisma from "@/lib/db";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});




type AnthropicData = {
  variableName?: string;
  model?: string;
  credentialId?: string;
  systemPrompt?: string;
  userPrompt?: string;
}

export const anthropicExecutor: NodeExecutor<AnthropicData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {

  await publish(
    anthropicChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if(!data.variableName){
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Anthropic Node: Variable name is missing");
  };

  if(!data.userPrompt){
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Anthropic Node: User prompt is missing");
  };

  if(!data.credentialId){
    await publish(
      anthropicChannel().status({ 
        nodeId, 
        status: "error" 
      })
    );
    throw new NonRetriableError("Anthropic Node: Credential is missing");
  };

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({
      where: {
        id: data.credentialId,
      },
    });
  });

  if(!credential){
    throw new NonRetriableError("Anthropic Node: Credential not found");
  }

  const credentialValue = credential.value;

  const anthropic = createAnthropic({
    apiKey: credentialValue,
  })

  try {

    const { steps } = await step.ai.wrap(
      "anthropic-generate-text",
      generateText,
      {
        model: anthropic(data.model || AVAILABLE_MODELS[0]), 
        system: systemPrompt,
        prompt: userPrompt,
        experimental_telemetry: {
          isEnabled: true,       //these 3 should be false according to coderabbit. See in the future
          recordInputs: true,
          recordOutputs: true,
        },
      },
    );


    const text = steps?.[0]?.content?.[0]?.type === "text"
      ? steps[0].content[0].text
      : "";

    await publish(
      anthropicChannel().status({
        nodeId,
        status: "success",
      })
    );

    return {
      ...context,
      [data.variableName]: {
        text,
      },
    }

  } catch (error) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Failed to generate text with Anthropic", {
      cause: error instanceof Error ? error : undefined,
    });
  }

}