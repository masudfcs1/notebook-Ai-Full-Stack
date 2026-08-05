export declare const multerConfig: {
    readonly uploadPath: string;
    readonly maxFileSize: {
        readonly image: number;
        readonly document: number;
        readonly video: number;
        readonly audio: number;
        readonly default: number;
    };
    readonly allowedMimeTypes: {
        readonly images: readonly ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
        readonly documents: readonly ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
        readonly videos: readonly ["video/mp4", "video/mpeg", "video/quicktime", "video/webm"];
        readonly audio: readonly ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm"];
    };
    readonly getUploadPath: (type: string) => string;
};
//# sourceMappingURL=multer.d.ts.map