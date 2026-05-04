import 'dotenv/config';

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sa3ati',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    bucket: process.env.SUPABASE_BUCKET,
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@sa3ati.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
  },
};

export default config;
