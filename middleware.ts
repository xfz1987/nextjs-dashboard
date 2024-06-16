import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

// 配置什么时候执行中间件检查
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'], // 排除这些地址
};
