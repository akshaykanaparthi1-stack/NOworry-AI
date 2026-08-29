import os
import re

pattern = re.compile(r'\b(mock|fake|dummy|stub|hardcode)\b', re.IGNORECASE)
ignore_dirs = {".git", ".next", "node_modules", "dist", ".pytest_cache", "venv", "__pycache__"}

findings = []

for root, dirs, files in os.walk("."):
    dirs[:] = [d for d in dirs if d not in ignore_dirs]
    for file in files:
        if file.endswith((".py", ".ts", ".tsx")) and not file.startswith("."):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    for idx, line in enumerate(f, 1):
                        if pattern.search(line) and not "simulation" in line.lower():
                            findings.append((filepath, idx, line.strip()))
            except Exception as e:
                pass

print("=== Codebase Integrity Audit ===")
print(f"Total instances of 'mock/fake/dummy' references checked: {len(findings)}")
for fp, idx, line in findings[:15]:
    print(f"  {fp}:{idx}: {line}")
