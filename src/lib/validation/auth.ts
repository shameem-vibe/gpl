import { z } from "zod";
import { ROLES } from "@/types/domain";

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.").max(254);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password.").max(256),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

/** Body of POST /api/auth/session. The ID token is verified server-side; its contents are never trusted from the client. */
export const sessionRequestSchema = z.object({ idToken: z.string().min(20).max(4096) });

export const roleSchema = z.enum(ROLES);

export const createAdminSchema = z.object({
  email: emailSchema,
  displayName: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  role: roleSchema,
});

export const updateAdminSchema = z
  .object({
    displayName: z.string().trim().min(2).max(80).optional(),
    role: roleSchema.optional(),
    active: z.boolean().optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: "Nothing to update." });

export const uidSchema = z.string().min(6).max(128).regex(/^[A-Za-z0-9_-]+$/);

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;
