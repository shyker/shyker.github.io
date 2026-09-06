---
title: "day44-反射机制"
date: "2026-07-08"
tags: "Java, Dev, Reflection"
---

# Reflection

------

### 一、 核心语法解释

#### 1. `public static void main(String[] args)`

这和 C 语言的 `int main(int argc, char *argv[])` 几乎一模一样。

- **`public`**：权限修饰符，表示这个方法是公开的，JVM 才能从外部调用它。
- **`static`**：静态方法。意味着 JVM 不需要先 `new` 一个对象，就能直接运行这个方法。
- **`void`**：没有返回值。
- **`String[] args`**：接收命令行参数的字符串数组。

#### 2. `throws ClassNotFoundException`

这是 Java 的**异常处理机制**。

- **通俗解释**：这叫“甩锅声明”。
- **为什么一定要加？**：你代码里的 `Class.forName` 和 `loadClass` 都是通过“字符串”去匹配类的。万一你字符串写错了（比如写成 `com.user.Useeeer`），计算机就找不着这个类。
- **为什么不加就“不能用”？**：Java 是一门严谨的语言。它规定：对于这种“极有可能出错”的操作，你必须二选一：
  1. 用 `try-catch` 把报错抓起来处理。
  2. 在方法头上写 `throws`，告诉编译器：“我知道可能会找不到类，如果真找不到了，就让程序直接崩溃报错吧。”
- **如果不加**：编译器会认为你的代码有严重的安全隐患，**强制不通过编译**，所以你才无法运行 `System.out.println`。

------

### 二、 `Class<?>` 是什么意思？

这是 Java 的**泛型（Generics）**语法。

- **`Class`**：代表这是一个“类蓝图”对象。
- **`<?>`**：这是一个“通配符”，表示**“不确定的类型”**。
- **为什么要写它？**：`Class` 是一个容器。如果你写 `Class<User>`，说明这个容器只能装 User 类的蓝图；如果你写 `Class<?>`，说明这个容器可以装任何类的蓝图。
- **不写的后果**：如果不写 `<?>`，IDEA 会报黄色的警告（Raw Use），虽然能运行，但不符合现代 Java 的编程规范。

------

### 三、 四种获取 Class 方式的详细区别

| **方式**               | **代码写法**              | **触发时机**       | **对应 C 语言的概念（类比）** | **特点**                                                     |
| ---------------------- | ------------------------- | ------------------ | ----------------------------- | ------------------------------------------------------------ |
| **1. 类名.class**      | `User.class`              | 编译时确定         | **硬编码的类型指针**          | 最安全、性能最高，但必须在写代码时就知道类名。               |
| **2. forName**         | `Class.forName("...")`    | **运行时**动态加载 | **根据符号名找函数地址**      | **最常用**。它会触发类的静态代码块初始化（像 C 的全局变量初始化）。 |
| **3. 对象.getClass()** | `user.getClass()`         | 运行时已有实例     | **运行时类型识别 (RTTI)**     | 只有当你手里已经有一个 `new` 出来的对象时才能用。            |
| **4. 类加载器**        | `loader.loadClass("...")` | 运行时只加载       | **只把动态库读入内存**        | 只加载类，不进行初始化（不执行静态代码块），最底层。         |

------

### 四、 代码逐行注释 

```java
package com.user;
import com.user.User;

public class GetClass {
    // throws ClassNotFoundException：提前声明“如果通过字符串找不着类，我负责报错”
    public static void main(String[] args) throws ClassNotFoundException {
        
        // 方式1：通过类字面量获取。最直接。
        // 在编译阶段，编译器就确认了 User 这个类一定存在。
        Class UserClass = User.class;
        System.out.println(UserClass);

        // 方式2：通过全路径字符串获取。这是反射的精髓。
        // 计算机去寻找 com.user.User 这个路径下的类。
        // 如果找不到，就会触发上面声明的 ClassNotFoundException。
        Class<?> class1 = Class.forName("com.user.User");
        System.out.println(class1);

        // 方式3：通过现有的对象实例获取。
        // 你已经 new 出一个对象了，反向询问这个对象：“你的模版是谁？”
        User user = new User();
        Class<? extends User> aclass1 = user.getClass();
        System.out.println(aclass1);

        // 方式4：通过系统类加载器获取。
        // 获取负责搬运类的“搬运工” (ClassLoader)，让搬运工去仓库里找。
        ClassLoader systemclassloader = ClassLoader.getSystemClassLoader();
        Class<?> aclass2 = systemclassloader.loadClass("com.user.User");
        System.out.println(aclass2);
    }
}
```

## 获取成员变量

