import os
import re
import shutil
import uuid
from pathlib import Path

# ============================================================
# 配置路径（按需修改）
# ============================================================

SCRIPT_DIR = Path(__file__).resolve().parent          # diaries/
PROJECT_DIR = SCRIPT_DIR.parent                        # 项目根目录
POSTS_DIR  = SCRIPT_DIR / "posts"                     # 放 .md 草稿
IMAGES_DIR = SCRIPT_DIR / "images"                    # 图片源目录：diaries/images/
SERVE_DIR  = PROJECT_DIR / "public" / "diaries" / "images"  # 服务镜像：public/diaries/images/

# 图片在 markdown 中替换的 URL 前缀
IMAGE_URL_PREFIX = "/diaries/images"

# ============================================================
# 内部工具
# ============================================================

# 匹配 Markdown 图片语法：![alt](path)
IMG_PATTERN = re.compile(r'!\[([^\]]*)\]\(([^)]+)\)')

# 常见图片扩展名
IMG_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp", ".ico"}


def _is_url(path: str) -> bool:
    return path.startswith(("http://", "https://", "//"))


def _is_already_served(path: str) -> bool:
    """路径已指向图片服务（新老前缀均跳过），无需处理。"""
    return path.startswith(IMAGE_URL_PREFIX) or path.startswith("/api/diaries/images")


def _find_source(path_str: str, md_dir: Path) -> Path | None:
    """尝试从多种可能的来源定位图片文件。"""
    # 1. 绝对路径（Windows C:\... 或 Unix /...）
    candidate = Path(path_str)
    if candidate.is_absolute() and candidate.exists():
        return candidate

    # 2. 相对于 .md 所在目录
    candidate = (md_dir / path_str).resolve()
    if candidate.exists():
        return candidate

    # 3. 只取文件名，在当前目录下搜索
    name = Path(path_str).na
    for root, _, files in os.walk(md_dir):
        if name in files:
            return Path(root) / name

    # 4. 在常见截图目录搜索（Windows）
    if os.name == "nt":
        common_dirs = [
            Path.home() / "Pictures",
            Path.home() / "Desktop",
            Path.home() / "Downloads",
            Path.home() / "OneDrive" / "Pictures",
        ]
        for d in common_dirs:
            candidate = d / name
            if candidate.exists():
                return candidate

    return None


def _unique_filename(original: str) -> str:
    """在目标目录生成唯一文件名，避免覆盖。"""
    name, ext = os.path.splitext(original)
    ext = ext.lower() if ext else ".png"

    # 如果原文件名未被占用，直接使用
    candidate = IMAGES_DIR / f"{name}{ext}"
    if not candidate.exists():
        return f"{name}{ext}"

    # 否则加短 UUID
    short_id = uuid.uuid4().hex[:8]
    return f"{name}_{short_id}{ext}"


# ============================================================
# 主流程
# ============================================================

def sync_diary_images():
    if not POSTS_DIR.exists():
        print(f"[ERROR] Posts dir not found: {POSTS_DIR}")
        print(f"        Create {POSTS_DIR} and put your .md files there.")
        return

    md_files = list(POSTS_DIR.glob("*.md"))
    if not md_files:
        print(f"[SKIP] No .md files in {POSTS_DIR}")
        return

    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    SERVE_DIR.mkdir(parents=True, exist_ok=True)
    total_copied = 0
    total_updated = 0

    for md_file in md_files:
        raw = md_file.read_text(encoding="utf-8")
        matches = IMG_PATTERN.findall(raw)

        if not matches:
            continue

        modified = False

        for alt, img_path in matches:
            # 跳过网络图片和已处理过的
            if _is_url(img_path) or _is_already_served(img_path):
                continue

            source = _find_source(img_path, md_file.parent)
            if source is None:
                print(f"   [WARN] [{md_file.name}] Image not found: {img_path}")
                continue

            dest_name = _unique_filename(source.name)
            dest = IMAGES_DIR / dest_name

            shutil.copy2(source, dest)
            shutil.copy2(source, SERVE_DIR / dest_name)  # 同步到 public/diaries/images/
            print(f"   [OK] [{md_file.name}] {source.name} -> images/{dest_name}")
            total_copied += 1

            # 替换 markdown 中的路径（一行一行改，避免替换掉不该替换的）
            new_url = f"{IMAGE_URL_PREFIX}/{dest_name}"
            old_md = f"![{alt}]({img_path})"
            new_md = f"![{alt}]({new_url})"
            raw = raw.replace(old_md, new_md)
            modified = True

        # 迁移旧前缀 /api/diaries/images → 新前缀
        if "/api/diaries/images" in raw:
            raw = raw.replace("/api/diaries/images", IMAGE_URL_PREFIX)
            modified = True
            print(f"   [MIG] [{md_file.name}] old prefix -> new prefix")

        if modified:
            md_file.write_text(raw, encoding="utf-8")
            print(f"   [UPD] [{md_file.name}] image paths updated")
            total_updated += 1

    print()
    print(f"Done: {total_copied} images copied, {total_updated} articles updated")


if __name__ == "__main__":
    print("=== Diaries Image Sync ===")
    print(f"   Posts dir : {POSTS_DIR}")
    print(f"   Images dir: {IMAGES_DIR}")
    print()
    sync_diary_images()
