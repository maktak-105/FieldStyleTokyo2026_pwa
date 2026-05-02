from PIL import Image, ImageDraw, ImageFont
import os

def mark_equipment_v2():
    root = r'c:\Users\makta\source\FieldStyle\fieldstyle-nav'
    public_dir = os.path.join(root, 'public')
    output_dir = os.path.join(root, 'artifacts')
    
    # 座標データ
    data = {
        'map1.jpg': [
            {'name': 'OBJ (オブジェ)', 'x': 835, 'y': 770, 'color': 'red'},
            {'name': 'EV (西1エレベーター)', 'x': 520, 'y': 840, 'color': 'blue'},
            {'name': 'ES (西2エスカレーター)', 'x': 975, 'y': 820, 'color': 'green'}
        ],
        'map2.jpg': [
            {'name': 'ES (西4エスカレーター)', 'x': 1250, 'y': 1500, 'color': 'green'},
            {'name': 'EV (西3エレベーター)', 'x': 770, 'y': 1970, 'color': 'blue'}
        ]
    }
    
    for filename, markers in data.items():
        img_path = os.path.join(public_dir, filename)
        if not os.path.exists(img_path): continue
        
        img = Image.open(img_path).convert('RGB')
        draw = ImageDraw.Draw(img)
        
        for m in markers:
            x, y = m['x'], m['y']
            color = m['color']
            
            # ピンの描画
            r = 20
            draw.ellipse([x-r, y-r, x+r, y+r], fill=color, outline='white', width=4)
            
            # ラベル背景（塗りつぶし）
            label = m['name']
            text_size = 30 # フォントサイズ
            # テキストの領域を簡易的に計算（デフォルトフォント用）
            box_w = len(label) * 20
            box_h = 40
            
            draw.rectangle([x, y-60, x+box_w, y-60+box_h], fill='white', outline=color, width=2)
            draw.text((x+5, y-55), label, fill='black')
            
        out_path = os.path.join(output_dir, f'marked_equipment_v2_{filename}')
        img.save(out_path)
        print(f"Saved {out_path}")

if __name__ == "__main__":
    mark_equipment_v2()