```java
package com.user;

import java.lang.reflect.Field;

public class GetField {
    public static void main(String[] args) throws ClassNotFoundException, NoSuchFieldException {
//        Class<User> userclass=User.class;
        Class<?> userclass=Class.forName("com.user.User");

        //仅获取公共变量
//        Field[] fields=userclass.getFields();
//        for (Field f:fields){
//            System.out.println(f);
//        }
//        //获取所有变量
//        Field[] fields1=userclass.getDeclaredFields();
//        for(Field f:fields1){
//            System.out.println(f);
//        }
        //获取单个变量
        Field namefield=userclass.getField("name");
        System.out.println(namefield);

        Field genderfield=userclass.getDeclaredField("gender");
        System.out.println(genderfield);

    }
}

```

## 获取constructor

与获取成员变量一样，有全部与单个，共有与私有

```java
package com.user;

import com.user.User;

import java.lang.reflect.Constructor;

public class GetConstructor {
    public static void main(String[] args) throws ClassNotFoundException,NoSuchMethodException{
        Class<?> userclass=Class.forName("com.user.User");

//        Constructor[] constructors=userclass.getConstructors();
//        for(Constructor c:constructors)
//        {
//            System.out.println(c);
//        }
//         Constructor<?>[] constructors=userclass.getDeclaredConstructors();
//         for (Constructor<?> c:constructors)
//         {
//             System.out.println(c);
//         }
         Constructor<?> constructor=userclass.getConstructor(String.class,Integer.class,String.class,Integer.class);
         System.out.println(constructor);

         Constructor<?> constructor1=userclass.getDeclaredConstructor(String.class,Integer.class,String.class);
         System.out.println(constructor1);

    }
}

```

## 获取Method

具体的通过method来操作实例Instance

```java
package com.user;
import com.user.User;
import java.lang.reflect.Method;

public class GetMethod {
    public static void main(String[] args) throws Exception {
        Class<?> userclass=Class.forName("com.user.User");
        Object userInstance=userclass.getDeclaredConstructor().newInstance();
//        Method[] methods=userclass.getMethods();
//        for(Method m:methods)
//        {
//            System.out.println(m);
//        }

        Method SetNameMethod=userclass.getMethod("setName", String.class);
        System.out.println(SetNameMethod);

        SetNameMethod.setAccessible(true);
        SetNameMethod.invoke(userInstance,"Shylerislearningjava");

        Method GetNameMethod=userclass.getMethod("getName");

        System.out.println(GetNameMethod.invoke(userInstance));
    }
}

```

### `setAccessible(true)`：万能钥匙（绕过权限检查）

在正常 Java 开发中，如果你把一个方法定义为 `private`，外部代码是绝对无法调用的。这在 C 语言中类似于你在一个 `.c` 文件里定义了 `static` 函数，其他文件无法直接链接它。

- **它的作用**：告诉 JVM，“**跳过安全检查**”。
- **底层逻辑**：当你获取到一个 `Method` 或 `Field` 时，Java 会记录它的修饰符（public/private）。默认情况下，反射调用也会触发权限检查。
- **为什么要用它**：
  - **框架需求**：像你之前研究的 MyBatis 或 Hibernate，它们需要强行把数据库数据填入你定义的 `private` 变量里。
  - **安全研究**：在 CTF 或漏洞利用中，为了调用隐藏的危险方法（如私有的执行命令接口），必须先用这把“钥匙”开锁。

> **注意**：`setAccessible(true)` 并不是改变了方法本身的权限（它依然是 private 的），它只是改变了**当前这个反射对象**在调用时的行为。

------

### 2. `invoke(Object obj, Object... args)`：执行开关（函数指针调用）

`invoke` 是反射中最强大的方法，它对应 C 语言中的**函数指针调用**。

- **它的作用**：**触发函数执行**。
- **参数拆解**：
  1. **`obj`**：这是你上一条报错的核心原因。它代表**“在哪个实例上运行”**。对于非静态方法，它相当于 C++ 或 Java 里的 `this` 指针。
  2. **`args`**：传给这个函数的实际参数。
- **为什么需要它**：
  - 在编译时，你可能根本不知道要运行哪个函数。比如你根据用户输入的字符串来决定调用哪个方法，这时就必须用 `invoke`。
  - ![image-20260708175318593](/diaries/images/image-20260708175318593.png)

## 一个calc方法的调用过程

执行Runtime.getRuntime.exec("calc")，这个过程可以弹出一个calc，在实际的情况中，要学会如何使用反射的方法调用成功

```java
package com.user;

import java.lang.reflect.Member;
import java.lang.reflect.Method;

public class TestCalc {
    public static void main(String[] args) throws Exception{
//        Runtime.getRuntime().exec("calc");
        Class<?> Rce=Class.forName("java.lang.Runtime");
        Method getRun=Rce.getMethod("getRuntime");
        Method exec=Rce.getMethod("exec",String.class);
        Object runInstance=getRun.invoke(Rce);
        exec.invoke(runInstance,"calc");
//        System.out.println(getRun);
        
        Class c=Class.forName("java.lang.Runtime");
        Constructor con=c.getDeclaredConstructor();
        con.setAccessible(true);
        c.getDeclaredMethod("exec",String.class).invoke(con.newInstance(),"calc");

    }
}
```

