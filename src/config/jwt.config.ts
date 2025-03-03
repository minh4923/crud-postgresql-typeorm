import { registerAs } from '@nestjs/config';
console.log('jwt.config.ts is being loaded...');
export default registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET || (process.env.NODE_ENV === 'test' ? 'access_test_token' : 'access_token'),
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || (process.env.NODE_ENV === 'test' ? '10m' : '1h'),
  refreshSecret: process.env.JWT_REFRESH_SECRET || (process.env.NODE_ENV === 'test' ? 'refresh_test_token' : 'refresh_token'),
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || (process.env.NODE_ENV === 'test' ? '1d' : '7d'),
}));
