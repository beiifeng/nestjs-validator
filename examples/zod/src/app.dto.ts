import { Model, ModelZ } from "@beiifeng/nestjs-validator";
import z from "zod";

const $Role = z
  .object({
    name: z.string().min(1).max(20),
    description: z.string().max(100).optional(),
  })
  // Execute `node -e "console.log(`urn:uuid:${crypto.randomUUID()}`)"` in terminal to generate a unique UUID for each model.
  .meta({ $id: `urn:uuid:9aee8306-7fb1-41cc-a6e5-5bd829172ea3` });

@Model($Role)
export class Role extends ModelZ($Role) {}

const $User = z
  .object({
    username: z.string().min(1).max(20),
    gender: z.enum(["male", "female", "other"]),
    age: z.number().int().min(0).max(150),
    email: z.email(),
    roles: z.array($Role).optional(),
  })
  // Execute `node -e "console.log(`urn:uuid:${crypto.randomUUID()}`)"` in terminal to generate a unique UUID for each model.
  .meta({ $id: `urn:uuid:96a62b19-1bca-4869-b441-8e7a82dcd2cb` });

@Model($User)
export class User extends ModelZ($User) {}
