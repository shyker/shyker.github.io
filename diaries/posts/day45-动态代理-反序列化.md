---
title: "day45-动态代理-反序列化"
date: "2026-07-09"
tags: "Java, Dev, Unserialize, DynamicProxy"
---

## 动态代理



这个动态代理我感觉就像是把不同接口的函数打包起来，在proxy进行统一的调用

- 在interface统一所拥有的方法，不关心具体的实现方法，而是只说有哪些方法

- 在具体的implements的class中实现这个接口中的方法

- 在InovactionHandler(Invoker)里面处理一些代理的业务，核心的method进行引用，具体的解释在代码中给出

- 在Proxy中进行代码的整体运行，Proxy综合进行调用不同接口的method

User.java(Interface)

```java
public interface User  {
    void SayMyName(String name);
}
//这里面仅仅定义了一个SayMyName的method
```

Admin.java(Interface)

```java
public interface Admin {
    void deleteUser(int id);
}
// 假设有一个删除用户的功能
```

UserImpt.java(继承于User接口与Admin接口)

```java
public class UserImpt implements User, Admin {
    @Override
    public void SayMyName(String name) {
        System.out.println("Hi " + name + ", Im shyler");
    }

    @Override
    public void deleteUser(int id) {
        System.out.println("用户 " + id + " 已被强制删除！");
    }
}

```

UserImptHandler.java(InvocationHandler)

代理的部分函数会再这里处理，在proxy.\<function\>中会自动触发其中的invoke，而最关键的是这个method.invoke,这个method会自动识别为上面的这个\<function\>，然后带入其对应的Object，与arg执行接口的方法，最后返回一个Object

```java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

public class UserImptInhandler implements InvocationHandler
{
    private Object target;
    //构造Invoker中的具体Class
    public UserImptInhandler(Object target)
    {
        this.target=target;
    }

    @Override
    //核心Invoke
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        //代理在具体Class的Method之前的一些逻辑
        System.out.println("Hello Im "+args[0]);
        //识别是哪些Class的Method
        if (method.getName().equals("deleteUser"))
        {
            System.out.println("【警告】正在尝试执行危险的删除操作！");
        }
        Object invoke=method.invoke(target,args);
        //代理在具体Class之后的一些逻辑
        System.out.println("Okay It's nice to see u");
        return invoke;
    }
}

```

Proxy.java

最主要的就是Proxy.newProxyInstance()三个参数的理解，留一点学习时的困惑，就不删了

```java
import java.lang.reflect.Proxy;

public class UserProxy {
    public static void main(String[] args) {
        //具体定义的类
        User user=new UserImpt();

        //应该InvocationHandler 我觉得Invoker这个名字更合适
        //造个user的Invoker
        UserImptInhandler userImptInhandler = new UserImptInhandler(user);

        User proxy=(User) Proxy.newProxyInstance(
                //它负责在内存里开辟空间，把新造出来的类搬进 JVM。
                User.class.getClassLoader(),
                //请给我造一个实现了 User 接口的对象,一个类加载器可以加载成千上万个类，但它不知道你要造什么样的代理。这个数组就是身份模具。有了它，生成的代理对象才能合法地强转为 (User)，并拥有 SayMyName 这个方法。
                new Class<?>[]{User.class,Admin.class},
                //具体执行的Invoker，这个Invoker始终是User类的
                userImptInhandler
        );
//        当你执行 proxy.SayMyName("YxxJ") 时，JVM 内部会自动找到 User 接口中 SayMyName 的反射对象（Method），然后像丢给 invoke 方法的第二个参数。
        proxy.SayMyName("YxxJ");
    }

}


//以下是我对Proxy的理解，对核心的Impthandler还没有一点开始，帮我严格纠正其中的理解错误
//这个proxy为什么要进行User类的强转换，参数一是一个类加载器，也就是核心的老板吗，接下来是一些接口，这个接口就相当于要代理处理的业务
//而不是老板处理的事务，以上就是一套处理的蓝图。最后这个userImpthandler就是具体的处理人，最后由proxy.SayMyName触发，但是
//这个SayMyName原本就是相当于一个代理业务仅仅输出 Hi Yxxj Im shyler，而不会有后面流程
//由于这个proxy，才进行
// Hello Yxxj You are my Darling 这里就是老板的核心逻辑了
// 但是Object invoke=method.invoke(target,args);这一句我完全不理解
// 以及这个user = new UserImpt()，相当于是这个类的实例化，但为什么还要new UserImptInhandler(user)

//也就是说，这个User.class.getClassLoader只是一个申明类加载，而Class<?>的作用是什么，我申明了类加载，要这个{User.class}还有什么用
//Object invoke=method.invoke(target,args);中的method,是在proxy.SayMyName处自动识别的，而这个target是字proxy中实例化的
//那么为什么User.java要写成interface,public interface User  {void SayMyName(String name);} 这个interface是什么必要吗
```

