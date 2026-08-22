"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateWithCursor = exports.decodeCursor = exports.encodeCursor = exports.createPaginationParams = exports.paginate = exports.buildDateRangeQuery = exports.buildSortQuery = exports.buildSearchQuery = exports.calculateMeta = exports.calculatePagination = void 0;
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
/**
 * Encode cursor string to base64 token
 */
const encodeCursor = (cursorValue) => {
    const str = cursorValue instanceof Date ? cursorValue.toISOString() : String(cursorValue);
    return Buffer.from(str, 'utf-8').toString('base64');
};
exports.encodeCursor = encodeCursor;
/**
 * Decode base64 cursor token to string
 */
const decodeCursor = (cursorToken) => {
    if (!cursorToken)
        return undefined;
    try {
        return Buffer.from(cursorToken, 'base64').toString('utf-8');
    }
    catch {
        return undefined;
    }
};
exports.decodeCursor = decodeCursor;
/**
 * Reusable cursor/token pagination processor for Prisma models
 */
const paginateWithCursor = async (model, options) => {
    const limit = Math.min(options.limit ?? constants_1.PAGINATION.DEFAULT_LIMIT, constants_1.PAGINATION.MAX_LIMIT);
    const cursorField = options.cursorField || 'id';
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';
    const decodedCursor = (0, exports.decodeCursor)(options.cursor);
    const where = {
        ...(options.where || {}),
    };
    // Cursor condition
    if (decodedCursor) {
        const isDateField = sortBy === 'createdAt' || sortBy === 'updatedAt';
        const parsedCursor = isDateField ? new Date(decodedCursor) : decodedCursor;
        if (sortOrder === 'desc') {
            where[sortBy] = { lt: parsedCursor };
        }
        else {
            where[sortBy] = { gt: parsedCursor };
        }
    }
    // Fetch limit + 1 items to determine if next page exists
    const [rawItems, total] = await Promise.all([
        model.findMany({
            where,
            take: limit + 1,
            orderBy: { [sortBy]: sortOrder },
            ...(options.include ? { include: options.include } : {}),
            ...(options.select ? { select: options.select } : {}),
        }),
        model.count({ where: options.where || {} }),
    ]);
    const hasMore = rawItems.length > limit;
    const data = hasMore ? rawItems.slice(0, limit) : rawItems;
    const lastItem = data[data.length - 1];
    const nextCursor = hasMore && lastItem ? (0, exports.encodeCursor)(lastItem[sortBy] ?? lastItem[cursorField]) : null;
    return {
        data,
        meta: {
            limit,
            total,
            hasMore,
            hasNext: hasMore,
            nextCursor,
        },
    };
};
exports.paginateWithCursor = paginateWithCursor;
//# sourceMappingURL=pagination.js.map