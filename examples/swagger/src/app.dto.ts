import { Model, ModelZ } from "@beiifeng/nestjs-validator";
import t from "typebox";
import z from "zod";

const $Role = z
  .object({
    name: z.string().min(1).max(20).meta({ description: "The name of the role", example: "admin" }),
    description: z
      .string()
      .max(100)
      .optional()
      .meta({ description: "The description of the role", example: "Administrator role" }),
  })
  // Execute `node -e "console.log(`urn:uuid:${crypto.randomUUID()}`)"` in terminal to generate a unique UUID for each model.
  .meta({ $id: `urn:uuid:9aee8306-7fb1-41cc-a6e5-5bd829172ea3` });

@Model($Role)
export class Role extends ModelZ($Role) {}

const $User = z
  .object({
    username: z.string().min(1).max(20).meta({ description: "The username of the user", example: "john_doe" }),
    gender: z.enum(["male", "female", "other"]).meta({ description: "The gender of the user", example: "male" }),
    age: z.number().int().min(0).max(150).meta({ description: "The age of the user", example: 30 }),
    email: z.email().meta({ description: "The email of the user", example: "john_doe@example.com" }),
    roles: z
      .array($Role)
      .optional()
      .meta({ description: "The roles of the user", example: [{ name: "admin", description: "Administrator role" }] }),
    createdAt: z.date().meta({ description: "The creation date of the user", example: "2024-06-05T12:00:00Z" }),
  })
  // Execute `node -e "console.log(`urn:uuid:${crypto.randomUUID()}`)"` in terminal to generate a unique UUID for each model.
  .meta({ $id: `urn:uuid:96a62b19-1bca-4869-b441-8e7a82dcd2cb` });

@Model($User)
export class User extends ModelZ($User) {}

const $Order = t.Object(
  {
    orderId: t.String({ minLength: 1, maxLength: 20, description: "The ID of the order", example: "ORD123456" }),
    userId: t.String({
      minLength: 1,
      maxLength: 20,
      description: "The ID of the user who placed the order",
      example: "USR123456",
    }),
    amount: t.Number({ minimum: 0, description: "The total amount of the order", example: 99.99 }),
    status: t.Enum(
      { pending: "pending", completed: "completed", cancelled: "cancelled" },
      { description: "The status of the order", example: "pending" },
    ),
    createdAt: t.String({
      format: "date-time",
      description: "The creation date of the order",
      example: "2024-06-05T12:00:00Z",
    }),
  },
  { $id: "urn:uuid:a1b2c3d4-e5f6-7890-abcd-ef1234567890" },
);

@Model($Order)
export class Order extends ModelZ($Order) {}
