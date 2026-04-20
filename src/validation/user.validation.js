import { z } from "zod";

const trimmedString = (fieldName) =>
    z
        .string({ required_error: `${fieldName} is required` })
        .trim()
        .min(1, `${fieldName} is required`);

const registerUserSchema = z.object({
    fullName: trimmedString("Full name"),
    email: trimmedString("Email").email("Enter a valid email address").transform((value) => value.toLowerCase()),
    username: trimmedString("Username")
        .min(3, "Username must be at least 3 characters long")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
        .transform((value) => value.toLowerCase()),
    password: trimmedString("Password").min(6, "Password must be at least 6 characters long")
});

const loginUserSchema = z
    .object({
        email: z
            .string()
            .trim()
            .email("Enter a valid email address")
            .transform((value) => value.toLowerCase())
            .optional()
            .or(z.literal("")),
        username: z
            .string()
            .trim()
            .min(1, "Username is required")
            .transform((value) => value.toLowerCase())
            .optional()
            .or(z.literal("")),
        password: trimmedString("Password")
    })
    .superRefine((data, ctx) => {
        if (!data.email && !data.username) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["email"],
                message: "Username or email is required"
            });
        }
    });

const refreshAccessTokenSchema = z.object({
    refreshToken: z.string().trim().optional()
});

const changePasswordSchema = z.object({
    oldPassword: trimmedString("Old password"),
    newPassword: trimmedString("New password").min(6, "New password must be at least 6 characters long")
});

const updateAccountDetailsSchema = z.object({
    fullName: trimmedString("Full name"),
    email: trimmedString("Email").email("Enter a valid email address").transform((value) => value.toLowerCase())
});

const channelProfileParamsSchema = z.object({
    username: trimmedString("Username").transform((value) => value.toLowerCase())
});

export {
    registerUserSchema,
    loginUserSchema,
    refreshAccessTokenSchema,
    changePasswordSchema,
    updateAccountDetailsSchema,
    channelProfileParamsSchema
};
