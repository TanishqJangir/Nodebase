import Handlebars from "handlebars"
import { NonRetriableError } from "inngest";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai"
import type { NodeExecutor } from "@/features/executions/types";
import { openAiChannel } from "@/inngest/channels/openai";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});




type OpenAiData = {
  variableName?: string;
  model?: string;
  apiKey?: string;
  systemPrompt?: string;
  userPrompt?: string;
}

export const openAiExecutor: NodeExecutor<OpenAiData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {

  await publish(
    openAiChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if(!data.variableName){
    await publish(
      openAiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("OpenAi Node: Variable name is missing");
  };

  if(!data.userPrompt){
    await publish(
      openAiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("OpenAi Node: User prompt is missing");
  };

  if(!data.apiKey){
    await publish(
      openAiChannel().status({ 
        nodeId, 
        status: "error" 
      })
    );
    throw new NonRetriableError("OpenAi Node: API key is missing");
  };

  //TODO: Throw if credentials is missing

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  //TODO : fetch credentials that user selected

  const credentialValue = data.apiKey;

  const openai = createOpenAI({
    apiKey: credentialValue,
  })

  try {

    const { steps } = await step.ai.wrap(
      "openai-generate-text",
      generateText,
      {
        model: openai(data.model || "gpt-3.5-turbo"), 
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
      openAiChannel().status({
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
      openAiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Failed to generate text with OpenAI", {
      cause: error instanceof Error ? error : undefined,
    });
  }

}