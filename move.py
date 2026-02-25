import os
import re
import shutil
from pathlib import Path

# ================= 配置区 =================
MD_DIR = Path("./src/posts")          # Markdown 源码目录
PUBLIC_DIR = Path("./public/posts")    # Next.js 静态资源目录
# ==========================================

def process_posts():
    if not MD_DIR.exists():
        print(f"❌ 错误: 找不到 Markdown 目录 {MD_DIR}")
        return

    # 正则表达式：匹配 ![alt](path)
    img_pattern = re.compile(r'!\[(.*?)\]\((.*?)\)')

    for md_file in MD_DIR.glob("*.md"):
        slug = md_file.stem
        target_asset_dir = PUBLIC_DIR / slug
        
        print(f"📖 正在处理文章: [{slug}]")
        
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # 用于存储该文件是否被修改过的标记
        file_changed = False

        def process_match(match):
            nonlocal file_changed
            alt_text = match.group(1)
            original_path = match.group(2)

            # 1. 过滤无需处理的路径（网络图片或已处理过的路径）
            if original_path.startswith(('http://', 'https://', '/')):
                return match.group(0)

            # 2. 确定源图片位置
            # 基于当前 .md 文件的位置寻找图片
            source_img_path = (md_file.parent / original_path).resolve()
            
            if not source_img_path.exists():
                print(f"   ⚠️ 找不到源图片: {original_path}，跳过同步。")
                return match.group(0)

            # 3. 执行同步：拷贝到 public 目录
            if not target_asset_dir.exists():
                target_asset_dir.mkdir(parents=True, exist_ok=True)
            
            file_name = source_img_path.name
            dest_img_path = target_asset_dir / file_name
            
            try:
                shutil.copy2(source_img_path, dest_img_path) # copy2 保留元数据
                print(f"   ✅ 已同步图片: {file_name}")
            except Exception as e:
                print(f"   ❌ 拷贝失败: {e}")
                return match.group(0)

            # 4. 生成新路径并标记修改
            new_root_path = f"/posts/{slug}/{file_name}"
            file_changed = True
            return f"![{alt_text}]({new_root_path})"

        # 执行正则替换
        new_content = img_pattern.sub(process_match, content)

        # 5. 如果有变化，写回文件
        if file_changed:
            with open(md_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"   📝 已更新 Markdown 路径引用。")
        else:
            print(f"   ℹ️ 无需修改路径。")

if __name__ == "__main__":
    print("🚀 [Blog 部署预处理] 开始运行...")
    process_posts()
    print("✨ 处理完成。所有本地图片已同步至 public 并更新引用路径。")