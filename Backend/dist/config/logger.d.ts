export declare const loggerConfig: {
    level: string;
    prettyPrint: boolean;
    redact: string[];
    serializers: {
        req: (req: {
            method?: string;
            url?: string;
            headers?: Record<string, string>;
            body?: unknown;
        }) => {
            method: string | undefined;
            url: string | undefined;
            headers: {
                'content-type': string | undefined;
                'user-agent': string | undefined;
                'x-request-id': string | undefined;
            };
        };
        res: (res: {
            statusCode: number;
        }) => {
            statusCode: number;
        };
    };
};
//# sourceMappingURL=logger.d.ts.map