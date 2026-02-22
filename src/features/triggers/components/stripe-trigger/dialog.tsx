"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";


interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const StripeTriggerDialog = ({
    open,
    onOpenChange,
}: Props) => {

    const params = useParams();
    const workflowId = params.workflowId as string;


    //construct the webhook URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const webhookUrl = `${baseUrl}/api/webhooks/stripe?workflowId=${workflowId}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(webhookUrl);
            toast.success("Webhook URL copied to clipboard!");
        } catch (err) {
            toast.error("Failed to copy webhook URL. Please try copying manually.");
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>

                <DialogHeader>
                    <DialogTitle>Stripe Trigger Configuration</DialogTitle>
                    <DialogDescription>
                        Configure this webhook URL in your Stripe dashboard to trigger this workflow on specific events.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="webhook-url">
                            Webhook URL
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="webhook-url"
                                value={webhookUrl}
                                readOnly
                                className="font-mono text-sm"
                            />
                            <Button
                                variant="outline"
                                type="button"
                                size="icon"
                                onClick={copyToClipboard}
                            >
                                <CopyIcon className="size-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-lg bg-muted p-4 space-y-2">
                        <h4 className="font-medium text-sm">Setup instructions:</h4>
                        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                            <li>Open your Stripe Dashboard</li>
                            <li>Go to developers → Webhooks</li>
                            <li>Click "Add endpoint"</li>
                            <li>Paste the webhook URL above</li>
                            <li>Select event for listen for (e.g., payment_intent.succeeded)</li>
                            <li>Copy and save the signing secret</li>
                        </ol>
                    </div>

                    

                    <div className="rounded-lg bg-muted p-4 space-y-2">
                        <h4 className="font-medium text-sm">Available Variables</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>
                                <code className="bg-background px-1 py-0.5 rounded"
                                >{"{{stripe.amount}}"}</code>- Payment amount
                            </li>
                            <li>
                                <code className="bg-background px-1 py-0.5 rounded" 
                                >{"{{stripe.currency}}"}</code>- Payment currency
                            </li>
                            <li>
                                <code className="bg-background px-1 py-0.5 rounded"
                                >{"{{stripe.customerId}}"}</code>- Customer ID
                            </li>
                            <li>
                                <code className="bg-background px-1 py-0.5 rounded"
                                >{"{{stripe json}}"}</code>- Full event data as JSON
                            </li>
                            <li>
                                <code className="bg-background px-1 py-0.5 rounded"
                                >{"{{stripe.eventType}}"}</code>- Event type (e.g., payment_intent.succeeded)
                            </li>
                        </ul>

                    </div>

                </div>
            </DialogContent>
        </Dialog>
    )
}
