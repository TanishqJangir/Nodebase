"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { GOOGLE_SHEETS_SCRIPT } from "./utils";

const formSchema = z.object({
    variableName: z
        .string()
        .min(1, { message: "Variable name is required" })
        .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
            message: "Variable name must start with a letter or underscore.",
        }),
    webAppUrl: z.string().url("Must be a valid Web App URL (starts with https://script.google.com/...)"),
    sheetName: z.string().min(1, "Sheet name is required (e.g., Sheet1)"),
    values: z.string().min(1, "Values are required"),
});

export type GoogleSheetsFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: GoogleSheetsFormValues) => void;
    defaultValues?: Partial<GoogleSheetsFormValues>;
}

export const GoogleSheetsDialog = ({ open, onOpenChange, onSubmit, defaultValues = {} }: Props) => {
    const form = useForm<GoogleSheetsFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",
            webAppUrl: defaultValues.webAppUrl || "",
            sheetName: defaultValues.sheetName || "Sheet1",
            values: defaultValues.values || '["{{myTrigger.name}}"]',
        },
    });

    useEffect(() => {
        if (open) form.reset({
            variableName: defaultValues.variableName || "",
            webAppUrl: defaultValues.webAppUrl || "",
            sheetName: defaultValues.sheetName || "Sheet1",
            values: defaultValues.values || '["{{myTrigger.name}}"]',
        });
    }, [open, defaultValues, form]);

    const handleSubmit = (values: GoogleSheetsFormValues) => {
        onSubmit(values);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Google Sheets Configuration</DialogTitle>
                    <DialogDescription>Setup action to append rows to a Google Sheet.</DialogDescription>
                </DialogHeader>
                
                <div className="rounded-lg bg-muted p-4 space-y-3 mt-2">
                    <h4 className="font-medium text-sm">Apps Script Setup:</h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>In your Google Sheet, click <strong>Extensions &gt; Apps Script</strong></li>
                        <li>Paste the code below into <code>Code.gs</code></li>
                        <li>Click <strong>Deploy &gt; New deployment</strong></li>
                        <li>Select type <strong>Web app</strong></li>
                        <li>Set &quot;Who has access&quot; to <strong>Anyone</strong></li>
                        <li>Deploy and copy the Web App URL</li>
                    </ol>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        type="button"
                        onClick={async () => {
                            try {
                                await navigator.clipboard.writeText(GOOGLE_SHEETS_SCRIPT);
                                toast.success("Script copied to clipboard!");
                            } catch {
                                toast.error("Failed to copy script");
                            }
                        }}
                    >
                        <CopyIcon className="size-4 mr-2" />
                        Copy Apps Script
                    </Button>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-4">
                        <FormField
                            control={form.control}
                            name="variableName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Variable Name</FormLabel>
                                    <FormControl><Input placeholder="mySheet" {...field} /></FormControl>
                                    <FormDescription>Access response like {`{{mySheet.success}}`}</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="webAppUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Web App URL</FormLabel>
                                    <FormControl><Input placeholder="https://script.google.com/macros/s/..." {...field} /></FormControl>
                                    <FormDescription>The URL from Apps Script -&gt; Deploy -&gt; Web App.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="sheetName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sheet Name</FormLabel>
                                    <FormControl><Input placeholder="Sheet1" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="values"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Row Values (JSON Array)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder='["John Doe", "john@example.com"]' className="font-mono min-h-[100px]" {...field} />
                                    </FormControl>
                                    <FormDescription>An array of values. Use variables like {`["{{myTrigger.name}}"]`} to inject data from previous nodes.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter><Button type="submit">Save</Button></DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
