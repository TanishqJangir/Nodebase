import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import { googleSheetsChannel } from "@/inngest/channels/google-sheets";

type GoogleSheetsData = {
    variableName?: string;
    webAppUrl?: string;
    sheetName?: string;
    values?: string;
};

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context);
    return new Handlebars.SafeString(jsonString);
});

export const googleSheetsExecutor: NodeExecutor<GoogleSheetsData> = async ({
    data,
    nodeId,
    userId,
    context,
    step,
    publish,
}) => {
    const nodeData = data;

    await publish(
        googleSheetsChannel().status({ nodeId, status: "loading" })
    );

    try {
        if (!nodeData.webAppUrl) {
            throw new NonRetriableError("Google Sheets Node: Web App URL is missing");
        }

        if (!nodeData.sheetName) {
            throw new NonRetriableError("Google Sheets Node: Sheet Name is missing");
        }

        // Interpolate Handlebars variables like {{myTrigger.name}}
        const valuesTemplate = Handlebars.compile(nodeData.values || "[]");
        const renderedValuesJSON = valuesTemplate(context);

        let valuesArray: any[];
        try {
            valuesArray = JSON.parse(renderedValuesJSON);
            if (!Array.isArray(valuesArray)) {
                throw new NonRetriableError("Google Sheets Node: Parsed values is not an array");
            }
        } catch (err: any) {
            throw new NonRetriableError(`Google Sheets Node: Failed to parse values: ${err.message}. Raw: ${renderedValuesJSON}`);
        }

        const responseData = await step.run("append-to-google-sheet", async () => {
            const result = await fetch(nodeData.webAppUrl!, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sheetName: nodeData.sheetName, values: valuesArray }),
            });

            const responseText = await result.text();
            let jsonResponse: any;
            try {
                jsonResponse = JSON.parse(responseText);
            } catch {
                jsonResponse = { rawText: responseText };
            }

            if (!result.ok) {
                if (result.status >= 500) {
                    throw new Error(jsonResponse.error || `Failed with status ${result.status}`);
                }
                throw new NonRetriableError(jsonResponse.error || `Failed with status ${result.status}`);
            }

            if (jsonResponse.error) {
                throw new NonRetriableError(`Google Sheets error: ${jsonResponse.error}`);
            }

            return jsonResponse;
        });

        await publish(
            googleSheetsChannel().status({ nodeId, status: "success" })
        );

        return {
            ...context,
            [nodeData.variableName || "mySheet"]: responseData,
        };

    } catch (error) {
        await publish(
            googleSheetsChannel().status({ nodeId, status: "error" })
        );
        throw error;
    }
};
