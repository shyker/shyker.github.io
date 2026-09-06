---
title: "day43-JavaEE-数据库"
date: "2026-07-07"
tags: "Java, Dev, Database, SQL"
---

## ORM框架&&JDBC&&Hibernate&&Mybatis

### (Object-Relational Mapping)**，即**对象关系映射。

### JDBC

jdbc实现sql数据库查询，预编译手法防止sql注入，很常规，配置数据库，设置sql查询语句，查询

预编译的模版

```java
@WebServlet(value="/admin")
public class JdbcServlet extends HttpServlet {
    // 数据库连接配置：注意数据库名是 whoami
    private String url = "jdbc:mysql://localhost:3306/whoami?serverTimezone=UTC&useSSL=false";
    private String user = "root";
    private String password = "123456";

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        System.out.println("get id");

        // 获取前端传入的 id 参数
        String idParam = req.getParameter("id");

        try {
            // 1. 加载驱动
            Class.forName("com.mysql.cj.jdbc.Driver");

            // 2. 获取连接并执行查询 (使用 try-with-resources 自动关闭资源)
            try (Connection conn = DriverManager.getConnection(url, user, password)) {
                // 3. 编写 SQL：根据 Id 查询
                String sql = "SELECT * FROM users WHERE Id = ?";
                try (PreparedStatement ps = conn.prepareStatement(sql)) {
                    ps.setString(1, idParam); // 安全填充参数，防止 SQL 注入

                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next()) {
                            // 4. 获取数据库字段内容
                            String username = rs.getString("username");
                            String pass = rs.getString("password");
                            out.println("查询成功！用户名：" + username + "，密码：" + pass);
                        } else {
                            out.println("未找到该 ID 的用户");
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            out.println("数据库连接失败：" + e.getMessage());
        }
    }
}
```

#### CVE-2024-7254 待完善

### Mybatis

我说这个Mybatis真的看的我眼花缭乱，Java文件放一堆，凑来凑去的，各个地方放一点，什么接口，配置文件，自定义......

不像这个jdbc一看就看得懂，以我粗浅的理解init先根据mybatis-config.xml流式创建，对这个private factory构建，这个factory就相当于一个connection，每次查询时产生一个session，这个session里面可以自定义方法，通过getMapper调用我们自定义的接口，这个自定义的接口匹配我要执行的sql语句selectUserById(id);--> select * from users where id = #{ID}

而且这个文件的结构相比jdbc错综复杂，但是换来的是相对高效

```
src/main/java
  └── com.example
      ├── pojo         <-- 存放“容器”：User.java (存数据的地方)
      ├── mapper       <-- 存放“菜单”：UserMapper.java (接口)
      └── servlet      <-- 存放“指挥官”：MybatisServlet.java (执行逻辑)
src/main/resources
  ├── mybatis-config.xml <-- 存放“总蓝图”：数据库账号密码、设置
  └── com/example/mapper
      └── UserMapper.xml  <-- 存放“菜谱”：真正的 SQL 语句
```

以下分别是各个文件的关键代码

pojo.java（相当于结构体）

```java
	package com.example.mybatis_demo.pojo;

public class User {
    private String username;
    private String password;
    private  Integer id;

    public String getUsername()
    {
        return this.username;
    }
    public void setUsername(String username)
    {
        this.username=username;
    }

}

```

mapper.java（自定义方法，相当于结构体的方法）

```java
package com.example.mybatis_demo.mapper;

import com.example.mybatis_demo.pojo.User;

public interface UserMapper {
    User selectUserById(int id);
}

```

mybatis-config.xml（sql配置项）

在 `init()` 阶段，当你加载 `mybatis-config.xml` 时，MyBatis 就已经偷偷完成了全量的扫描工作 ：

- 

  **配置告知路径**：在 `mybatis-config.xml` 中，通常会有一段 `<mappers>` 配置，明确指出了 XML 文件的位置或 Mapper 接口所在的包 。

