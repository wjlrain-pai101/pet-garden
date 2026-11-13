# 萌宠小花园

一个给小学生玩的网页小游戏：养一只小宠物，种一园小花花，送它去旅行，等它寄明信片回来。

纯静态网页，没有后端，不需要安装或构建，也不引用任何外部资源。

## 怎么玩

- **本地**：双击 `index.html`。
- **离线分享**：把 `萌宠小花园-单文件版.html` 这一个文件发到平板或手机上，用浏览器打开。
- **在线**：部署到 Vercel 后访问分配的网址（见下文）。

进度自动保存在浏览器里，按网址和设备分开，互不同步。

## 目录

| 路径 | 内容 |
|---|---|
| `index.html` | 页面骨架 |
| `css/style.css` | 样式（手绘绘本 / 纸质手帐风） |
| `js/art.js` | 全部插画：宠物、图标、场景、明信片（手绘 SVG） |
| `js/audio.js` | 配乐和音效（Web Audio 实时合成） |
| `js/game.js` | 主玩法：养成、花园、商店、旅行、生病、任务 |
| `js/minigames.js` | 五个小游戏和等级设置 |
| `tools/build-single.js` | 生成单文件版 |

## 部署到 Vercel

1. 把这个仓库推到 GitHub。
2. 打开 <https://vercel.com/new>，导入这个仓库。
3. Framework Preset 选 **Other**，Build Command 和 Output Directory 都留空，点 Deploy。

之后每次推送到 `main` 分支，Vercel 会自动重新发布。

## 改完代码以后

单文件版不会自动更新，改了 `index.html`、`css` 或 `js` 之后重新生成一次：

```bash
node tools/build-single.js
```

## 试玩小技巧

网址后面加 `?fast`，旅行会加速 20 倍，方便快速看完一趟旅行。
