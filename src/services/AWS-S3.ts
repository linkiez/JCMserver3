import AWS from "aws-sdk";
import fs from "fs";

export class S3Client {
  static async uploadFile(
    fileName: string,
    filePath: string,
    mimeType: string
  ) {
    const s3 = new AWS.S3({
      apiVersion: "2006-03-01",
      region: process.env.AWS_REGION,
    });
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    const fileContent = fs.readFileSync(filePath);

    const params = {
      Bucket: process.env.AWS_S3_BUCKET ?? "",
      Key: fileName,
      Body: fileContent,
      ContentType: mimeType, //geralmente se acha sozinho
    };

    const data = await s3.upload(params).promise();
    return data.Location;
  }

  static async listObjects(filter: string) {
    const s3 = new AWS.S3({
      apiVersion: "2006-03-01",
      region: process.env.AWS_REGION,
    });
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    const params = {
      Bucket: process.env.AWS_S3_BUCKET ?? "",
      Prefix: decodeURIComponent(filter),
    };

    const result = await s3.listObjectsV2(params).promise();
    if (result) {
      return result.Contents?.map((item) => item.Key);
    }
  }

  static async deleteFromS3(attachmentId: string) {
    const s3 = new AWS.S3({
      apiVersion: "2006-03-01",
      region: process.env.AWS_REGION,
    });
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    return s3
      .deleteObject({
        Bucket: process.env.AWS_S3_BUCKET ?? "",
        Key: attachmentId,
      })
      .promise();
  }

  static async getSignedUrl(fileName: string) {
    const s3 = new AWS.S3({
        apiVersion: "2006-03-01",
        region: process.env.AWS_REGION,
      });
      AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      });

      let signedUrlExpireSeconds = 3600;

    return s3.getSignedUrl('getObject', {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Expires: signedUrlExpireSeconds
    })
  }
}
