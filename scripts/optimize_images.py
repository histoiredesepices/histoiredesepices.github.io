#!/usr/bin/env python3
"""
Image Optimization Script for L'Histoire des Épices
Reduces image file sizes while maintaining quality.
"""

import os
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow not installed. Installing...")
    os.system("pip install Pillow")
    from PIL import Image


# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
ASSETS_DIR = PROJECT_ROOT / "assets"

# Max dimensions for different image types
MAX_SIZES = {
    "hero": (1920, 1080),      # Hero images - full width
    "menu": (600, 600),         # Menu item images - smaller
    "events": (800, 1000),      # Event cards - portrait
    "specialties": (800, 600),  # Specialty cards
    "default": (1200, 1200),    # Default max size
}

# JPEG quality (1-100, higher = better quality, larger file)
JPEG_QUALITY = 80


def get_category(filepath: Path) -> str:
    """Determine image category from path."""
    path_str = str(filepath).lower()
    for category in MAX_SIZES.keys():
        if category in path_str:
            return category
    return "default"


def optimize_image(filepath: Path, dry_run: bool = False) -> dict:
    """Optimize a single image file."""
    result = {
        "file": str(filepath.relative_to(PROJECT_ROOT)),
        "original_size": filepath.stat().st_size,
        "new_size": None,
        "savings": None,
        "resized": False,
        "skipped": False,
    }
    
    # Skip non-image files
    if filepath.suffix.lower() not in [".jpg", ".jpeg", ".png", ".webp"]:
        result["skipped"] = True
        return result
    
    try:
        with Image.open(filepath) as img:
            original_format = img.format
            original_size = img.size
            
            # Get max dimensions for this category
            category = get_category(filepath)
            max_width, max_height = MAX_SIZES[category]
            
            # Check if resize needed
            needs_resize = img.width > max_width or img.height > max_height
            
            if needs_resize:
                # Calculate new size maintaining aspect ratio
                ratio = min(max_width / img.width, max_height / img.height)
                new_size = (int(img.width * ratio), int(img.height * ratio))
                img = img.resize(new_size, Image.Resampling.LANCZOS)
                result["resized"] = True
                print(f"  Resized: {original_size} → {new_size}")
            
            # Convert RGBA to RGB for JPEG (remove alpha channel)
            if img.mode in ("RGBA", "P") and filepath.suffix.lower() in [".jpg", ".jpeg"]:
                img = img.convert("RGB")
            
            if not dry_run:
                # Save optimized image
                if filepath.suffix.lower() in [".jpg", ".jpeg"]:
                    img.save(filepath, "JPEG", quality=JPEG_QUALITY, optimize=True)
                elif filepath.suffix.lower() == ".png":
                    img.save(filepath, "PNG", optimize=True)
                elif filepath.suffix.lower() == ".webp":
                    img.save(filepath, "WEBP", quality=JPEG_QUALITY, optimize=True)
                
                result["new_size"] = filepath.stat().st_size
                result["savings"] = result["original_size"] - result["new_size"]
            
    except Exception as e:
        print(f"  Error: {e}")
        result["error"] = str(e)
    
    return result


def format_size(size_bytes: int) -> str:
    """Format bytes to human readable string."""
    for unit in ["B", "KB", "MB"]:
        if size_bytes < 1024:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.1f} GB"


def main():
    print("=" * 60)
    print("Image Optimization Script")
    print("=" * 60)
    print(f"\nScanning: {ASSETS_DIR}")
    print(f"JPEG Quality: {JPEG_QUALITY}")
    print(f"Max sizes: {MAX_SIZES}\n")
    
    # Find all images
    image_extensions = [".jpg", ".jpeg", ".png", ".webp"]
    images = []
    for ext in image_extensions:
        images.extend(ASSETS_DIR.rglob(f"*{ext}"))
        images.extend(ASSETS_DIR.rglob(f"*{ext.upper()}"))
    
    # Remove duplicates
    images = list(set(images))
    
    if not images:
        print("No images found!")
        return
    
    print(f"Found {len(images)} images\n")
    print("-" * 60)
    
    total_original = 0
    total_new = 0
    optimized_count = 0
    
    for img_path in sorted(images):
        print(f"\nProcessing: {img_path.relative_to(PROJECT_ROOT)}")
        result = optimize_image(img_path)
        
        if result.get("skipped"):
            print("  Skipped (not an image)")
            continue
        
        if result.get("error"):
            continue
        
        total_original += result["original_size"]
        
        if result["new_size"]:
            total_new += result["new_size"]
            optimized_count += 1
            
            savings_pct = (result["savings"] / result["original_size"]) * 100 if result["original_size"] > 0 else 0
            print(f"  {format_size(result['original_size'])} → {format_size(result['new_size'])} "
                  f"(saved {format_size(result['savings'])}, {savings_pct:.1f}%)")
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Images optimized: {optimized_count}")
    print(f"Original total:   {format_size(total_original)}")
    print(f"New total:        {format_size(total_new)}")
    
    total_savings = total_original - total_new
    savings_pct = (total_savings / total_original) * 100 if total_original > 0 else 0
    print(f"Total saved:      {format_size(total_savings)} ({savings_pct:.1f}%)")
    print("=" * 60)


if __name__ == "__main__":
    main()
