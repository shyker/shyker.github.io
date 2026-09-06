---
title: "day42-JavaEE-Servlet"
date: "2026-07-07"
tags: "Java, Servlet, Dev"
---

# JVAV 学习

## Basic 

### class&interface

class是具体的一个类，interface是一个具体的接口，他们都属于类型，都是object

class中有各种方法，变量名，

interface则是像一个说明书，仅仅记录抽象的有什么名字的方法，而不具体实现是什么方法，具体的实现在class（implement）中实现

class 可以继承（extends）父类，也可以实现（implement）interface的方法，他们都是类型，只不过接口不能直接创建对象：

```
new Payment(); // 错
```

但接口可以当变量类型：

```
Payment p = new WeChatPayment(); // 对
```

以下面的demo为例，这是一个factory工厂的方法思想

```
interface Payment {
    void pay();
}//Payment作为接口类型

class WeChatPayment implements Payment {
    public void pay() {
        System.out.println("微信支付");
    }
}//一个具体的类（class）来实现interface，这个class也是类型

class AliPayPayment implements Payment {
    public void pay() {
        System.out.println("支付宝支付");
    }
}

class PaymentFactory {
    public static Payment createPayment(String type) {  //Payment在这里作为返回类型，并不是返回的接口，而是实现这种接口的一个类（class）Payment 是声明的返回类型，意思是：这个方法返回的对象，必须能当作 Payment 使用。
        if ("wechat".equals(type)) {
            return new WeChatPayment();
            这个对象的真实类型是：WeChatPayment
            它同时满足两个身份：
			它是 Object，因为所有 class 的对象都是 Object。
			它也是 Payment，因为 WeChatPayment implements Payment。
        } else if ("alipay".equals(type)) {
            return new AliPayPayment();
        }
        throw new IllegalArgumentException("未知支付方式");
    }
}

//调用方法
Payment payment = PaymentFactory.createPayment("wechat");
payment.pay();
```

interface 不属于 Object。
class 的对象才属于 Object。

## Servlet

https://mp.weixin.qq.com/s/c_4fOTBKDcByv8MZ9ayaRg

https://blog.csdn.net/qq_52173163/article/details/121110753

 

IDEA下载，激活，配置，运行，都是踩坑泪

放这里一个激活全家桶

[最新 JetBrains 全家桶激活， Activation Code 激活码：实时更新中 | DDKK.COM 弟弟快看 - 编程教程](https://www.ddkk.com/jetbrains-activation-code/index.html)

两种路由配置

IndexServlet配置

![image-20260123214203496](/diaries/images/image-20260123214203496.png)

Web.xml配置，这个相比上面那个繁琐

![image-20260123214241909](/diaries/images/image-20260123214241909.png)

## Gemini说什么事Servlet

------

### 一、 什么是 Servlet？

简单来说，**Servlet（Server Applet）** 就是运行在 Web 服务器（如你刚配置好的 **TomEE**）上的 **Java 小程序**。

如果你把 Web 开发比作开餐厅：

- **浏览器（Browser）**：就是**顾客**，负责点菜（发送 HTTP 请求）。
- **Web 服务器（TomEE/Tomcat）**：就是**餐厅大堂**，负责接待顾客。
- **Servlet**：就是**厨师**。大堂接到订单后，交给对应的厨师（Servlet），厨师根据菜单（代码逻辑）炒好菜（生成 HTML 或数据），再让大堂端给顾客。

> **核心作用：** 接收用户请求 -> 处理业务逻辑 -> 生成响应结果。

------

### 二、 Servlet 的生命周期（生老病死）

Servlet 的生命周期由 **Servlet 容器**（即 TomEE）全权管理。它不像普通的 Java 类需要你手动 `new`，而是由容器在特定时刻自动调用对应的方法。

这个过程可以分为 **四个阶段**：

#### 1. 实例化与初始化：`init()` —— “出生”

当用户第一次访问某个 Servlet 的 URL（比如你的 `/index`）时，容器会创建这个 Servlet 的实例，并调用 `init()` 方法。

- **频率**：**只执行一次**。
- **用途**：通常用于加载配置文件、初始化数据库连接等准备工作。
- **代码体现**：你在代码里写的 `System.out.println("init start");` 只有在第一次访问时会打印。

#### 2. 服务阶段：`service()` —— “工作”

每当有请求进来，容器都会调用 `service()` 方法。它会根据 HTTP 请求的类型（GET、POST 等）来分发任务。

- **频率**：**每次请求都会执行**。
- **内部逻辑**：`service()` 会自动判断：
  - 如果是 GET 请求，就调用 `doGet()`。
  - 如果是 POST 请求，就调用 `doPost()`。
- **代码体现**：这就是为什么你刷新一次页面，后台就会打印一次 `Get start`。

#### 3. 销毁阶段：`destroy()` —— “退休”

当 Web 应用停止、重新部署，或者服务器关闭时，容器会调用 `destroy()` 方法。

- **频率**：**只执行一次**。
- **用途**：用于“善后”，比如关闭数据库连接、保存内存数据到磁盘。
- **代码体现**：当你停止 IDEA 里的 TomEE 服务器时，控制台会输出 `destory start`。
- ![image-20260123215246936](/diaries/images/image-20260123215246936.png)

#### 4. 垃圾回收

`destroy()` 执行完后，Servlet 实例就变成了普通的 Java 对象，等待 JVM 的垃圾回收机制（GC）将其清理。

------

### 三、 总结：一张表看清

| **阶段**     | **方法名**              | **执行次数** | **触发时机**                   |
| ------------ | ----------------------- | ------------ | ------------------------------ |
| **初始化**   | `init()`                | 1次          | 第一次请求时（或服务器启动时） |
| **提供服务** | `service()` / `doGet()` | **N次**      | 每次接收到匹配的请求时         |
| **销毁**     | `destroy()`             | 1次          | 服务器关闭或应用卸载时         |

------

### 💡 为什么理解这个很重要？

- **单例模式**：默认情况下，Servlet 是**单例**的。也就是说，不管 100 个还是 1000 个用户访问 `/index`，服务器内存里都只有一个 `IndexServlet` 实例。
- **线程安全**：既然大家都共用一个厨师，如果你在类里定义了一个成员变量（比如 `int count = 0;`），多个用户同时访问时可能会产生冲突。所以，**尽量不要在 Servlet 类里定义可变的成员变量**。

## Filter

### doFilter函数

新的过滤器，在请求到达Servlet之前，就进行检查，不会进入Servlet的检查而直接被Filter拦下，也是在这里进行后期的内存马的植入（利用反射的方法）

示例

```java
if (name != null && !name.toLowerCase().contains("script")) {
    filterChain.doFilter(servletRequest, servletResponse);
} else if (name == null) {
    // 没有参数时也放行，或者根据业务逻辑处理
    filterChain.doFilter(servletRequest, servletResponse);
} else {
    // 发现 script，拦截
    servletResponse.setContentType("text/html;charset=UTF-8");
    servletResponse.getWriter().println("检测到非法脚本！");
}
```

不放行完全不会进入servlet，还是很好理解的

## Listener

和Filter一样的配置，只不过不进行拦截，就是字面意的监听，在Filter之前

```java
@WebListener("/admin")
public class SessionListen implements HttpSessionListener {
    @Override
    public void sessionCreated(HttpSessionEvent se) {
//        HttpSessionListener.super.sessionCreated(se);	
        System.out.println("Listen session create");
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
//        HttpSessionListener.super.sessionDestroyed(se);
        System.out.println("Listen session destroy");
    }
}
```

![image-20260707172956564](/diaries/images/image-20260707172956564.png)