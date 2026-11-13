// 把 index.html 和它引用的 css、js 合并成一个文件，方便直接发到平板或手机上离线玩。
// 用法（在项目根目录运行）：node tools/build-single.js
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const out = '萌宠小花园-单文件版.html';

let html = read('index.html');
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (m, p) => '<style>\n' + read(p) + '\n</style>');
html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, p) => '<script>\n' + read(p) + '\n</script>');

const left = (html.match(/<script src=|<link rel="stylesheet"/g) || []).length;
if (left) { console.error('还有 ' + left + ' 处外部引用没有合并进去，请检查 index.html'); process.exit(1); }

fs.writeFileSync(path.join(root, out), html);
console.log('已生成 ' + out + '（' + Math.round(html.length / 1024) + ' KB）');
