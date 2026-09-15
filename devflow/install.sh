#!/usr/bin/env bash
# devflow 安装脚本(已废弃):推荐 pi install git:github.com/GuangAD/devflow
# 本脚本仅为兼容保留;经 pi 包管理安装可获得版本锚定与更新跟进。
set -euo pipefail
echo "[警告] install.sh 已废弃,推荐: pi install git:github.com/GuangAD/devflow" >&2

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
echo "完成。重启 pi 后输入 / 检查 dev、dev-doc、dev-resume、dev-review、dev-map 五个命令。"
