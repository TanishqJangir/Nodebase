import Handlebars from "handlebars"
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import { discordChannel } from "@/inngest/channels/discord";
import ky from "ky";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});




type DiscordData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
  username?: string;
}

export const discordExecutor: NodeExecutor<DiscordData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
  publish,
}) => {

  await publish(
    discordChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.content) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Discord Node: Content is missing");
  };


  const rawContent = Handlebars.compile(data.content)(context);

  const content = decode(rawContent);
  const username = data.username
    ? decode(Handlebars.compile(data.username)(context))
    : undefined;


  try {

    const result = await step.run("discord-webhook", async () => {

      if (!data.webhookUrl) {
        await publish(
          discordChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError("Discord Node: Webhook URL is missing");
      };

      await ky.post(data.webhookUrl, {
        json: {
          content: content.slice(0, 2000), //Discord has a max message length of 2000 characters
          username,
        },
      });


      if (!data.variableName) {
        await publish(
          discordChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError("Discord Node: Variable Name is missing");
      };

      return {
        ...context,
        [data.variableName]: {
          messageContent: content.slice(0, 2000),
        },
      }

    })

    await publish(
      discordChannel().status({
        nodeId,
        status: "success",
      })
    );

    return result;

  } catch (error) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Failed to send Discord message", {
      cause: error instanceof Error ? error : undefined,
    });
  }

}