- **Namespace 协议**：这是最关键的一点。在 `UserMapper.xml` 的根节点上，必须定义 `namespace="com.example.mapper.UserMapper"`。

  - MyBatis 要求这个 **`namespace` 必须等于接口的全限定类名** 。
  - 通过这个协议，MyBatis 在启动时就把 XML 里的所有 SQL 语句和对应的 Java 接口“焊死”在了一起。

- 

  **语句 ID 匹配**：XML 中 `<select id="selectUserById" ...>` 的这个 `id`，必须与接口中的**方法名**完全一致 。

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">

<configuration>
    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
                <property name="url" value="jdbc:mysql://localhost:3306/whoami?serverTimezone=UTC"/>
                <property name="username" value="root"/>
                <property name="password" value="123456"/>
            </dataSource>
        </environment>
    </environments>

    <mappers>
        <mapper resource="com/example/mybatis_demo/mapper/UserMapper.xml"/>
    </mappers>
</configuration>
```

mapper.xml（具体定义sql查询语句的地方）

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.example.mybatis_demo.mapper.UserMapper">

    <select id="selectUserById" resultType="com.example.mybatis_demo.pojo.User">
        SELECT * FROM users WHERE Id = #{id}
    </select>

</mapper>
```

MybatisServle.java

```java
@WebServlet(name = "sql", value = "/sql")
public class MybatisServlet extends HttpServlet {
   private SqlSessionFactory factory;// SqlSessionFactory 是 MyBatis 的核心工厂，用来生产“对话对象”

    @Override
    public void init() throws ServletException {
        try {
            // 1. Resources 是工具类。Resources.getResourceAsStream("...")：
            // 意思是：去 resources 文件夹下，把那个 xml 文件变成“数据流”读取进来。
            // InputStream is：就是用来承接这个“数据流”的载体。
            InputStream is= Resources.getResourceAsStream("mybatis-config.xml");
            this.factory=new SqlSessionFactoryBuilder().build(is);
        }
        catch (IOException e)
        {
            e.printStackTrace();
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("text/html");
        int id=Integer.parseInt(req.getParameter("id"));
        // 3. try(SqlSession session = ...)：
        // 这是一个自动结束的语法。执行完后不管成功失败，它都会自动走人，不占资源。
        try(SqlSession session=factory.openSession()){
            //获取类
            UserMapper mapper= session.getMapper(UserMapper.class);
            User user=mapper.selectUserById(id);//调用自定义方法
            if(user!=null)
            {
                resp.getWriter().println("Found id "+user.getUsername());
            }
        }

    }
}

```

这是在后面javasec学习中遇到的具体的常见的漏洞场景

$与#的预编译场景，重点场景于Order by，Like，In这些场景

```xml
    <select id="orderByVul" resultType="top.whgojp.modules.sqli.entity.Sqli">
        SELECT * FROM sqli
        <if test="field != null and field != ''">
            ORDER BY ${field}
        </if>
    </select>

<!--    Order by下的#{}写法 排序不生效-->
    <select id="orderByPrepareStatement" resultType="top.whgojp.modules.sqli.entity.Sqli">
        SELECT * FROM sqli
        <if test="field != null and field != ''">
            ORDER BY #{field}
        </if>
    </select>
<!--    Order by下的安全写法 白名单-->
    <select id="orderByWriteList" resultType="top.whgojp.modules.sqli.entity.Sqli">
        SELECT * FROM sqli
        <if test="field != null and field != ''">
            <choose>
                <!-- 排序列名白名单 -->
                <when test="field == 'id' or field == 'username' or field == 'password'">
                    ORDER BY ${field}
                </when>
                <otherwise>
                    <!-- 默认使用id进行排序 -->
                    ORDER BY id
                </otherwise>
            </choose>
        </if>
    </select>
<!--  模糊查询-->
    <select id="likeVul" resultType="top.whgojp.modules.sqli.entity.Sqli">
        SELECT * FROM sqli WHERE username LIKE '%${keyword}%'
--             典型的字符串拼接 。
--
-- 攻击示例： 如果 keyword 传入 admin%' OR '1'='1，最终 SQL 会变成：
--         SELECT * FROM sqli WHERE username LIKE '%admin%' OR '1'='1%'
--             这会导致查询出所有用户数据，实现绕过认证或脱库 。
    </select>
    <select id="likePrepareStatement" resultType="top.whgojp.modules.sqli.entity.Sqli">
        SELECT * FROM sqli WHERE username LIKE CONCAT('%', #{keyword}, '%')
    </select>

    <select id="inVul" resultType="top.whgojp.modules.sqli.entity.Sqli">
        select * from sqli where id in (${id})
    </select>

    <select id="inPrepareStatement" resultType="top.whgojp.modules.sqli.entity.Sqli">
        select * from sqli where id in (#{id})
    </select>
    <select id="inSafeForeach" resultType="top.whgojp.modules.sqli.entity.Sqli">
        SELECT * FROM sqli WHERE id IN
        <foreach collection="scope" item="id" open="(" separator="," close=")">
            #{id}
        </foreach>
    </select>
```



