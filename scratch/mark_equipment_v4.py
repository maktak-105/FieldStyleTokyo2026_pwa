from PIL import Image, ImageDraw
import json
import os

def mark_equipment_v4():
    root = r'c:\Users\makta\source\FieldStyle\fieldstyle-nav'
    public_dir = os.path.join(root, 'public')
    output_dir = os.path.join(root, 'artifacts')
    booths_path = os.path.join(root, 'src', 'booths.json')
    
    with open(booths_path, 'r', encoding='utf-8') as f:
        booths = json.load(f)
    
    target_names = ['アトリウム・オブジェ', 'エレベーター (西1側)', 'エスカレーター (西2側)', 'エスカレーター (西4側)', 'エレベーター (西3側)', '喫煙所']
    equipment = [b for b in booths if b.get('__EMPTY') in target_names]
    
    for map_name in ['map1.jpg', 'map2.jpg']:
        img_path = os.path.join(public_dir, map_name)
        if not os.path.exists(img_path): continue
        
        img = Image.open(img_path).convert('RGB')
        draw = ImageDraw.Draw(img)
        
        map_id = map_name.split('.')[0]
        for m in [e for e in equipment if e.get('mapId') == map_id]:
            x, y = m['x'], m['y']
            name = m['__EMPTY']
            
            # 色分けのみ。文字は書かない。
            color = 'red' if 'オブジェ' in name else 'blue' if 'エレベーター' in name else 'green'
            
            # 小さな点で正確な位置を示す
            r = 10
            draw.ellipse([x-r, y-r, x+r, y+r], fill=color, outline='white', width=2)
            # 中心に小さな白点
            draw.point((x, y), fill='white')
            
        out_path = os.path.join(output_dir, f'marked_equipment_v4_{map_name}')
        img.save(out_path)
        print(f"Saved {out_path}")

if __name__ == "__main__":
    mark_equipment_v4()
