from PIL import Image, ImageDraw
import os

def crop_equipment():
    root = r'c:\Users\makta\source\FieldStyle\fieldstyle-nav'
    public_dir = os.path.join(root, 'public')
    output_dir = os.path.join(root, 'artifacts')
    
    # 座標データとクロップ名
    data = [
        {'file': 'map1.jpg', 'name': 'MAP1_オブジェ', 'x': 835, 'y': 770},
        {'file': 'map1.jpg', 'name': 'MAP1_エレベーター', 'x': 520, 'y': 840},
        {'file': 'map1.jpg', 'name': 'MAP1_エスカレーター', 'x': 975, 'y': 820},
        {'file': 'map2.jpg', 'name': 'MAP2_エスカレーター', 'x': 1250, 'y': 1500},
        {'file': 'map2.jpg', 'name': 'MAP2_エレベーター', 'x': 770, 'y': 1970}
    ]
    
    size = 250 # 半径250 = 500x500の正方形
    
    for m in data:
        img_path = os.path.join(public_dir, m['file'])
        if not os.path.exists(img_path): continue
        
        img = Image.open(img_path).convert('RGB')
        draw = ImageDraw.Draw(img)
        
        # マーキング
        x, y = m['x'], m['y']
        r = 10
        draw.ellipse([x-r, y-r, x+r, y+r], fill='red', outline='white', width=2)
        
        # クロップ
        left = max(0, x - size)
        top = max(0, y - size)
        right = min(img.width, x + size)
        bottom = min(img.height, y + size)
        
        cropped = img.crop((left, top, right, bottom))
        out_path = os.path.join(output_dir, f"crop_{m['name']}.jpg")
        cropped.save(out_path)
        print(f"Saved {out_path}")

if __name__ == "__main__":
    crop_equipment()
