const schema = {
    application: {
        fields: {
            name: { type: "string" as const, required: true },
            identifier: { type: "string" as const, required: true, unique: true, index: true },
            type: { type: "string" as const, required: true },
            logoKey: { type: "string" as const, required: false },
            publicKey: { type: "string" as const, required: false },
            registrationSecretHash: { type: "string" as const, required: false, returned: false },
            status: { type: "string" as const, required: true, defaultValue: "unverified" },
            active: { type: "boolean" as const, required: true, defaultValue: true },
            createdBy: {
                type: "string" as const,
                required: true,
                references: { model: "user", field: "id" },
                index: true,
            },
            createdAt: { type: "date" as const, required: true, defaultValue: () => new Date() },
            updatedAt: {
                type: "date" as const,
                required: true,
                defaultValue: () => new Date(),
                onUpdate: () => new Date(),
            },
        },
    },
}

export { schema }
