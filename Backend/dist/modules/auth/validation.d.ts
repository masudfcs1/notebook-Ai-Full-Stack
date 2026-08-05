import { z } from 'zod';
export declare const RegisterSchema: z.ZodObject<{
    body: z.ZodEffects<z.ZodObject<{
        name: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        username: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        email: z.ZodString;
        password: z.ZodString;
        confirmPassword: z.ZodString;
        phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, "strip", z.ZodTypeAny, {
        password: string;
        email: string;
        confirmPassword: string;
        name?: string | undefined;
        username?: string | undefined;
        phone?: string | undefined;
    }, {
        password: string;
        email: string;
        confirmPassword: string;
        name?: string | undefined;
        username?: string | undefined;
        phone?: string | undefined;
    }>, {
        password: string;
        email: string;
        confirmPassword: string;
        name?: string | undefined;
        username?: string | undefined;
        phone?: string | undefined;
    }, {
        password: string;
        email: string;
        confirmPassword: string;
        name?: string | undefined;
        username?: string | undefined;
        phone?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        password: string;
        email: string;
        confirmPassword: string;
        name?: string | undefined;
        username?: string | undefined;
        phone?: string | undefined;
    };
}, {
    body: {
        password: string;
        email: string;
        confirmPassword: string;
        name?: string | undefined;
        username?: string | undefined;
        phone?: string | undefined;
    };
}>;
export declare const LoginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        rememberMe: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        password: string;
        email: string;
        rememberMe?: boolean | undefined;
    }, {
        password: string;
        email: string;
        rememberMe?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        password: string;
        email: string;
        rememberMe?: boolean | undefined;
    };
}, {
    body: {
        password: string;
        email: string;
        rememberMe?: boolean | undefined;
    };
}>;
export declare const RefreshTokenSchema: z.ZodObject<{
    body: z.ZodObject<{
        refreshToken: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        refreshToken?: string | undefined;
    }, {
        refreshToken?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        refreshToken?: string | undefined;
    };
}, {
    body: {
        refreshToken?: string | undefined;
    };
}>;
export declare const ChangePasswordSchema: z.ZodObject<{
    body: z.ZodEffects<z.ZodObject<{
        currentPassword: z.ZodString;
        newPassword: z.ZodString;
        confirmPassword: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        confirmPassword: string;
        currentPassword: string;
        newPassword: string;
    }, {
        confirmPassword: string;
        currentPassword: string;
        newPassword: string;
    }>, {
        confirmPassword: string;
        currentPassword: string;
        newPassword: string;
    }, {
        confirmPassword: string;
        currentPassword: string;
        newPassword: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        confirmPassword: string;
        currentPassword: string;
        newPassword: string;
    };
}, {
    body: {
        confirmPassword: string;
        currentPassword: string;
        newPassword: string;
    };
}>;
export declare const ForgotPasswordSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
    }, {
        email: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
    };
}, {
    body: {
        email: string;
    };
}>;
export declare const ResetPasswordSchema: z.ZodObject<{
    body: z.ZodEffects<z.ZodObject<{
        token: z.ZodString;
        password: z.ZodString;
        confirmPassword: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        password: string;
        token: string;
        confirmPassword: string;
    }, {
        password: string;
        token: string;
        confirmPassword: string;
    }>, {
        password: string;
        token: string;
        confirmPassword: string;
    }, {
        password: string;
        token: string;
        confirmPassword: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        password: string;
        token: string;
        confirmPassword: string;
    };
}, {
    body: {
        password: string;
        token: string;
        confirmPassword: string;
    };
}>;
export declare const VerifyEmailSchema: z.ZodObject<{
    body: z.ZodObject<{
        token: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        token: string;
    }, {
        token: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        token: string;
    };
}, {
    body: {
        token: string;
    };
}>;
export declare const ResendVerificationSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
    }, {
        email: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
    };
}, {
    body: {
        email: string;
    };
}>;
export declare const SendOTPSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
    }, {
        email: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
    };
}, {
    body: {
        email: string;
    };
}>;
export declare const VerifyOTPSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        otp: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        otp: string;
    }, {
        email: string;
        otp: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
        otp: string;
    };
}, {
    body: {
        email: string;
        otp: string;
    };
}>;
export declare const UpdateProfileSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        username: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        username?: string | undefined;
        phone?: string | undefined;
    }, {
        name?: string | undefined;
        username?: string | undefined;
        phone?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name?: string | undefined;
        username?: string | undefined;
        phone?: string | undefined;
    };
}, {
    body: {
        name?: string | undefined;
        username?: string | undefined;
        phone?: string | undefined;
    };
}>;
export declare const DeleteAccountSchema: z.ZodObject<{
    body: z.ZodObject<{
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        password: string;
    }, {
        password: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        password: string;
    };
}, {
    body: {
        password: string;
    };
}>;
export type RegisterInput = z.infer<typeof RegisterSchema>['body'];
export type LoginInput = z.infer<typeof LoginSchema>['body'];
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>['body'];
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>['body'];
//# sourceMappingURL=validation.d.ts.map