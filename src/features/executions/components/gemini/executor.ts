import Handlebars from "handlebars"
import { NonRetriableError } from "inngest";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import type { NodeExecutor } from "@/features/executions/types";
import { geminiChannel } from "@/inngest/channels/gemini";
import { AVAILABLE_MODELS } from "./dialog";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});




type GeminiData = {
  variableName?: string;
  model?: string;
  apiKey?: string;
  systemPrompt?: string;
  userPrompt?: string;
}

export const geminiExecutor: NodeExecutor<GeminiData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {

  await publish(
    geminiChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if(!data.variableName){
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Gemini Node: Variable name is missing");
  };

  if(!data.userPrompt){
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Gemini Node: User prompt is missing");
  };

  if(!data.apiKey){
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Gemini Node: API key is missing");
  };

  //TODO: Throw if credentials is missing

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  //TODO : fetch credentials that user selected

  const credentialValue = data.apiKey;

  const google = createGoogleGenerativeAI({
    apiKey: credentialValue,
  })

  try {

    const { steps } = await step.ai.wrap(
      "gemini-generate-text",
      generateText,
      {
        model: google(data.model || "gemma-3-12b-it"),
        system: systemPrompt,
        prompt: userPrompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      },
    );

    const text = steps[0].content[0].type === "text"
      ? steps[0].content[0].text
      : "";

    await publish(
      geminiChannel().status({
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
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Failed to generate text with Gemini", {
      cause: error instanceof Error ? error : undefined,
    });
  }

}