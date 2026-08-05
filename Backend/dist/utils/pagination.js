"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaginationParams = exports.paginate = exports.buildDateRangeQuery = exports.buildSortQuery = exports.buildSearchQuery = exports.calculateMeta = exports.calculatePagination = void 0;
const constants_1 = require("../constants");
const calculatePagination = (options) => {
    const page = Math.max(options?.page ?? constants_1.PAGINATION.DEFAULT_PAGE, 1);
    const limit = Math.min(options?.limit ?? constants_1.PAGINATION.DEFAULT_LIMIT, constants_1.PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
exports.calculatePagination = calculatePagination;
const calculateMeta = (page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
};
exports.calculateMeta = calculateMeta;
const buildSearchQuery = (search, fields) => {
    if (!search)
        return undefined;
    return {
        OR: fields.map((field) => ({
            [field]: {
                contains: search,
                mode: 'insensitive',
            },
        })),
    };
};
exports.buildSearchQuery = buildSearchQuery;
const buildSortQuery = (options) => {
    if (!options?.sortBy)
        return undefined;
    return {
        [options.sortBy]: options.sortOrder ?? 'asc',
    };
};
exports.buildSortQuery = buildSortQuery;
const buildDateRangeQuery = (startDate, endDate) => {
    if (!startDate && !endDate)
        return undefined;
    return {
        createdAt: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
        },
    };
};
exports.buildDateRangeQuery = buildDateRangeQuery;
// Generic pagination function
const paginate = async (model, options) => {
    const { page, limit, skip } = (0, exports.calculatePagination)(options);
    const where = {
        ...options.filter,
        ...(options.search && options.searchFields
            ? (0, exports.buildSearchQuery)(options.search, options.searchFields)
            : undefined),
    };
    const [data, total] = await Promise.all([
        model.findMany({
            where,
            skip,
            take: limit,
            orderBy: (0, exports.buildSortQuery)({
                sortBy: options.sortBy,
                sortOrder: options.sortOrder,
            }),
            ...(options.include ? { include: options.include } : {}),
            ...(options.select ? { select: options.select } : {}),
        }),
        model.count({ where }),
    ]);
    const meta = (0, exports.calculateMeta)(page, limit, total);
    return { data, meta };
};
exports.paginate = paginate;
// Export utility for Prisma pagination
const createPaginationParams = (options) => {
    const { page, limit, skip } = (0, exports.calculatePagination)(options);
    const orderBy = (0, exports.buildSortQuery)(options);
    return {
        skip,
        take: limit,
        page,
        limit,
        orderBy,
    };
};
exports.createPaginationParams = createPaginationParams;
//# sourceMappingURL=pagination.js.map