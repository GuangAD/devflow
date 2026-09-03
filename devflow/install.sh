#!/usr/bin/env bash
# devflow 安装脚本:复制技能与命令模板到 pi 全局目录
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PI_SKILLS="${HOME}/.pi/agent/skills"
PI_PROMPTS="${HOME}/.pi/agent/prompts"

echo "devflow 安装"
echo "  技能 → ${PI_SKILLS}"
echo "  命令 → ${PI_PROMPTS}"
echo

mkdir -p "${PI_SKILLS}" "${PI_PROMPTS}"

for d in "${SCRIPT_DIR}"/skills/*/; do
  name="$(basename "${d}")"
  rm -rf "${PI_SKILLS}/${name}"
  cp -r "${d}" "${PI_SKILLS}/${name}"
  echo "  skill: ${name}"
done

for f in "${SCRIPT_DIR}"/prompts/*.md; do
  name="$(basename "${f}")"
  cp "${f}" "${PI_PROMPTS}/${name}"
  echo "  prompt: ${name#/}"
done

echo
echo "完成。重启 pi 后输入 / 检查 dev、dev-doc、dev-resume、dev-review 四个命令。"