总的来说这个Proxy就是把不同接口的方法统一在一起可以运行，一些纷杂的代理事务可以细化在InvocationHandler中而不用修改具体的Method



## 序列化

序列化与反序列化，之前略会，用于数据在不同环境的传输，转二进制，转json，转......

## Java 反序列化

常见的涉及序列化操作的函数有 `writeObject|readObject`,`XMLDecoder|XMLEncoder`,`Xstream`,`SnakeYaml`,`Fastjson`,`Jackson`等

原理还是比较清楚的吗，就是看触发的时候有没有危险函数，通过可控变量进去然后构造链去触发

简单看看代码就行了，仅做一个代码的认识，至于链的构造与触发后面再学深入

User.java

```java
import java.io.ObjectInputStream;
import java.io.Serializable;
//序列化的标志，必须是Serialize的接口
public class User implements Serializable {
    public String name;
    public Integer age;
    private String gender;
    protected String address;

    public User(String name,Integer age,String gender,String address)
    {
        this.name=name; this.age=age;
        this.address=address; this.gender=gender;
    }

    @Override
    //被当做String被echo时触发
    public String toString() {
        System.out.println("name is " + this.name);
        return name;
    }
    //默认触发方式，在反序列化时触发
    private  void readObject(ObjectInputStream ois) throws Exception{
        
        ois.defaultReadObject();
        System.out.println("default trigger");
    }
}

```

Serialize.java(OutputStream)

输出序列化的流，进行一个序列化

```java
import java.io.FileOutputStream;
import java.io.ObjectOutputStream;

public class SerializeTest {

    public static void main(String[] args) throws Exception{
        User user= new User("shyler",19,"man","where");
        Serialize(user);
    }
    public static void Serialize(Object target) throws Exception{
        ObjectOutputStream oos=new ObjectOutputStream( new FileOutputStream("test.txt"));
        oos.writeObject(target);
    }
}

```

Unserialize.java(InputStream)

将流反序列为数据

```java
import java.io.*;

public class UnserializeTest {

    public static void main(String[] args) throws Exception{
//        Unserialize(user);
        Object o= Unserialize("test.txt");
        System.out.println(o);
    }
    public static Object Unserialize(String Filename) throws Exception{
        ObjectInputStream ois=new ObjectInputStream( new FileInputStream(Filename));
        Object o=ois.readObject();
        return o;
    }
}

```

## 动态代理与反序列化的结合

动态代理的理念就是不同类中的相同操作交给代理区处理逻辑，在代理部分处理完后，再进行自己的方法

而反序列化就是通过序列化的操作，比如魔术方法readObject，打印toString这种触发反序列化里面操作的函数，在这里面，如果参数可控，源代码中含有危险函数，那么我们就可以尝试触发

下面就是一个结合的例子，在反序列化中触发动态代理的方法

项目结构

