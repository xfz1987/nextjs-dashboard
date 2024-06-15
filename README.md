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

## 修改 tsconfig，防止后面出错

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
