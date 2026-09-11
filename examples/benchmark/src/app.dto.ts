import { CONSTANTS, Model, ModelZ } from "@beiifeng/nestjs-validator";
import t from "typebox";
import z from "zod";

const $ZRole = z
  .object({
    code: z.string().min(1).max(10).meta({ description: "The code of the role", example: "ADMIN" }),
    name: z.string().min(1).max(20).meta({ description: "The name of the role", example: "Administrators" }),
    description: z.string().max(100).optional().meta({
      description: "The description of the role",
      example: "Administrators role for managing system settings.",
    }),
  })
  .meta({ $id: "urn:uuid:a3a89bea-99de-439a-9891-6c510eedb919" });

@Model($ZRole)
export class ZRole extends ModelZ($ZRole) {}

const $ZUser = z
  .object({
    id: z
      .uuid()
      .meta({ description: "The unique identifier of the user", example: "550e8400-e29b-41d4-a716-446655440000" }),
    username: z.string().min(1).max(20).meta({ description: "The username of the user", example: "john_doe" }),
    gender: z.enum(["male", "female", "other"]).meta({ description: "The gender of the user", example: "male" }),
    age: z.number().int().min(0).max(150).meta({ description: "The age of the user", example: 30 }),
    email: z.email().meta({ description: "The email of the user", example: "john_doe@example.com" }),
    roles: z
      .array($ZRole)
      .optional()
      .meta({
        description: "The roles of the user",
        example: [{ code: "ADMIN", name: "Administrators" }],
      }),
    createdAt: z.codec(
      z.iso.datetime().meta({ description: "The creation date of the user", example: "2024-06-05T12:00:00Z" }),
      z.date(),
      {
        decode: (value) => new Date(value),
        encode: (value) => value.toISOString(),
      },
    ),
  })
  .meta({ $id: "urn:uuid:5815ad83-1187-4e38-aec6-0f16fe378a2b" });

@Model($ZUser)
export class ZUser extends ModelZ($ZUser) {}

const $TRole = t.Object(
  {
    code: t.String({ minLength: 1, maxLength: 10, description: "The code of the role", examples: ["ADMIN"] }),
    name: t.String({ minLength: 1, maxLength: 20, description: "The name of the role", examples: ["Administrators"] }),
    description: t.Optional(
      t.String({
        maxLength: 100,
        description: "The description of the role",
        examples: ["Administrators role for managing system settings."],
      }),
    ),
  },
  { $id: "urn:uuid:a3a89bea-99de-439a-9891-6c510eedb919" },
);

@Model($TRole)
export class TRole extends ModelZ($TRole) {}

const $TUser = t.Object(
  {
    id: t.String({
      format: "uuid",
      description: "The unique identifier of the user",
      examples: ["550e8400-e29b-41d4-a716-446655440000"],
    }),
    username: t.String({
      minLength: 1,
      maxLength: 20,
      description: "The username of the user",
      examples: ["john_doe"],
    }),
    gender: t.Enum(["male", "female", "other"], { description: "The gender of the user", examples: ["male"] }),
    age: t.Number({ minimum: 0, maximum: 150, description: "The age of the user", examples: [30] }),
    email: t.String({ format: "email", description: "The email of the user", examples: ["john_doe@example.com"] }),
    roles: t.Optional(
      t.Array($TRole, { description: "The roles of the user", examples: [{ code: "ADMIN", name: "Administrators" }] }),
    ),
    createdAt: t
      .Codec(
        t.String({
          format: "date-time",
          description: "The creation date of the user",
          examples: ["2024-06-05T12:00:00Z"],
          [CONSTANTS.JSONLD_TYPE_KEY]: CONSTANTS.XSD_DATETIME,
        }),
      )
      .Decode((value) => new Date(value))
      .Encode((value) => value.toISOString()),
  },
  { $id: "urn:uuid:8f3b1c2a-1c4e-4b6a-9f3a-2b1c4e6a9f3a" },
);

@Model($TUser)
export class TUser extends ModelZ($TUser) {}
