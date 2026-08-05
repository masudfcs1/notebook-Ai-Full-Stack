export declare class AppError extends Error {
    statusCode: number;
    errors?: unknown[];
    isOperational: boolean;
    constructor(statusCode: number, message: string, errors?: unknown[]);
    static badRequest(message: string, errors?: unknown[]): AppError;
    static unauthorized(message?: string): AppError;
    static forbidden(message?: string): AppError;
    static notFound(message: string): AppError;
    static conflict(message: string): AppError;
    static invalidCredentials(): AppError;
    static validationFailed(errors: unknown[]): AppError;
    static tooManyRequests(message?: string): AppError;
    static internal(message?: string): AppError;
}
//# sourceMappingURL=error.helper.d.ts.map