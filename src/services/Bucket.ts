import AwsBucket from "./bucket/AWS-S3";
import GCPStorage from "./bucket/GCP-Storage";
import { IBucket } from "./bucket/IBucket";

export default class Bucket implements IBucket  {
    private bucket: IBucket;
    constructor(
        private service: 'aws' | 'gcp' = 'aws',
    ) {
        switch (service) {
            case 'aws':
                this.bucket = new AwsBucket();
                break;
            case 'gcp':
                this.bucket = new GCPStorage();
                break;
            default:
                throw new Error('Invalid service');
    }
}
    uploadFile(fileName: string, filePath: string, mimeType: string): Promise<string> {
        return this.bucket.uploadFile(fileName, filePath, mimeType);
    }
    list(filter: string): Promise<string[]> {
        return this.bucket.list(filter);
    }
    delete(fileName: string): Promise<void> {
        return this.bucket.delete(fileName);
    }
    getSignedUrl(fileName: string): Promise<string> {
        return this.bucket.getSignedUrl(fileName);
    }

}

