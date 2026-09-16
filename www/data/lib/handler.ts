import type { z } from "zod"

export function defaultHandlers<Schema extends z.ZodType>(
    schema: Schema
) {
    return (value: z.input<Schema>): z.infer<Schema> =>
        schema.parse(value)
}
