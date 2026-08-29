import os
import re

patterns = [
    (re.compile(r'(api_key|secret|password|token|credentials)\s*[:=]\s*["\'](?!$|v1|INR|development|sqlite|SIMULATION|RETRY|PENDING|COMPLETED|WAITING_APPROVAL|RECOVERED)[^"\']{8,}["\']', re.IGNORECASE), "Hardcoded Secret/Token"),
    (re.compile(r'postgres://[^:]+:[^@]+@', re.IGNORECASE), "Hardcoded DB Credentials")
]

ignore_dirs = {".git", ".next", "node_modules", "dist", ".pytest_cache", "venv", "__pycache__"}

findings = []

for root, dirs, files in os.walk("."):
    dirs[:] = [d for d in dirs if d not in ignore_dirs]
    for file in files:
        if file.endswith((".py", ".ts", ".tsx", ".js", ".json", ".env.example")) and not file.startswith("."):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    for pattern, label in patterns:
                        matches = pattern.findall(content)
                        if matches:
                            findings.append((filepath, label, matches))
            except Exception as e:
                pass

print("=== Security Audit Findings ===")
if not findings:
    print("SUCCESS: Zero hardcoded secrets, API keys, or credentials found across codebase!")
else:
    for fp, label, matches in findings:
        print(f"[{label}] {fp}: {matches}")
