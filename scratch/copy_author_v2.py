import shutil
import os
import glob

# Search in the entire .gemini directory for the latest png
base_path = r'C:\Users\makta\.gemini\antigravity\brain\3596f011-31ba-4a5e-bd50-d40b869d68a2'
dst = r'c:\Users\makta\source\FieldStyle\fieldstyle-nav\public\author.png'

print(f"Searching in {base_path}...")

files = glob.glob(os.path.join(base_path, '**', 'media_*.png'), recursive=True)
if not files:
    # Also search for uploaded_media_*.img or other patterns
    files = glob.glob(os.path.join(base_path, '**', 'media_*'), recursive=True)

if files:
    # Sort by modification time
    latest_file = max(files, key=os.path.getmtime)
    print(f"Found latest file: {latest_file}")
    shutil.copy2(latest_file, dst)
    print(f"Successfully copied to {dst}")
else:
    print("No matching files found in the entire brain directory!")
    # Let's try searching even higher up
    higher_path = r'C:\Users\makta\.gemini\antigravity'
    files = glob.glob(os.path.join(higher_path, '**', 'media_*.png'), recursive=True)
    if files:
        latest_file = max(files, key=os.path.getmtime)
        print(f"Found in higher path: {latest_file}")
        shutil.copy2(latest_file, dst)
        print("Success!")
    else:
        print("Still nothing. Listing directory contents to debug...")
        for root, dirs, filenames in os.walk(base_path):
            for f in filenames:
                if '1777725043863' in f:
                    print(f"EXACT MATCH FOUND AT: {os.path.join(root, f)}")
