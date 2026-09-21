# mini-projects · 小项目合集

轻量小站与一次性工具按子目录收纳，每个子目录自带 README，可独立预览。

| 子项目 | 说明 | 预览 |
| --- | --- | --- |
| [moonlit-bay-trip](moonlit-bay-trip/) | 「月满湾区 · 四人之行」2026 中秋出行展示页（广州 · 珠海 · 顺德） | `cd moonlit-bay-trip && npx serve .` |

## 约定

- 每个子项目是独立目录，互不引用；新增小项目时在本表登记一行；
- 提交信息用 Conventional Commits + 中文描述，范围写子目录名，如 `feat(moonlit-bay-trip): ...`；
- 大文件（照片、构建产物）只放必要的展示图，原图留在本地。

## 子项目如何维护

`moonlit-bay-trip` 是用 `git subtree` 收纳的，历史完整保留在主仓库里。日常直接在本目录改：

```bash
# 改动 → 提交（范围写子目录名）
git add moonlit-bay-trip
git commit -m "feat(moonlit-bay-trip): ..."
git push origin main
```

若子项目需要脱离父仓库独立演进，用 `git subtree split --prefix=moonlit-bay-trip -b <分支名>` 拆出独立历史再推送到新仓库。