```
deserialize-proxy-lab/
├── src/
│   ├── lab/
│   │   ├── Action.java
│   │   ├── UserConfig.java
│   │   ├── ReflectHandler.java
│   │   ├── CommandExecutor.java
│   │   ├── SerializeDemo.java
│   │   └── DeserializeDemo.java
```

**Action.java**

```
package org.example.dynamicserializetarget;

import java.io.Serializable;

public interface Action extends Serializable
{
    public void run();
}
```

**UserConfig.java**

```
package org.example.dynamicserializetarget;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.Serializable;

public class UserConfig implements Serializable {
    private Action action;
    public String name;
    public int age;
    public UserConfig(Action act){
        this.action=act;
    }
    private void readObject(ObjectInputStream in)
    {
        try {
            in.defaultReadObject();//先按照 Java 默认规则，把对象里的普通字段恢复回来。反序列化defaultReadObject() 会把序列化数据里的 action 字段读出来，并赋值给当前 UserConfig 对象。如果你不调用它，action 可能还是默认值：null
            System.out.println("readObject");
            action.run();具体的这个action的方法实现
        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
        System.out.println("Serialize");
    }
}

```

**ActionImpt.java**

正常逻辑

```
package org.example.dynamicserializetarget;

public class ActionImpt implements Action{
    public void run(){
        System.out.println("do somthing");
    }
}
```

**eval.java**

危险函数，可以是任意类

```
package org.example.dynamicserializetarget;

import java.io.IOException;
public class eval {
    public void exec(String cmd) throws IOException {
        Runtime.getRuntime().exec(cmd);
    }
}
```

**ReflectionHandler.java**

自定义代理中的逻辑

```
package org.example.dynamicserializetarget;

import java.io.Serializable;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

public class ReflectionHandler implements InvocationHandler, Serializable {

    private String target;
    private String methodname;
    private String cmd;
    public ReflectionHandler(String obj, String method, String args)
    {
        this.target=obj;
        this.methodname=method;
        this.cmd=args;
    }
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        Class<?> clazz= Class.forName(target);
        Object obj=clazz.getConstructor().newInstance();
        Method targetMethod=clazz.getMethod(methodname,String.class);
        targetMethod.invoke(obj,cmd);
        System.out.println("Override invoke----");
        return obj;
    }
}

```

**ProxyUtils.java**

生成代理，传参，这里传参就是让这个代理里面的逻辑去执行eval里面的内容

```
package org.example.dynamicserializetarget;

import java.lang.reflect.Proxy;

public class ProxyUtils {
    public static Action createProxy()
    {

         ReflectionHandler reflectionHandler=new ReflectionHandler(
                "org.example.dynamicserializetarget.eval",
                "exec",
                "calc"
        );
        Action proxyutil=(Action) Proxy.newProxyInstance(
                Action.class.getClassLoader(),
                new Class[]{Action.class},
                reflectionHandler
        );
        return  proxyutil;
    }

}
```

**SerializeTest.java**

序列化到保存文件User.ser

```
package org.example.dynamicserializetarget;

import java.io.*;

public class SerializeTest {
    public static void main(String[] args) throws IOException {
        ActionImpt someone=new ActionImpt();
//        Action proxyA=ProxyUtils.createProxy();
//        UserConfig userA=new UserConfig(proxyA);//代理触发eval
        UserConfig userA=new UserConfig(someone);//正常逻辑

//    Action proxyA=ProxyUtils.createProxy(userA);

        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("User.ser"));
        oos.writeObject(userA);
        System.out.println("serialize userA to User.ser");
    }
//

}

```

**Unserialize.java**

反序列化出发readObject中的run，调出，在run执行之前进行代理操作，在代理操作中触发calc

```
package org.example.dynamicserializetarget;

import java.io.*;

public class Unserialize {
    public static void main(String[] args) throws Exception {
        ObjectInputStream ois= new ObjectInputStream(new FileInputStream("User.ser"));
        Object out=ois.readObject();
        ois.close();
        System.out.println(out);
    }
}

```

![image-20260709174748764](/diaries/images/image-20260709174748764.png)
