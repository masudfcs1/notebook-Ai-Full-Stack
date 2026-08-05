import { IPaginatedResult, IPaginationOptions, IFilterOptions, ISortOptions, IMeta } from '../interfaces';
interface PrismaModel {
    findMany: (args: unknown) => Promise<unknown[]>;
    count: (args: unknown) => Promise<number>;
}
export declare const calculatePagination: (options?: IPaginationOptions) => {
    page: number;
    limit: number;
    skip: number;
};
export declare const calculateMeta: (page: number, limit: number, total: number) => IMeta;
export declare const buildSearchQuery: (search: string, fields: string[]) => {
    OR: {
        [x: string]: {
            contains: string;
            mode: "insensitive";
        };
    }[];
} | undefined;
export declare const buildSortQuery: (options?: ISortOptions) => {
    [x: string]: "asc" | "desc";
} | undefined;
export declare const buildDateRangeQuery: (startDate?: Date, endDate?: Date) => {
    createdAt: {
        lte?: Date | undefined;
        gte?: Date | undefined;
    };
} | undefined;
export declare const paginate: <T>(model: PrismaModel, options: {
    page?: number;
    limit?: number;
    search?: string;
    searchFields?: string[];
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    filter?: Record<string, unknown>;
    include?: unknown;
    select?: unknown;
}) => Promise<IPaginatedResult<T>>;
export declare const createPaginationParams: (options?: IPaginationOptions & ISortOptions & IFilterOptions) => {
    skip: number;
    take: number;
    page: number;
    limit: number;
    orderBy: {
        [x: string]: "asc" | "desc";
    } | undefined;
};
export {};
//# sourceMappingURL=pagination.d.ts.map