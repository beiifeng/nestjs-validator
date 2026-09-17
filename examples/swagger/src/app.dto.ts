import { CONSTANTS, Model, ModelZ } from "@beiifeng/nestjs-validator";
import t from "typebox";
import z from "zod";

const $ZRole = z
  .object({
    id: z.uuid().optional(),
    code: z.string().min(1).max(10).meta({ description: "The code of the role", example: "ADMIN" }),
    name: z.string().min(1).max(20).meta({ description: "The name of the role", example: "administrators" }),
    description: z
      .string()
      .max(100)
      .optional()
      .meta({ description: "The description of the role", example: "Administrator role" }),
  })
  // Execute `node -e "console.log(`urn:uuid:${crypto.randomUUID()}`)"` in terminal to generate a unique UUID for each model.
  .meta({ $id: "urn:uuid:9aee8306-7fb1-41cc-a6e5-5bd829172ea3" });

@Model($ZRole)
export class ZRole extends ModelZ($ZRole) {
  toLabelName() {
    return `${this.name} [${this.code}]`;
  }
}

const $ZUser = z
  .object({
    id: z.uuid().optional(),
    displayName: z.string().min(1).max(50).meta({ description: "The display name of the user", example: "ShiXun Liu" }),
    preferredName: z
      .string()
      .min(1)
      .max(50)
      .optional()
      .meta({ description: "The preferred name of the user", example: "ShiXun" }),
    legalName: z
      .string()
      .min(1)
      .max(50)
      .optional()
      .meta({ description: "The legal name of the user", example: "ShiXun Liu" }),
    gender: z
      .enum(["male", "female", "non_binary", "undisclosed"])
      .optional()
      .meta({ description: "The gender of the user", example: "male" }),
    email: z.email().meta({ description: "The email of the user", example: "shixun.liu@example.com" }),
    birthday: z.iso
      .datetime()
      .meta({
        description: "The birthday of the user",
        example: "2001-06-05T12:00:00Z",
        [CONSTANTS.JSONLD_TYPE_KEY]: CONSTANTS.XSD_DATETIME,
      })
      .transform((val) => new Date(val)),
    timezoneOffset: z
      .number()
      .min(-720)
      .max(720)
      .optional()
      .meta({ description: "The timezone offset of the user in minutes", example: -480 }),
    roles: z
      .array($ZRole)
      .optional()
      .meta({
        description: "The roles of the user",
        example: [{ code: "ADMIN", name: "administrators", description: "Administrator role" }],
      }),
  })
  // Execute `node -e "console.log(`urn:uuid:${crypto.randomUUID()}`)"` in terminal to generate a unique UUID for each model.
  .meta({ $id: "urn:uuid:96a62b19-1bca-4869-b441-8e7a82dcd2cb" });

@Model($ZUser)
export class ZUser extends ModelZ($ZUser) {
  roles?: ZRole[];

  get age(): number | "N/A" {
    if (!this.birthday) {
      return "N/A";
    }
    const today = new Date();
    const age = today.getUTCFullYear() - this.birthday.getUTCFullYear();
    const hasHadBirthday =
      today.getUTCMonth() > this.birthday.getUTCMonth() ||
      (today.getUTCMonth() === this.birthday.getUTCMonth() && today.getUTCDate() >= this.birthday.getUTCDate());
    return hasHadBirthday ? age : age - 1;
  }
  about() {
    return `Hi, I'm ${this.preferredName}, you can call me ${this.displayName}, I'm ${this.age} years old.
This is my email: ${this.email}, and my timezone offset is ${this.timezoneOffset} minutes.
Your can reach me any time.
Thank you!`;
  }
}

const $TRole = t.Object(
  {
    id: t.Optional(t.String({ format: "uuid" })),
    code: t.String({ minLength: 1, maxLength: 10, description: "The code of the role", example: "ADMIN" }),
    name: t.String({ minLength: 1, maxLength: 20, description: "The name of the role", example: "administrators" }),
    description: t.Optional(
      t.String({ maxLength: 100, description: "The description of the role", example: "Administrator role" }),
    ),
  },
  { $id: "urn:uuid:66b0ebf5-0d33-44d1-b13b-7ea6c77bbb2d" },
);

@Model($TRole)
export class TRole extends ModelZ($TRole) {
  toLabelName() {
    return `${this.name} [${this.code}]`;
  }
}

const $TUser = t.Object(
  {
    id: t.Optional(t.String({ format: "uuid" })),
    displayName: t.String({
      minLength: 1,
      maxLength: 50,
      description: "The display name of the user",
      example: "ShiXun Liu",
    }),
    preferredName: t.Optional(
      t.String({ minLength: 1, maxLength: 50, description: "The preferred name of the user", example: "ShiXun" }),
    ),
    legalName: t.Optional(
      t.String({ minLength: 1, maxLength: 50, description: "The legal name of the user", example: "ShiXun Liu" }),
    ),
    gender: t.Optional(
      t.Enum(["male", "female", "non_binary", "undisclosed"], {
        description: "The gender of the user",
        example: "male",
      }),
    ),
    email: t.String({ format: "email", description: "The email of the user", example: "shixun.liu@example.com" }),
    birthday: t
      .Codec(
        t.String({
          format: "date-time",
          description: "The birthday of the user",
          example: "2001-06-05T12:00:00Z",
          [CONSTANTS.JSONLD_TYPE_KEY]: CONSTANTS.XSD_DATETIME,
        }),
      )
      .Decode((value) => new Date(value))
      .Encode((value) => value.toISOString()),
    timezoneOffset: t.Optional(
      t.Number({
        minimum: -720,
        maximum: 720,
        description: "The timezone offset of the user in minutes",
        example: -480,
      }),
    ),
    roles: t.Optional(
      t.Array($TRole, {
        description: "The roles of the user",
        example: [{ code: "ADMIN", name: "administrators", description: "Administrator role" }],
      }),
    ),
  },
  { $id: "urn:uuid:8f69eb33-124f-4b71-a266-187ab7267a9c" },
);

@Model($TUser)
export class TUser extends ModelZ($TUser) {
  roles?: TRole[];

  get age(): number | "N/A" {
    if (!this.birthday) return "N/A";
    const today = new Date();
    const age = today.getUTCFullYear() - this.birthday.getUTCFullYear();
    const hasHadBirthday =
      today.getUTCMonth() > this.birthday.getUTCMonth() ||
      (today.getUTCMonth() === this.birthday.getUTCMonth() && today.getUTCDate() >= this.birthday.getUTCDate());
    return hasHadBirthday ? age : age - 1;
  }

  about() {
    return `Hi, I'm ${this.preferredName}, you can call me ${this.displayName}, I'm ${this.age} years old.
This is my email: ${this.email}, and my timezone offset is ${this.timezoneOffset} minutes.
Your can reach me any time.
Thank you!`;
  }
}
