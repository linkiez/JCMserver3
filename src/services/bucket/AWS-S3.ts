import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import { IBucket } from "./IBucket";

export default class AwsBucket implements IBucket {
  client: S3Client;

  constructor() {
    this.client = this.newClient();
  }
  async uploadFile(fileName: string, filePath: string, mimeType: string) {
    const stream = fs.createReadStream(filePath);
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: stream,
      ContentType: mimeType,
    });
    await this.client.send(command);

    return process.env.AWS_S3_BUCKET + "/" + fileName;
  }

  async list(filter: string) {
      const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: decodeURIComponent(filter),
    });

    const response = await this.client.send(command);

    if (response?.Contents) {
      return response.Contents.map((item: any) => item.Key);
    }

    return [];
  }

  async delete(fileName: string) {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
    });

    await this.client.send(command);
  }

  async getSignedUrl(fileName: string) {
    
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
    });

    const signedUrlExpireSeconds = 3600;

    return getSignedUrl(this.client, command, { expiresIn: signedUrlExpireSeconds });
  }

  newClient() {
    if (!process.env.AWS_REGION) throw new Error("AWS_REGION not defined");
    if (!process.env.AWS_ACCESS_KEY_ID)
      throw new Error("AWS_ACCESS_KEY_ID not defined");
    if (!process.env.AWS_SECRET_ACCESS_KEY)
      throw new Error("AWS_SECRET_ACCESS_KEY not defined");
    if (!process.env.AWS_S3_BUCKET)
      throw new Error("AWS_S3_BUCKET not defined");

    return new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }
}

