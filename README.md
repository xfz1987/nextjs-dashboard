# NextJs14 Study

## 为什么要优化字体

CLS：谷歌用于评估网站性能和用户体验的指标之一，用于衡量网页在加载过程中内容布局的稳定性

浏览器显示页面 -> 备用字体或系统字体 -> 渲染显示 -> 自定义字体下载 -> 进行替换 -> 布局偏移

进行替换时，会产生字体大小、空隙、布局的改变，即CLS

使用 next/font 模块后，NextJs会自动优化字体，项目构建时，会自动下载字体文件和其他资源文件放在一起

### 如何优化

```javascript
import { Inter, Lusitana } from 'next/font/google';

// 按需下载字体的子集，节省啊
export const inter = Inter({ subsets: ['latin'] }); // 拉丁字符集

export const lusitana = Lusitana({
  subsets: ['latin'],
  weight: ['400', '700'],
});
```

## 为什么要优化图片

1. 把大图传给小屏幕，造成贷款浪费
2. 图片从无到有的加载过程，容易造成布局偏移，CLS过大
3. 多个图片同时请求，造成 blocking

### 如何优化

Next.js 提供了优化图片的方案——Image 组件，使用 Image 组件有四点好处：

- 优化图片大小：webp格式
- - 对各个设备使用合适的尺寸与格式（使用Chrome访问页面时，图片会转换成webp格式）
- 防止CLS（累计布局偏移）
- 懒加载：图片在视图中才会被加载
- 自定义图片尺寸，width、height，因为设定了w和h，那么图片就有了固定的宽高比，防止CLS
- - Next.js 会根据 Image 的 width 与 height 值，在页面请求服务端时，转换并缓存相应大小的图片

```javascript
import Image from 'next/image';

export default function About(props) {
  return (
    <>
      {/* <img
            src={'/img.jpeg'}
            alt="图片"
        /> */}
      <Image src={'/img.jpeg'} alt="图片" width={100} height={100} />
      <Image
        src="/hero-desktop.png"
        width={1000}
        height={760}
        className="hidden md:block"
        alt="Screenshots of the dashboard project showing desktop version"
      />
      <Image
        src="/hero-mobile.png"
        width={560}
        height={620}
        className="block md:hidden" // 当移动端时，才会下载图片并显示，so wonderful
        alt="Screenshots of the dashboard project showing desktop version"
      />
    </>
  );
}
```

## Link 组件 代替 a

1. 不会整页刷新
2. 代码自动分割：根据路由自动code-spliting
3. 代码预取 pre-fetch，在生产环境，当 Link 组件在浏览器视口可见时（所见即所得），nextjs会自动prefetch Link.href的页面

### link active

```javascript
'use client'; // 注意使用 usePathname 钩子函数，需要在客户端运行
import Link from 'next/link';

function Nav() {
  const pathname = usePathname();
  pathname === '/xxxx' ? 'active-classname' : ''; // assert link.herf matches the pathname or not.
}
```

## 修改 tsconfig，防止后面部署时出错

```json
{
  "compilerOptions": {
    // ...
    "baseUrl": ".", //
    "paths": {
      "@/*": ["./*"],
      "@/app/*": ["app/*"]
    }
  }
}
```

## 在 Vercel 上创建数据库

1. github 上传代码
2. 注册 Vercel 账号（https://Vercel.com）
3. 选择导入的项目 nextjs-dashboard --> deploy
4. deploy 成功后，选择【Storage】菜单 --> Postgres ---> 使用默认的数据库名称和机房 ---> Connect
5. Quickstart -> .env.local -> Show secret -> Copy Snippet
6. 将复制的内容 paste 到本地项目的 .env 文件中
7. 在 .gitignore 增加忽略 .env 声明

```
# local env files
.env*.local
.env
```

8. npm i @vercel/postgres
9. start coding ...

## 数据请求

```javascript
// const revenue = await fetchRevenue();
// const latestInvoices = await fetchLatestInvoices();
// const {
//   totalPaidInvoices,
//   totalPendingInvoices,
//   numberOfInvoices,
//   numberOfCustomers,
// } = await fetchCardData();

// 上面的几个请求之间没有关联，而这中写法造成了请求瀑布（network waterfalls），需要并行请求，因此改成这样
const [cardData, revenue, latestInvoices] = await Promise.all([
  fetchCardData(),
  fetchRevenue(),
  fetchLatestInvoices(),
]);
```

## Static SSG 和 Dynamic SSR

NextJs 默认的就是尽量静态渲染 SSG

- 静态渲染：在服务端构建部署时，数据重新生效，产生的静态页面可以被分发、缓存到全世界各地
- - 收益：访问更快、减轻服务器压力、利于SEO
- - 场景：没有变化的数据、多页面共享的数据
- 动态渲染：在服务端接收到每个用户请求时，
- - 收益：显示实时数据、特定用户的特定数据（用于区别对待）、可以获取到客户端请求的cookie和URL参数

