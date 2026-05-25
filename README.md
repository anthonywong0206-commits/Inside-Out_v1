# Emotion Memory Mobile UI v2.0.1

## 修復內容
- 修復 Vercel build 錯誤：Cannot find module 'tailwindcss'
- 已加入 tailwindcss、postcss、autoprefixer devDependencies
- 已加入 postcss.config.js 及 tailwind.config.js，避免舊 repo 殘留設定導致 build 失敗
- 保持手機版概念圖介面設計

## 本機測試
```bash
npm install
npm run dev
```

## Vercel 部署
把 ZIP 解壓後，將所有檔案覆蓋到 GitHub repo 根目錄，重新 commit/push。
Vercel 會自動重新部署。

## 重要
請確認 GitHub repo 根目錄有以下檔案：
- package.json
- index.html
- postcss.config.js
- tailwind.config.js
- src/main.jsx
- src/style.css
