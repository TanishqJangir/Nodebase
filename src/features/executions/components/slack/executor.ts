import Handlebars from "handlebars"
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import ky from "ky";
import { slackChannel } from "@/inngest/channels/slack";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});


type SlackData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
}

export const slackExecutor: NodeExecutor<SlackData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
  publish,
}) => {

  await publish(
    slackChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.content) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Slack Node: Content is missing");
  };


  const rawContent = Handlebars.compile(data.content)(context);

  const content = decode(rawContent);


  try {

    const result = await step.run("slack-webhook", async () => {

      if (!data.webhookUrl) {
        await publish(
          slackChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError("Slack Node: Webhook URL is missing");
      };

      await ky.post(data.webhookUrl, {
        json: {
          content: content, //The key depends on the workflow config
        },
      });


      if (!data.variableName) {
        await publish(
          slackChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError("Slack Node: Variable Name is missing");
      };

      return {
        ...context,
        [data.variableName]: {
          messageContent: content.slice(0, 2000),
        },
      }

    })

    await publish(
      slackChannel().status({
        nodeId,
        status: "success",
      })
    );

    return result;

  } catch (error) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }

}