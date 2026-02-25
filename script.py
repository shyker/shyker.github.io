import os
import re
import shutil
from pathlib import Path

# 配置路径
MD_DIR = Path("./src/posts")          # Markdown 源文件目录
PUBLIC_DIR = Path("./public/posts")    # 目标图片公共目录

def sync_post_images():
    if not MD_DIR.exists():
        print(f"❌ 找不到 Markdown 目录: {MD_DIR}")
        return

    # 正则表达式匹配 Markdown 图片语法 ![alt](path)
    img_pattern = re.compile(r'!\[.*?\]\((.*?)\)')

    for md_file in MD_DIR.glob("*.md"):
        slug = md_file.stem
        target_folder = PUBLIC_DIR / slug
        
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        images = img_pattern.findall(content)
        
        if not images:
            continue

        # 如果有图片，创建对应的资源文件夹
        if not target_folder.exists():
            target_folder.mkdir(parents=True, exist_ok=True)
            print(f"📁 为文章 [{slug}] 创建了资源文件夹")

        for img_path in images:
            # 过滤掉网络图片
            if img_path.startswith(('http://', 'https://')):
                continue

            # 处理相对路径
            source_img = (md_file.parent / img_path).resolve()
            
            if source_img.exists():
                dest_img = target_folder / source_img.name
                # 执行拷贝
                shutil.copy2(source_img, dest_img)
                print(f"   ✅ 已同步图片: {source_img.name} -> {target_folder}")
            else:
                print(f"   ⚠️ 找不到源图片文件: {img_path} (在 {md_file.name} 中引用)")

if __name__ == "__main__":
    print("🚀 开始同步 Markdown 资源图片...")
    sync_post_images()
    print("✨ 同步完成！")