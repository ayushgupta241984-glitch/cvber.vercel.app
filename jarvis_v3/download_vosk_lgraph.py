import os, sys, zipfile, urllib.request, time

URL = "https://alphacephei.com/vosk/models/vosk-model-en-us-0.22-lgraph.zip"
DEST = os.path.join(os.path.expanduser("~"), ".cache", "vosk")
ZIP = os.path.join(DEST, "vosk-model-en-us-0.22-lgraph.zip")

os.makedirs(DEST, exist_ok=True)

if not os.path.exists(ZIP):
    print(f"Downloading {URL}")
    t0 = time.time()
    def hook(blocks, block_size, total):
        if total > 0:
            pct = min(100, blocks * block_size * 100 // total)
            sys.stdout.write(f"\r{pct}%  {blocks*block_size//1048576}MB/{total//1048576}MB")
            sys.stdout.flush()
    urllib.request.urlretrieve(URL, ZIP, hook)
    print(f"\nDownloaded in {time.time()-t0:.0f}s")

print("Extracting...")
t0 = time.time()
with zipfile.ZipFile(ZIP) as z:
    z.extractall(DEST)
print(f"Extracted in {time.time()-t0:.0f}s")
os.remove(ZIP)
print("DONE.")
