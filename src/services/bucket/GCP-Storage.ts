import { IBucket } from "./IBucket";
import { Bucket, Storage } from '@google-cloud/storage';

export default class GCPStorage implements IBucket {
    client: Storage;
    bucket: Bucket;

    constructor() {
        if (!process.env.GCP_PROJECT_ID) {
            throw new Error('GCP_PROJECT_ID not found');
        }
        if (!process.env.GCP_KEY_FILE) {
            throw new Error('GCP_KEY_FILE not found');
        }
        if (!process.env.GCP_BUCKET_NAME) {
            throw new Error('GCP_BUCKET_NAME not found');
        }

        this.client = new Storage({
            projectId: process.env.GCP_PROJECT_ID,
            keyFile: JSON.parse(process.env.GCP_KEY_FILE)
            
        });

        this.bucket = this.client.bucket(process.env.GCP_BUCKET_NAME);
    }

    uploadFile(fileName: string, filePath: string, mimeType: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.bucket.upload(filePath, {
                destination: fileName,
                metadata: {
                    contentType: mimeType
                }
            }).then(() => {
                resolve(process.env.GCP_BUCKET_NAME + "/" + fileName);
            }).catch((err: any) => {
                reject(err);
            });
        });
    }
    list(filter: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            this.bucket.getFiles().then((data: any) => {
                resolve(data[0].map((item: any) => item.name));
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    delete(fileName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.bucket.file(fileName).delete().then(() => {
                resolve();
            }).catch((error: any) => {
                reject(error);
            });
        });
    }
    getSignedUrl(fileName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.bucket.file(fileName).getSignedUrl({
                action: 'read',
                expires: Date.now() + 1000 * 60 * 60 * 24 * 7
            }).then((data: any) => {
                resolve(data[0]);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

}
