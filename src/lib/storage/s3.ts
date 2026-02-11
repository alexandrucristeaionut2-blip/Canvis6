import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} missing`);
  return v;
}

export function isS3Configured(): boolean {
  return Boolean(
    process.env.S3_BUCKET &&
      process.env.S3_REGION &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY
  );
}

function getS3Client(): S3Client {
  const region = mustGetEnv("S3_REGION");

  // Optional (e.g. Cloudflare R2): https://<accountid>.r2.cloudflarestorage.com
  const endpoint = process.env.S3_ENDPOINT;

  return new S3Client({
    region,
    endpoint,
    forcePathStyle: Boolean(endpoint),
    credentials: {
      accessKeyId: mustGetEnv("S3_ACCESS_KEY_ID"),
      secretAccessKey: mustGetEnv("S3_SECRET_ACCESS_KEY"),
    },
  });
}

export function getBucketName(): string {
  return mustGetEnv("S3_BUCKET");
}

export async function createPresignedUploadUrl(opts: {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}): Promise<string> {
  const client = getS3Client();
  const bucket = getBucketName();

  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: opts.key,
    ContentType: opts.contentType,
    // Private by default; bucket policy should enforce no public ACLs.
  });

  return getSignedUrl(client, cmd, { expiresIn: opts.expiresInSeconds ?? 600 });
}

export async function createPresignedDownloadUrl(opts: {
  key: string;
  expiresInSeconds?: number;
  downloadName?: string;
}): Promise<string> {
  const client = getS3Client();
  const bucket = getBucketName();

  const cmd = new GetObjectCommand({
    Bucket: bucket,
    Key: opts.key,
    ResponseContentDisposition: opts.downloadName
      ? `attachment; filename*=UTF-8''${encodeURIComponent(opts.downloadName)}`
      : undefined,
  });

  return getSignedUrl(client, cmd, { expiresIn: opts.expiresInSeconds ?? 600 });
}

export async function headObject(opts: { key: string }) {
  const client = getS3Client();
  const bucket = getBucketName();
  const cmd = new HeadObjectCommand({ Bucket: bucket, Key: opts.key });
  return client.send(cmd);
}

export async function deleteObject(opts: { key: string }) {
  const client = getS3Client();
  const bucket = getBucketName();
  const cmd = new DeleteObjectCommand({ Bucket: bucket, Key: opts.key });
  return client.send(cmd);
}
