import os
import re
from pathlib import Path

# 配置路径
MD_DIR = Path("./src/posts")

def rewrite_image_paths():
    if not MD_DIR.exists():
        print(f"❌ 找不到 Markdown 目录: {MD_DIR}")
        return

    # 匹配 Markdown 图片语法: ![alt](path)
    # group(1) 是 alt 文字, group(2) 是路径
    img_pattern = re.compile(r'!\[(.*?)\]\((.*?)\)')

    for md_file in MD_DIR.glob("*.md"):
        slug = md_file.stem
        
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()

        def path_replacer(match):
            alt_text = match.group(1)
            original_path = match.group(2)

            # 跳过网络图片和已经是根相对路径的图片
            if original_path.startswith(('http://', 'https://', '/')):
                return match.group(0)

            # 获取图片文件名
            file_name = os.path.basename(original_path)
            # 构建新的根相对路径：/posts/{文章名}/{图片名}
            new_path = f"/posts/{slug}/{file_name}"
            
            print(f"   🔄 [{slug}] 修改: {file_name} -> {new_path}")
            return f"![{alt_text}]({new_path})"

        # 执行替换
        new_content = img_pattern.sub(path_replacer, content)

        # 写回文件
        with open(md_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✅ 文件已更新: {md_file.name}")

if __name__ == "__main__":
    print("🚀 开始重写 Markdown 图片路径...")
    rewrite_image_paths()
    print("✨ 所有路径重写完成！")