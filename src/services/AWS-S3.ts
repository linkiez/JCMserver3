import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";
import fs from "fs";

export class S3 {
  static async uploadFile(fileName: string, filePath: string, mimeType: string) {
    
    const s3 = this.newS3Client();

    const stream = fs.createReadStream(filePath);
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: stream,
      ContentType: mimeType,
    });
    await s3.send(command);
    

    return process.env.AWS_S3_BUCKET + "/" + fileName;
  }

  static async listObjects(filter: string) {
    const s3 = this.newS3Client();

    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: decodeURIComponent(filter),
    });

    const response = await s3.send(command);

    if (response?.Contents) {
      return response.Contents.map((item) => item.Key);
    }

    return [];
  }

  static async deleteFromS3(fileName: string) {
    const s3 = this.newS3Client();

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
    });

    await s3.send(command);
  }

  static async getSignedUrl(fileName: string) {
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
    });

    const signedUrlExpireSeconds = 3600;

    return getSignedUrl(s3,command, { expiresIn: signedUrlExpireSeconds });
  }

  static newS3Client() {
    if (!process.env.AWS_REGION) throw new Error("AWS_REGION not defined");
    if (!process.env.AWS_ACCESS_KEY_ID)
      throw new Error("AWS_ACCESS_KEY_ID not defined");
    if (!process.env.AWS_SECRET_ACCESS_KEY)
      throw new Error("AWS_SECRET_ACCESS_KEY not defined");
    if (!process.env.AWS_S3_BUCKET) throw new Error("AWS_S3_BUCKET not defined");

    return new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }
}
