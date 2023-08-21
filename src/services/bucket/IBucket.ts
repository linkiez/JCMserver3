export interface IBucket {
    client?: any;
    uploadFile(fileName: string, filePath: string, mimeType: string): Promise<string>;
    list(filter: string): Promise<string[]>;
    delete(fileName: string): Promise<void>;
    getSignedUrl(fileName: string): Promise<string>;
}
