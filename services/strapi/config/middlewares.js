// Default Strapi middlewares, with the Content Security Policy extended so the
// admin panel can show media stored in the Railway Bucket (signed URLs on the
// bucket's own host).
const bucketHosts = (env) => {
  const hosts = [];
  try {
    const endpoint = new URL(env('S3_ENDPOINT', ''));
    const bucket = env('S3_BUCKET', '');
    hosts.push(endpoint.host);
    if (bucket) hosts.push(`${bucket}.${endpoint.host}`);
  } catch {
    // No endpoint: uploads stay local, nothing to allow.
  }
  return hosts;
};

module.exports = ({ env }) => {
  const media = ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', ...bucketHosts(env)];
  return [
    'strapi::logger',
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'connect-src': ["'self'", 'https:'],
            'img-src': media,
            'media-src': media,
            upgradeInsecureRequests: null,
          },
        },
      },
    },
    'strapi::cors',
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};