#### jdbc与mybatis差异

| **维度**     | **JDBC (Java Database Connectivity)**                        | **MyBatis (持久层框架)**                                     |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **本质**     | Java 官方提供的数据库连接**底层接口**                        | 对 JDBC 进行封装的**半自动 ORM 框架**                        |
| **SQL 编写** | SQL 硬编码在 Java 字符串中，难以阅读和维护                   | SQL 与 Java 代码分离，集中在 XML 映射文件中                  |
| **对象映射** | 需要手动从 `ResultSet` 逐个字段提取并赋值给“结构体”（User 对象） | 通过 `resultType` 自动完成数据库行到 Java 对象的映射         |
| **资源管理** | 必须手动关闭 `Connection`, `Statement`, `ResultSet`，否则内存泄漏 | 通过 `SqlSession` 的生命周期管理（如 `try-with-resources`）自动处理 |
| **安全性**   | 需程序员自觉使用 `PreparedStatement` 预防注入                | 强制使用 `#{}` 占位符，底层默认预编译，安全性极高            |

### Hibernate

理解了Mybatis，会发现Hibernate其实和Mybatis很相似，只不过Hibernate更加自动化，不需要具体的SQL语句而是自动生成，其参数也是进行了Parameter Binding，从而杜绝了SQL注入，但似乎这个反射查看自动生成的SQL语句的过程还有待学习，这里先给出AI的代码，参考一下，结构和Mybatis更加简洁，智能

User.java（反射的模版，没有任何SQL语句）

```java
package com.example.hibernate_demo.pojo;

import jakarta.persistence.*; // 使用 Jakarta Persistence 标准注解

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity // 告诉 Hibernate，这是一个需要持久化的实体类
@Table(name = "users") // 映射到数据库中名为 users 的表
//@IdClass(UserId.class) // 告诉 Hibernate，我的主键是由 UserId 这个类定义的,加上这个可以有多个@Id
//对应的java逻辑也会改变
public class User {

    @Id // 声明这是主键，这种模式只能有一个主键
    @Column(name = "Id") // 映射到表中的 Id 列
    private Integer id;

    @Column(name = "username")
    private String username;

    @Column(name = "password")
    private String password;

    // 必须提供 Getter 和 Setter 方法，供 Hibernate 反射调用
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    // ... id 和 password 的 get/set 同理
}
```

hibernate.cfg.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE hibernate-configuration PUBLIC
        "-//Hibernate/Hibernate Configuration DTD 3.0//EN"
        "http://www.hibernate.org/dtd/hibernate-configuration-3.0.dtd">
<hibernate-configuration>
    <session-factory>
        <property name="connection.driver_class">com.mysql.cj.jdbc.Driver</property>
        <property name="connection.url">jdbc:mysql://localhost:3306/whoami?serverTimezone=UTC</property>
        <property name="connection.username">root</property>
        <property name="connection.password">123456</property>

        <property name="dialect">org.hibernate.dialect.MySQLDialect</property>

        <property name="show_sql">true</property>
        <property name="format_sql">true</property>

        <mapping class="com.example.hibernate_demo.pojo.User"/>
    </session-factory>
</hibernate-configuration>
```

HibernateServlet.java

```java
@WebServlet("/hibernate-admin")
public class HibernateServlet extends HttpServlet {
    private SessionFactory sessionFactory;

