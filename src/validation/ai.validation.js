import { z } from "zod";

const trimmedString = (fieldName) =>
    z
        .string({ required_error: `${fieldName} is required` })
        .trim()
        .min(1, `${fieldName} is required`);

const moderateContentSchema = z.object({
    title: trimmedString("Title"),
    description: z.string().trim().optional().default(""),
});

const smartSearchSchema = z.object({
    query: trimmedString("Search query"),
});

const generateDescriptionSchema = z.object({
    title: trimmedString("Title"),
    hints: z.string().trim().optional().default(""),
});

export {
    moderateContentSchema,
    smartSearchSchema,
    generateDescriptionSchema,
};