也就是说在java.lang.runtime这个类下，执行完getRuntime不再是一个类，而是一个实例，这个类里面没有exec的方法，而在java.lang.runtime下，getRuntime与exec都是同级的方法，再在这个实例上面执行java.lang.runtime的exec方法

由于你对 **RCE（远程代码执行）** 感兴趣，理解这种“链式调用”非常重要。在编写 Payload 时，逻辑顺序应该是：

1. **找蓝图**：`Class r = Class.forName("...")`
2. **找动作 A 的说明书**：`Method mA = r.getMethod("...")`
3. **找动作 B 的说明书**：`Method mB = r.getMethod("...")`
4. **执行动作 A 拿结果**：`Object resultA = mA.invoke(...)`
5. **在结果上执行动作 B**：`mB.invoke(resultA, ...)`

能不能跳过 `getRuntime`？

**正常情况下不能直接跳过。**

因为要调用：

```
exec.invoke(某个Runtime对象, "calc");
```

这里必须有一个 `Runtime` 对象。

但 `Runtime` 的构造器是 private：

```
private Runtime() {}
```

不能这样正常创建：

```
new Runtime(); // 编译不通过
```

反射创建：

```
Constructor con = clazz.getDeclaredConstructor();
con.setAccessible(true);
Object runtime = con.newInstance();
```

在 JDK 23 里又会被模块系统拦住。版本问题

所以，**`getRuntime()` 的作用就是拿到 JDK 已经创建好的那个 Runtime 单例对象**。

------

如果写成这样：

```
Method exec = clazz.getMethod("exec", String.class);
exec.invoke(null, "calc");
```

会报错，因为 `exec` 不是 static 方法，不能没有对象调用。

如果写成这样：

```
exec.invoke(clazz, "calc");
```

也不对。`clazz` 是 `Class` 对象，不是 `Runtime` 对象。

正确关系是：

```
Class<?> clazz = Runtime.class;   // 类的描述对象
Runtime runtime = Runtime.getRuntime(); // 真正的 Runtime 实例
```

`exec.invoke(...)` 需要的是第二个，不是第一个。

一句话总结：`getRuntime()` 不是为了“触发 exec”，而是为了**拿到能够调用 exec 的 Runtime 实例**；`exec` 本身不能凭空执行，除非它是 static，但它不是。

1. ![image-20260127170808862](/diaries/images/image-20260127170808862.png)

### 通过生成class，在Load

生成class文件

```java
package com.user;

public class CalcGen {
    // 增加这个无参构造器，专门给 newInstance() 用
    public CalcGen(String cmd) throws Exception {
        Runtime.getRuntime().exec(cmd);
    }
    public CalcGen() throws Exception{
        Runtime.getRuntime().exec("calc");
    }
}
```

在这里面写了两种构造方法，一种是固定好的，一种是通过cmd传参的，编译产出class文件，用于后面实例化

![image-20260127183129507](/diaries/images/image-20260127183129507.png)

通过url加载

```java
package com.user;

import java.io.File;
import java.lang.reflect.Constructor;
import java.net.URI;
import java.net.URL;
import java.net.URLClassLoader;

public class FileLoader {
    public static void main(String[] args) throws Exception{
        File file=new File("D:\\phpstudy_pro\\IDEA\\servlet\\Reflect-demo\\src\\main\\java\\");
//        URI uri=file.toURI();
//        路径格式转换。Java 的加载器不直接认 Windows 的路径字符串，需要把它转成 URL 对象（类似 file:/D:/...）。
        URL url=file.toURL();

//        创建类加载器实例。new URL[]{url} 是把刚才的地址包成一个“地图数组”给它，告诉它：“以后找类就去这些地方翻。”
        URLClassLoader classLoader=new URLClassLoader(new URL[]{url});
        Class<?> clazz=classLoader.loadClass("com.user.CalcGen");
//        Constructor<?> constructor = clazz.getDeclaredConstructor(String.class);
//        constructor.newInstance("calc");//这里对应那个cmd的构造方法
        clazz.newInstance();

    }
}

```

- **为什么用数组 `new URL[]{url}`？**：`URLClassLoader` 的构造函数设计得非常宏大。它支持从**多个地方**同时找类（比如一个在本地硬盘，一个在远程服务器，一个在 FTP）。所以它要求你传一个**数组**（即地图列表），哪怕你现在手里只有一张地图，也得装进盒子里（数组）给它。就是说这个url可以是http远程地址，也可以是本地，只要是xxxx.class都可以解析

从此可以引出CC链，CC链就是Maven依赖CC进行反射，反射出自定义的方法来达到调用方法，具体的过程操作不太清楚，后面学到了再说
