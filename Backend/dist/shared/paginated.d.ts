import { z } from 'zod';
export declare const PaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortOrder: "asc" | "desc";
    sortBy?: string | undefined;
    search?: string | undefined;
}, {
    limit?: number | undefined;
    sortBy?: string | undefined;
    page?: number | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    search?: string | undefined;
}>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
//# sourceMappingURL=paginated.d.ts.map