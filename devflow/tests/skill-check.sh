#!/usr/bin/env bash
# devflow 技能文档静态检查。
# 只验「没有断链」，不验「能跑」。用法：bash devflow/tests/skill-check.sh
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILLS="$ROOT/skills"
PROMPTS="$ROOT/prompts"
LIMIT=20000
fail=0

note() { echo "FAIL  $*"; fail=1; }

echo "== 1. SKILL.md 字节数（阈值 $LIMIT） =="
for f in $(find "$SKILLS" -name SKILL.md | sort); do
  size=$(wc -c < "$f" | tr -d ' ')
  if [ "$size" -ge "$LIMIT" ]; then
    note "$size  ${f#$ROOT/}"
  else
    echo "ok    $size  ${f#$ROOT/}"
  fi
done

echo
echo "== 2. SKILL.md 引用的 references 是否存在 =="
for f in $(find "$SKILLS" -name SKILL.md | sort); do
  case "$f" in */dev-map/*) continue ;; esac   # dev-map 已废弃，不校验其引用
  dir=$(dirname "$f")
  for ref in $(grep -o 'references/[A-Za-z0-9._-]*\.md' "$f" 2>/dev/null | sort -u); do
    [ -f "$dir/$ref" ] || note "缺失 $ref（引用于 ${f#$ROOT/}）"
  done
done
[ "$fail" -eq 0 ] && echo "ok"

echo
echo "== 3. 已删除的旧文件名残留 =="
old=0
stale=$(grep -rn "design-template\|spec-template\|plan-template\|design-checklist" \
    --include="*.md" "$SKILLS" "$PROMPTS" 2>/dev/null \
    | grep -v "tech-spec-template\|task-spec-template")
if [ -n "$stale" ]; then
  echo "$stale"
  old=1
  fail=1
fi
[ "$old" -eq 0 ] && echo "ok"

echo
echo "== 4. 已废弃的概念残留（dev-map 已废弃，豁免） =="
found=0
out=$(grep -rn "轻流程\|重流程\|巨流程\|heavy track\|light track\|huge track\|classifier" \
    --include="*.md" "$SKILLS" "$PROMPTS" 2>/dev/null | grep -v "/dev-map/")
if [ -n "$out" ]; then
  echo "$out"
  found=1
  fail=1
fi
[ "$found" -eq 0 ] && echo "ok"

echo
echo "== 5. frontmatter 完整 =="
ff=0
for f in $(find "$SKILLS" -name SKILL.md | sort); do
  head -5 "$f" | grep -q '^name:'        || { note "缺 name  ${f#$ROOT/}"; ff=1; }
  head -5 "$f" | grep -q '^description:' || { note "缺 description  ${f#$ROOT/}"; ff=1; }
done
[ "$ff" -eq 0 ] && echo "ok"

echo
if [ "$fail" -eq 0 ]; then
  echo "PASS"
else
  echo "FAILED"
fi
exit "$fail"
