import json
import os

def merge_booths():
    root = r'c:\Users\makta\source\FieldStyle\fieldstyle-nav'
    list_path = os.path.join(root, 'src', 'FieldStyle_2026_list.json')
    booths_path = os.path.join(root, 'src', 'booths.json')
    
    with open(list_path, 'r', encoding='utf-8') as f:
        new_list = json.load(f)
        
    with open(booths_path, 'r', encoding='utf-8') as f:
        current_booths = json.load(f)
        
    # 番号ごとの店名リストを作成
    name_map = {}
    for item in new_list:
        no = str(item.get('ブース番号', '')).strip()
        name = item.get('出展者名', '').strip()
        if not no or not name: continue
        if no not in name_map:
            name_map[no] = []
        if name not in name_map[no]:
            name_map[no].append(name)
            
    # 統合後のリスト
    merged_list = []
    
    # 現在のbooths.jsonをベースに、店舗名を展開
    for b in current_booths:
        # キー "西展示棟1F" またはその付近から番号を取得
        no_raw = b.get('西展示棟1F')
        if no_raw is None:
            # 他のキーの可能性（F19など）
            no_raw = next((v for k, v in b.items() if k != 'mapId' and k != 'x' and k != 'y' and k != '__EMPTY'), None)
        
        no = str(no_raw).strip() if no_raw is not None else ""
        
        # この番号に対応する店名が新リストにあるか？
        names = name_map.get(no, [])
        if not names:
            # 新リストにない場合は既存の店名を維持
            merged_list.append(b)
        else:
            # 各店名ごとに個別のエントリを作成（座標は同じ）
            for name in names:
                new_entry = b.copy()
                new_entry['__EMPTY'] = name
                merged_list.append(new_entry)
                
    # 保存
    with open(booths_path, 'w', encoding='utf-8') as f:
        json.dump(merged_list, f, ensure_ascii=False, indent=2)
    
    print(f"Merged {len(merged_list)} entries into booths.json")

if __name__ == "__main__":
    merge_booths()