    @Override
    public void init() throws ServletException {
        // 1. 加载配置并构建会话工厂
        // 这一步类似于 MyBatis 的构建过程，是重量级的，整个应用只运行一次
        try {
            sessionFactory = new Configuration().configure().buildSessionFactory();
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServletException("Hibernate 初始化失败", e);
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/html;charset=UTF-8");
        int id = Integer.parseInt(req.getParameter("id"));

        // 2. 开启一个 Session（会话）
        // 在 Hibernate 中，Session 是对数据库连接的轻量级封装
        try (Session session = sessionFactory.openSession()) {

            // 3. 核心：通过 ID 直接获取对象
            // 注意：这里没有写任何 SELECT 语句！
            // Hibernate 会通过反射查看 User 类的 @Table 和 @Id 注解，自动生成 SQL
            User user = session.get(User.class, id);
            
			//UserId pid = new UserId(1, "admin"); 这里对应上面的@IdClass(UserId.class) // 告诉 Hibernate，我的主键是由 UserId 这个类定义的
			//User user = session.get(User.class, pid);
            if (user != null) {
                resp.getWriter().println("Hibernate 查询成功：" + user.getUsername());
            } else {
                resp.getWriter().println("未找到该用户");
            }
        }
    }
}

上面这个代码是针对仅仅只有@Id = id作为where id=后面的主键，如果我们想要 where id= and username=怎么办
    使用HQL语法
@WebServlet("/hibernate_hql")
public class HibernateServlet extends HttpServlet {
    private static final SessionFactory factory = new Configuration().configure().buildSessionFactory();

    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String inputId = req.getParameter("id");
        String inputUser = req.getParameter("username");

        try (Session session = factory.openSession()) {
            // --- HQL 核心开始 ---
            
            // 1. 编写 HQL：操作的是 User 类名和属性名，而非数据库表名
            // 使用 :id 和 :name 作为占位符，防止 SQL 注入 
            String hql = "from User where id = :id and username = :name";

            // 2. 创建查询对象
            Query<User> query = session.createQuery(hql, User.class);

            // 3. 参数绑定：这是实现预编译、防止注入的关键步骤 
            query.setParameter("id", Integer.parseInt(inputId));
            query.setParameter("name", inputUser);

            // 4. 获取结果
            User result = query.uniqueResult(); 
            
            // --- HQL 核心结束 ---

            if (result != null) {
                resp.getWriter().println("Found: " + result.getUsername());
            } else {
                resp.getWriter().println("No user matches criteria.");
            }
        }
    }
}
```



```
Mybatis_demo (项目根目录)
├── 📄 pom.xml                    # 依赖管理（类似 C 的 Makefile，定义了要引用的 .h 和 .lib）
├── 📂 src
│   ├── 📂 main
│   │   ├── 📂 java               # 存放所有的 Java 源码 (.java)
│   │   │   └── 📂 com
│   │   │       └── 📂 example
│   │   │           └── 📂 hibernate_demo
│   │   │               ├── 📂 pojo
│   │   │               │   └── 📄 User.java             # 实体类（映射数据库表的“结构体”）
│   │   │               └── 📂 servlet
│   │   │                   └── 📄 HibernateServlet.java # 核心业务逻辑（相当于 C 的 main 函数入口）
│   │   ├── 📂 resources          # 存放配置文件（程序运行需要的静态资源）
│   │   │   └── 📄 hibernate.cfg.xml                     # Hibernate 总配置（数据库账号密码、驱动等）
│   │   └── 📂 webapp             # Web 资源目录
│   │       └── 📂 WEB-INF
│   │           └── 📄 web.xml                           # Web 应用配置（虽然现在常用注解，但它是标准结构）
│   └── 📂 test                   # 存放测试代码
└── 📂 target                     # 自动生成，存放编译后的二进制文件 (.class) 和生成的 .war 包
```



![image-20260126214754116](/diaries/images/image-20260126214754116.png)



**写在最后**

简单的入门JavaEE，很粗浅，配置数据库，学个框架，后面看