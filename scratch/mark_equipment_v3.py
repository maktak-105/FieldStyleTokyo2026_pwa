from PIL import Image, ImageDraw
import json
import os

def mark_equipment_v3():
    root = r'c:\Users\makta\source\FieldStyle\fieldstyle-nav'
    public_dir = os.path.join(root, 'public')
    output_dir = os.path.join(root, 'artifacts')
    booths_path = os.path.join(root, 'src', 'booths.json')
    
    # booths.jsonから最新の座標を読み込む
    with open(booths_path, 'r', encoding='utf-8') as f:
        booths = json.load(f)
    
    # 設備データの抽出
    target_names = ['アトリウム・オブジェ', 'エレベーター (西1側)', 'エスカレーター (西2側)', 'エスカレーター (西4側)', 'エレベーター (西3側)']
    equipment = [b for b in booths if b.get('__EMPTY') in target_names]
    
    # マップごとの画像処理
    for map_name in ['map1.jpg', 'map2.jpg']:
        img_path = os.path.join(public_dir, map_name)
        if not os.path.exists(img_path): continue
        
        img = Image.open(img_path).convert('RGB')
        draw = ImageDraw.Draw(img)
        
        # このマップに属する設備をプロット
        map_id = map_name.split('.')[0]
        for m in [e for e in equipment if e.get('mapId') == map_id]:
            x, y = m['x'], m['y']
            name = m['__EMPTY']
            
            # 色分け
            color = 'red' if 'オブジェ' in name else 'blue' if 'エレベーター' in name else 'green'
            
            # ピン
            r = 20
            draw.ellipse([x-r, y-r, x+r, y+r], fill=color, outline='white', width=4)
            
            # ラベル
            label = name.split(' ')[0] # 短い名前に
            draw.rectangle([x, y-60, x+250, y-20], fill='white', outline=color, width=2)
            draw.text((x+10, y-55), label, fill='black')
            
        out_path = os.path.join(output_dir, f'marked_equipment_v3_{map_name}')
        img.save(out_path)
        print(f"Saved {out_path} based on booths.json")

if __name__ == "__main__":
    mark_equipment_v3()
