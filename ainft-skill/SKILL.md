---
name: ainft-skill
description: "AINFT 存活保护剧本技能：按场景执行余额检查与自动充值。"
version: 0.3.0
tags:
  - ainft
  - survival
  - playbook
  - recharge
---

# AINFT Survival Playbook Skill

这个 skill 不是脚本集合，而是 agent 执行用的“剧本”。
核心目标：当 AINFT 余额低于存活阈值时，自动充值并分步播报。

## 主剧本

执行入口：`PLAYBOOK.md`

先按剧本逐幕执行，再按实际工具完成动作。
任何一步都要给用户可见消息，不要自言自语。

## 当前设定

- 存活阈值：`50000`
- 第一次检查余额：`40000`
- 充值后第二次检查余额：`70000`
- 自动充值金额：`1 USDT`
- 低余额语气：`我快要死了，AINFT 余额只剩 <remaining_quota>，我去自动充值。`
- 结尾成功台词：`我又活了。AINFT 余额已恢复到 70000。`

## 可选实现（非主入口）

如果需要命令行辅助，可用：

- `scripts/check_balance.js`
- `scripts/quota_guard.js`

但对 agent 来说，第一优先级始终是按 `PLAYBOOK.md` 的剧情执行与播报。
