import dis, marshal, types, sys

def decompile_pyc(path):
    with open(path, 'rb') as f:
        f.read(16)
        code = marshal.load(f)
    print(f"\n{'='*60}")
    print(f"File: {path}")
    print(f"Names: {code.co_names}")
    print(f"Varnames: {code.co_varnames}")
    print(f"Constants: {code.co_consts}")
    print(f"{'='*60}")
    dis.dis(code)

files = [
    r'C:\Users\manoj\Downloads\cvber\jarvis_v3\backend\__pycache__\main.cpython-312.pyc',
    r'C:\Users\manoj\Downloads\cvber\jarvis_v3\backend\__pycache__\config.cpython-312.pyc',
    r'C:\Users\manoj\Downloads\cvber\jarvis_v3\backend\agents\__pycache__\brain.cpython-312.pyc',
    r'C:\Users\manoj\Downloads\cvber\jarvis_v3\backend\agents\__pycache__\orchestrator.cpython-312.pyc',
    r'C:\Users\manoj\Downloads\cvber\jarvis_v3\backend\agents\__pycache__\tools.cpython-312.pyc',
    r'C:\Users\manoj\Downloads\cvber\jarvis_v3\backend\audio\__pycache__\mic_manager.cpython-312.pyc',
    r'C:\Users\manoj\Downloads\cvber\jarvis_v3\backend\audio\__pycache__\stt.cpython-312.pyc',
    r'C:\Users\manoj\Downloads\cvber\jarvis_v3\backend\audio\__pycache__\tts.cpython-312.pyc',
    r'C:\Users\manoj\Downloads\cvber\jarvis_v3\backend\audio\__pycache__\vad.cpython-312.pyc',
]

for f in files:
    try:
        decompile_pyc(f)
    except Exception as e:
        print(f"Error with {f}: {e}")