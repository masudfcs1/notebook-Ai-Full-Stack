import { PAGINATION } from '@/constants';
import { IPaginatedResult, IPaginationOptions, IFilterOptions, ISortOptions, IMeta } from '@/interfaces';

interface PrismaModel {
  findMany: (args: unknown) => Promise<unknown[]>;
  count: (args: unknown) => Promise<number>;
}

export const calculatePagination = (options?: IPaginationOptions) => {
  const page = Math.max(options?.page ?? PAGINATION.DEFAULT_PAGE, 1);
  const limit = Math.min(options?.limit ?? PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const calculateMeta = (
  page: number,
  limit: number,
  total: number
): IMeta => {
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

export const buildSearchQuery = (search: string, fields: string[]) => {
  if (!search) return undefined;

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: search,
        mode: 'insensitive' as const,
      },
    })),
  };
};

export const buildSortQuery = (options?: ISortOptions) => {
  if (!options?.sortBy) return undefined;

  return {
    [options.sortBy]: options.sortOrder ?? 'asc',
  };
};

export const buildDateRangeQuery = (startDate?: Date, endDate?: Date) => {
  if (!startDate && !endDate) return undefined;

  return {
    createdAt: {
      ...(startDate && { gte: startDate }),
      ...(endDate && { lte: endDate }),
    },
  };
};

// Generic pagination function
export const paginate = async <T>(
  model: PrismaModel,
  options: {
    page?: number;
    limit?: number;
    search?: string;
    searchFields?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filter?: Record<string, unknown>;
    include?: unknown;
    select?: unknown;
  }
): Promise<IPaginatedResult<T>> => {
  const { page, limit, skip } = calculatePagination(options);

  const where = {
    ...options.filter,
    ...(options.search && options.searchFields
      ? buildSearchQuery(options.search, options.searchFields)
      : undefined),
  };

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      skip,
      take: limit,
      orderBy: buildSortQuery({
        sortBy: options.sortBy,
        sortOrder: options.sortOrder,
      }),
      ...(options.include ? { include: options.include } : {}),
      ...(options.select ? { select: options.select } : {}),
    }) as Promise<T[]>,
    model.count({ where }),
  ]);

  const meta = calculateMeta(page, limit, total);

  return { data, meta };
};

// Export utility for Prisma pagination
export const createPaginationParams = (options?: IPaginationOptions & ISortOptions & IFilterOptions) => {
  const { page, limit, skip } = calculatePagination(options);
  const orderBy = buildSortQuery(options);

  return {
    skip,
    take: limit,
    page,
    limit,
    orderBy,
  };
};
