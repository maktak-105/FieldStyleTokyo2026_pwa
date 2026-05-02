from PIL import Image, ImageDraw
import os

def mark_equipment():
    root = r'c:\Users\makta\source\FieldStyle\fieldstyle-nav'
    public_dir = os.path.join(root, 'public')
    output_dir = os.path.join(root, 'artifacts')
    
    # 座標データ
    data = {
        'map1.jpg': [
            {'name': 'オブジェ', 'x': 835, 'y': 770},
            {'name': 'エレベーター', 'x': 520, 'y': 840},
            {'name': 'エスカレーター', 'x': 975, 'y': 820}
        ],
        'map2.jpg': [
            {'name': 'エスカレーター', 'x': 1250, 'y': 1500},
            {'name': 'エレベーター', 'x': 770, 'y': 1970}
        ]
    }
    
    for filename, markers in data.items():
        img_path = os.path.join(public_dir, filename)
        if not os.path.exists(img_path): continue
        
        img = Image.open(img_path).convert('RGB')
        draw = ImageDraw.Draw(img)
        
        for m in markers:
            x, y = m['x'], m['y']
            r = 15
            # 赤い大きな丸
            draw.ellipse([x-r, y-r, x+r, y+r], fill='red', outline='white', width=3)
            # ラベル
            draw.text((x, y-40), m['name'], fill='red', stroke_fill='white', stroke_width=2)
            
        out_path = os.path.join(output_dir, f'marked_equipment_{filename}')
        img.save(out_path)
        print(f"Saved {out_path}")

if __name__ == "__main__":
    mark_equipment()