```javascript 如果直接操作数据库
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchRevenue() {
  noStore();

  try {
    // 操作数据库
  } catch (error) {}
}
```

```javascript 如果使用fetch
export async function fetchRevenue() {
  try {
    fetch('http://xxxx', { cache: 'no-store' });
  } catch (error) {}
}
```

注意：强制刷新时，静态也会重新渲染

## Streaming（异步渲染）

将一个“大块”数据分成“多个小块”来处理，说白了，就是nextjs可以将一个页面分成静态渲染部分和动态渲染部分，免于由于等待所有组件全加载完才渲染，造成 blocking

Page Rendering --> Streaming

- 流媒体
- 文件操作
- stream 数据

![]('./readImg/stream1.png')

### 页面级 loading.tsx

创建 /app/dashboard/loading.tsx

当访问 /app/dashboard 下的任何页面时，浏览器会先自动加载并渲染 loading，当页面准备好后，才会隐藏loading，再渲染页面，这一切都是 automaticlly

- 如果只想让 loading 对 /app/dashboard/page.tsx 这个页面有效果，需要进行 (xxx) 隔离
- 在 /app/dashboard 下创建名称为 "(任意名称)" 文件夹，然后把page.tsx 和 loading.tsx 迁移到这个文件夹下，这样，这个 loading 只对该page.tsx有效，假设这个文件夹叫 overview. 我们访问页面路径仍旧与之前一样：

✅ localhost:3000/dashboard
❌ localhost:3000/overview/dashboard

### 组件级 Suspense

suspense 并不会把组件本身，它只是区分静态和动态的边界，因此本身需要组件本身就是动态的了，no-store

Before： /app/dashboard/page.tsx 请求所有数据，然后下分给 A,B,C 三个组件
Now：需要将B进行 String render

```tsx
1. 将顶层关于 B 组件的数据请求，放到B组件中进行独立请求
2. 在 page.tsx 通过 React 的 Suspense 进行分割加载
<Suspense fallback={<B自己的loading />}>
    <B />
</Suspense>

```

## Server Action

### Create

Form Page -> Create Server Action -> Get Formdata -> Verify and Complete the data -> Insert DataBase -> Rrevalidate（If the page is SSG） -> Rirect Page

Server Component -> form.action={actionFn} -> actionFn(formData: FormData)

```javascript
// Server Component
export default function Page() {
  // async function create(formData: FormData) {
  //   'use server'; // ~~~~~~~~~~~
  //   // Logic to mutate data...
  // }

  return <form action={createAction}>...</form>;
}

// actions
'use server'
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(), // coerce 强制转换
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

// 忽略 id 和 date
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  // const rawFormData = {
  // customerId: formData.get('customerId'),
  // amount: formData.get('amount'),
  // status: formData.get('status'),
  // };

  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;

  // 告诉服务器 /dashboard/invoices 这个需要更新了
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
```

### Update

```tsx
// 将 id 作为 updateInvoice 函数的第一个参数，并返回一个新函数
const updateInvoiceWithId = updateInvoice.bind(null, invoice.id);

<form action={updateInvoiceWithId}>....</form>;

// actions
export async function updateInvoice(id: string, formData: FormData) {}
```

### Delete

```tsx
// Delete Button Action
export function DeleteInvoice({ id }: { id: string }) {
  const deleteInvoiceWithId = deleteInvoice.bind(null, id);

  return (
    <form action={deleteInvoiceWithId}>
      <button className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}

// actions
export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}
```

## 错误处理

https://nextjs.org/learn/dashboard-app/error-handling

## 表单action - 服务端验证

https://nextjs.org/learn/dashboard-app/improving-accessibility

## Authentication 身份验证 and Authorization 授权验证

1. Create Login Page
2. npm i next-auth@beta
3. openssl rand -base64 32

- #generate a secret key for your application

4. copy and past secret key to .env file. AUTH_SECRE
5. Configure On vercel with secret key

- Select your project -> setting --> Environment Variables
- Key: AUTH_SECRET，Value: your secret key
- Save

6. Create an auth.config.ts file at the root of our project

```typescript
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
```

6. In the root of your project, create a file called middleware.ts

```typescript
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

// 配置什么时候执行中间件检查
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'], // 排除这些地址
};
```

7. Loign and Logout

- In the root of your project, Create auth.ts，Export signIn and signOut
- In actions.ts, create authenticate order to call signIn
- On login form, use authenticate，loign button stays pending once clicked util receving result

## SEO

```typescript
export const metadata: Metadata = {
  title: {
    template: '%s | NextJs Study',
    default: 'NextJs Study',
  },
  // title: 'NextJs Study',
  description: 'A Dashboard Project Practice',
  keywords: ['nextjs14', 'react', 'typescript'],
  // 当页面被分享到社交平台时，会显示该图片
  openGraph: {
    images: '/opengraph-image.png',
  },
  // 这个地址作为某些配置项的前缀
  metadataBase: new URL('https://www.example.com'),
};
```
