export declare const cookieConfig: {
    readonly secret: string;
    readonly options: {
        readonly httpOnly: true;
        readonly secure: boolean;
        readonly sameSite: "strict" | "lax";
        readonly maxAge: number;
        readonly path: "/";
    };
};
export declare const accessTokenCookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "strict" | "lax" | "none";
    maxAge: number;
    path: string;
};
export declare const refreshTokenCookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "strict" | "lax" | "none";
    maxAge: number;
    path: string;
};
//# sourceMappingURL=cookie.d.ts.map