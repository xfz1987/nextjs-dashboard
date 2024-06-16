import { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login', // 配置这个：当验证失败，会自动跳转到 /login
  },
  callbacks: {
    // auth 保存用户的 session
    // request 发起的请求
    authorized({ auth, request: { nextUrl } }) {
      // 在页面路由切换时，调用该方法，这里判断是否登录
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        // if (isLoggedIn) return true;
        // return false; // Redirect unauthenticated users to login page
        return isLoggedIn;
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} as NextAuthConfig;
