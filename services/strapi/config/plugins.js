// Upload rules from Strapi's starter, plus the AWS S3 provider pointed at the
// Railway Bucket. Railway Buckets are private: ACL "private" makes Strapi hand
// out short-lived signed URLs instead of public object URLs.
const allowedMediaTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedTypes = [
  'image/svg+xml',
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

module.exports = ({ env }) => {
  const useBucket = Boolean(env('S3_BUCKET') && env('S3_ENDPOINT') && env('S3_ACCESS_KEY_ID'));
  const s3 = {
    provider: 'aws-s3',
    providerOptions: {
      s3Options: {
        credentials: {
          accessKeyId: env('S3_ACCESS_KEY_ID'),
          secretAccessKey: env('S3_SECRET_ACCESS_KEY'),
        },
        region: env('S3_REGION', 'auto'),
        endpoint: env('S3_ENDPOINT'),
        forcePathStyle: env.bool('S3_FORCE_PATH_STYLE', false),
        params: {
          Bucket: env('S3_BUCKET'),
          ACL: 'private',
          // Lifetime of the signed media URLs in seconds.
          signedUrlExpires: env.int('S3_SIGNED_URL_EXPIRES', 15 * 60),
        },
      },
    },
    actionOptions: { upload: {}, uploadStream: {}, delete: {} },
  };

  return {
    'users-permissions': {
      config: {
        jwtSecret: env('JWT_SECRET'),
        jwtManagement: 'refresh',
        sessions: {
          httpOnly: true,
        },
      },
    },
    upload: {
      config: {
        ...(useBucket ? s3 : {}),
        security: {
          allowedTypes: allowedMediaTypes,
          deniedTypes,
        },
      },
    },
  };
};
