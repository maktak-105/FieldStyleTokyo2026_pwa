import shutil
import os

src = r'C:\Users\makta\.gemini\antigravity\brain\3596f011-31ba-4a5e-bd50-d40b869d68a2\.tempmediaStorage\media_3596f011-31ba-4a5e-bd50-d40b869d68a2_1777724328574.png'
dst = r'c:\Users\makta\source\FieldStyle\fieldstyle-nav\public\author.png'

print(f"Copying from {src} to {dst}")
try:
    if os.path.exists(src):
        shutil.copy2(src, dst)
        print("Success!")
    else:
        print("Source file not found!")
        # Try to find it in the parent directory
        parent = os.path.dirname(src)
        print(f"Searching in {parent}...")
        for f in os.listdir(parent):
            if '1777724328574' in f:
                new_src = os.path.join(parent, f)
                shutil.copy2(new_src, dst)
                print(f"Found and copied: {f}")
                break
except Exception as e:
    print(f"Error: {e}")
