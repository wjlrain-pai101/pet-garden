'use strict';
/* ==========================================================
 *  萌宠小花园 · 主玩法
 *  养成（喂食/洗澡/睡觉）+ 花园 + 商店 + 旅行（行囊/明信片/特产）+ 小客人
 * ========================================================== */
const SAVE_KEY = 'mengchong_garden_v2';
const SPEED = /[?&]fast\b/.test(location.search) ? 20 : 1;   // 网址后面加 ?fast 可以让旅行变快，方便试玩
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dayNum = () => { const d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000); };

/* ---------- 数据表 ---------- */
/* 吃的和喝的。drink 表示是饮料（主要补“水分”）；sweet 表示是甜食，连着吃太多会肚子疼 */
const FOODS = {
  millet:     { name: '小米',     ic: 'millet',     hunger: 16, price: 4 },
  seed:       { name: '瓜子',     ic: 'seed',       hunger: 16, price: 5 },
  nut:        { name: '栗子',     ic: 'nut',        hunger: 18, price: 6 },
  fish:       { name: '小鱼干',   ic: 'fish',       hunger: 20, price: 8 },
  bone:       { name: '骨头饼干', ic: 'bone',       hunger: 20, price: 8 },
  carrot:     { name: '胡萝卜',   ic: 'carrot',     hunger: 16, price: 5 },
  corn:       { name: '玉米',     ic: 'corn',       hunger: 18, price: 6 },
  apple:      { name: '苹果',     ic: 'apple',      hunger: 14, happy: 4, price: 5 },
  strawberry: { name: '草莓',     ic: 'strawberry', hunger: 12, happy: 8, price: 7 },
  tomato:     { name: '番茄',     ic: 'tomato',     hunger: 12, thirst: 8, price: 5 },
  watermelon: { name: '西瓜',     ic: 'watermelon', hunger: 10, thirst: 22, price: 9 },
  lettuce:    { name: '生菜',     ic: 'lettuce',    hunger: 10, thirst: 6, price: 5 },
  potato:     { name: '土豆',     ic: 'potato',     hunger: 18, price: 6 },
  mushroom:   { name: '蘑菇',     ic: 'mushroom',   hunger: 12, price: 6 },
  pumpkin:    { name: '南瓜',     ic: 'pumpkin',    hunger: 18, price: 7 },
  eggplant:   { name: '茄子',     ic: 'eggplant',   hunger: 14, price: 6 },
  bread:      { name: '小面包',   ic: 'bread',      hunger: 22, price: 8 },
  friedegg:   { name: '煎蛋',     ic: 'friedegg',   hunger: 18, energy: 6, price: 9 },
  cheese:     { name: '奶酪',     ic: 'cheese',     hunger: 16, happy: 6, price: 9 },
  cookie:     { name: '曲奇',     ic: 'cookie',     hunger: 12, happy: 8, price: 8 },
  pudding:    { name: '布丁',     ic: 'pudding',    hunger: 10, happy: 14, sweet: 1, price: 12 },
  candy:      { name: '水果糖',   ic: 'candy',      hunger: 4,  happy: 12, sweet: 1, price: 6 },
  cake:       { name: '小蛋糕',   ic: 'cake',       hunger: 10, happy: 16, sweet: 1, price: 14 },
  egg:        { name: '鸡蛋',     ic: 'eggs',       hunger: 14, price: 6 },
  rice:       { name: '米饭',     ic: 'rice',       hunger: 22, price: 6 },
  noodle:     { name: '面条',     ic: 'noodle',     hunger: 20, price: 7 },
  tofu:       { name: '豆腐',     ic: 'tofu',       hunger: 14, price: 6 },
  dumpling:   { name: '小饺子',   ic: 'dumpling',   hunger: 24, price: 10 },
  popcorn:    { name: '爆米花',   ic: 'popcorn',    hunger: 8,  happy: 10, price: 7 },
  donut:      { name: '甜甜圈',   ic: 'donut',      hunger: 12, happy: 14, sweet: 1, price: 11 },
  icecream:   { name: '冰淇淋',   ic: 'icecream',   hunger: 6,  thirst: 8, happy: 16, sweet: 1, price: 12 },
  cabbage:    { name: '白菜',     ic: 'cabbage',    hunger: 12, thirst: 6, price: 5 },
  cucumber:   { name: '黄瓜',     ic: 'cucumber',   hunger: 8,  thirst: 12, price: 5 },
  broccoli:   { name: '西兰花',   ic: 'broccoli',   hunger: 14, price: 6 },
  spinach:    { name: '菠菜',     ic: 'spinach',    hunger: 10, energy: 4, price: 6 },
  onion:      { name: '洋葱',     ic: 'onion',      hunger: 10, price: 5 },
  sweetpotato: { name: '红薯',    ic: 'sweetpotato', hunger: 20, price: 7 },
  pea:        { name: '豌豆',     ic: 'pea',        hunger: 12, price: 6 },
  radish:     { name: '白萝卜',   ic: 'radish',     hunger: 12, thirst: 6, price: 5 },
  orange:     { name: '橙子',     ic: 'orange',     hunger: 10, thirst: 10, happy: 4, price: 6 },
  peach:      { name: '桃子',     ic: 'peach',      hunger: 12, happy: 6, price: 7 },
  banana:     { name: '香蕉',     ic: 'banana',     hunger: 16, energy: 4, price: 6 },
  grape:      { name: '葡萄',     ic: 'grape',      hunger: 10, thirst: 8, happy: 6, price: 8 },
  cherry:     { name: '樱桃',     ic: 'cherry',     hunger: 8,  happy: 8, price: 8 },
  pineapple:  { name: '菠萝',     ic: 'pineapple',  hunger: 12, thirst: 10, price: 8 },
  mango:      { name: '芒果',     ic: 'mango',      hunger: 14, happy: 6, price: 8 },
  lemon:      { name: '柠檬',     ic: 'lemon',      hunger: 4,  thirst: 12, price: 5 },
  mantou:     { name: '小馒头',   ic: 'mantou',     hunger: 18, price: 5 },
  fries:      { name: '薯条',     ic: 'fries',      hunger: 14, happy: 8, price: 8 },
  pizza:      { name: '小披萨',   ic: 'pizza',      hunger: 26, happy: 6, price: 12 },
  burger:     { name: '小汉堡',   ic: 'burger',     hunger: 28, price: 12 },
  lollipop:   { name: '棒棒糖',   ic: 'lollipop',   hunger: 3,  happy: 14, sweet: 1, price: 6 },
  jelly:      { name: '果冻',     ic: 'jelly',      hunger: 6,  thirst: 6, happy: 12, sweet: 1, price: 8 },
  chocolate:  { name: '巧克力',   ic: 'chocolate',  hunger: 8,  happy: 14, energy: 4, sweet: 1, price: 10 },
  water:      { name: '清水',     ic: 'water',      drink: true, thirst: 24, price: 2 },
  milk:       { name: '牛奶',     ic: 'milk',       drink: true, thirst: 20, hunger: 8, price: 6 },
  juice:      { name: '橙汁',     ic: 'juice',      drink: true, thirst: 22, happy: 6, price: 7 },
  honey:      { name: '蜂蜜水',   ic: 'honey',      drink: true, thirst: 20, energy: 8, price: 8 },
  cocoa:      { name: '热可可',   ic: 'cocoa',      drink: true, thirst: 14, happy: 14, sweet: 1, price: 10 },
  soymilk:    { name: '豆浆',     ic: 'soymilk',    drink: true, thirst: 20, hunger: 6, price: 5 },
  lemonade:   { name: '柠檬水',   ic: 'lemonade',   drink: true, thirst: 26, happy: 4, price: 6 },
  coconut:    { name: '椰子汁',   ic: 'coconut',    drink: true, thirst: 28, energy: 4, price: 9 },
  bubbletea:  { name: '珍珠奶茶', ic: 'bubbletea',  drink: true, thirst: 16, happy: 16, sweet: 1, price: 11 },
  barleytea:  { name: '大麦茶',   ic: 'barleytea',  drink: true, thirst: 24, energy: 4, price: 5 },
  plumjuice:  { name: '酸梅汤',   ic: 'plumjuice',  drink: true, thirst: 26, happy: 6, price: 7 },
  mungsoup:   { name: '绿豆汤',   ic: 'mungsoup',   drink: true, thirst: 24, hunger: 6, price: 7 }
};
const SEEDS = {
  carrot:     { name: '胡萝卜', ic: 'carrot',     time: 60,  give: 3, food: 'carrot',     price: 5 },
  millet:     { name: '小米',   ic: 'millet',     time: 60,  give: 4, food: 'millet',     price: 5 },
  tomato:     { name: '番茄',   ic: 'tomato',     time: 75,  give: 3, food: 'tomato',     price: 6 },
  corn:       { name: '玉米',   ic: 'corn',       time: 90,  give: 3, food: 'corn',       price: 7 },
  strawberry: { name: '草莓',   ic: 'strawberry', time: 90,  give: 3, food: 'strawberry', price: 8 },
  sunflower:  { name: '向日葵', ic: 'sunflower',  time: 120, give: 4, food: 'seed',       price: 9 },
  watermelon: { name: '西瓜',   ic: 'watermelon', time: 120, give: 2, food: 'watermelon', price: 10 },
  lettuce:    { name: '生菜',   ic: 'lettuce',    time: 60,  give: 3, food: 'lettuce',    price: 5 },
  mushroom:   { name: '蘑菇',   ic: 'mushroom',   time: 75,  give: 3, food: 'mushroom',   price: 6 },
  potato:     { name: '土豆',   ic: 'potato',     time: 90,  give: 3, food: 'potato',     price: 6 },
  eggplant:   { name: '茄子',   ic: 'eggplant',   time: 90,  give: 3, food: 'eggplant',   price: 7 },
  pumpkin:    { name: '南瓜',   ic: 'pumpkin',    time: 120, give: 2, food: 'pumpkin',    price: 8 },
  tulip:      { name: '郁金香', ic: 'tulip',      time: 75,  coins: 25, price: 8 },
  rose:       { name: '玫瑰',   ic: 'rose',       time: 110, coins: 40, price: 12 },
  ginger:     { name: '生姜',   ic: 'ginger',     time: 75,  give: 2, med: 'gingertea', price: 6 },
  mint:       { name: '薄荷',   ic: 'mint',       time: 60,  give: 2, med: 'mint',      price: 6 },
  pear:       { name: '雪梨',   ic: 'pear',       time: 90,  give: 2, med: 'pearsoup',  price: 7 },
  cabbage:    { name: '白菜',   ic: 'cabbage',    time: 60,  give: 3, food: 'cabbage',    price: 5 },
  spinach:    { name: '菠菜',   ic: 'spinach',    time: 60,  give: 3, food: 'spinach',    price: 6 },
  cucumber:   { name: '黄瓜',   ic: 'cucumber',   time: 75,  give: 3, food: 'cucumber',   price: 6 },
  radish:     { name: '白萝卜', ic: 'radish',     time: 75,  give: 3, food: 'radish',     price: 5 },
  pea:        { name: '豌豆',   ic: 'pea',        time: 75,  give: 4, food: 'pea',        price: 6 },
  onion:      { name: '洋葱',   ic: 'onion',      time: 90,  give: 3, food: 'onion',      price: 6 },
  broccoli:   { name: '西兰花', ic: 'broccoli',   time: 90,  give: 2, food: 'broccoli',   price: 7 },
  sweetpotato: { name: '红薯',  ic: 'sweetpotato', time: 120, give: 3, food: 'sweetpotato', price: 8 },
  grape:      { name: '葡萄',   ic: 'grape',      time: 120, give: 4, food: 'grape',      price: 9 },
  daisy:      { name: '小雏菊', ic: 'daisy',      time: 50,  coins: 18, price: 6 },
  lavender:   { name: '薰衣草', ic: 'lavender',   time: 140, coins: 55, price: 14 },
  lemon:      { name: '柠檬',   ic: 'lemon',      time: 90,  give: 3, food: 'lemon',      price: 7 },
  cherry:     { name: '樱桃',   ic: 'cherry',     time: 120, give: 4, food: 'cherry',     price: 9 },
  lily:       { name: '百合',   ic: 'lily',       time: 160, coins: 70, price: 16 }
};
/* 药。tonic 是保健品（没病时吃，预防生病）；any 是什么病都能治 */
const MEDS = {
  gingertea:  { name: '姜茶',       ic: 'gingertea',  price: 8,  desc: '着凉的时候喝' },
  mint:       { name: '薄荷草',     ic: 'mint',       price: 8,  desc: '肚子疼的时候吃' },
  pearsoup:   { name: '冰糖梨汤',   ic: 'pearsoup',   price: 9,  desc: '嗓子疼的时候喝' },
  feverpatch: { name: '退烧贴',     ic: 'feverpatch', price: 10, desc: '发烧的时候贴' },
  vitamin:    { name: '维生素软糖', ic: 'vitamin',    price: 15, desc: '没病时吃，10 分钟内不生病', tonic: true },
  panacea:    { name: '万能药水',   ic: 'panacea',    price: 40, desc: '什么病都能马上治好', any: true },
  firstaid:   { name: '小药箱',     ic: 'firstaid',   price: 30, desc: '四种药各一份，比单买便宜', pack: ['gingertea', 'mint', 'pearsoup', 'feverpatch'] }
};
/* 四种小毛病：某项状态（stat）低于 below，先出现症状；一直不处理就会生病。
 * rest 是吃药以后怎么休息：sleep 要睡一觉，rest 歇一会儿就行 */
const SICK_AFTER = 150;      // 出现症状后，多少秒不处理会生病
const RUNAWAY_AFTER = 600;   // 生病后，多少秒不吃药会离家出走（关掉游戏的时间也算）
const ILLS = {
  cold:   { name: '着凉了', short: '着凉', stat: 'clean',  below: 20, symptom: '在打喷嚏',     cause: '身上太脏', fix: '洗澡',   act: 'bath',  fx: '阿嚏！',
            med: 'gingertea',  rest: 'sleep', how: '给它喝一杯姜茶，再让它睡一觉就会好', say: '阿嚏！我好像着凉了…',
            lines: [['阿嚏！鼻子痒痒的…', '想喝一杯热热的姜茶…'], ['喝了姜茶暖暖的，想睡一觉…']] },
  tummy:  { name: '肚子疼', short: '肚子疼', stat: 'hunger', below: 15, symptom: '肚子咕咕直叫', cause: '饿得太久', fix: '吃东西', act: 'feed',  fx: '咕噜噜…',
            med: 'mint',       rest: 'rest',  how: '给它吃一点薄荷草，再休息一会儿就会好', say: '哎哟，肚子好疼…',
            lines: [['肚子咕噜咕噜地疼…', '想吃一点薄荷草…'], ['舒服多了，再歇一会儿就好…']] },
  throat: { name: '嗓子疼', short: '嗓子疼', stat: 'thirst', below: 15, symptom: '嗓子干干的',   cause: '太久没喝水', fix: '喝水',  act: 'drink', fx: '咳咳…',
            med: 'pearsoup',   rest: 'rest',  how: '给它喝一碗冰糖梨汤，再休息一会儿就会好', say: '咳咳… 嗓子好疼…',
            lines: [['咳咳… 说话都疼…', '想喝一碗甜甜的梨汤…'], ['嗓子润润的，再歇一会儿就好…']] },
  fever:  { name: '发烧了', short: '发烧', stat: 'energy', below: 12, symptom: '没精神、额头烫', cause: '太累了',   fix: '睡觉',   act: 'sleep', fx: '呼… 好烫',
            med: 'feverpatch', rest: 'sleep', how: '给它贴上退烧贴，再让它睡一觉就会好', say: '头晕晕的… 我好像发烧了…',
            lines: [['头好晕，脸烫烫的…', '想贴一张凉凉的退烧贴…'], ['凉凉的好舒服，想睡一觉…']] }
};
const WEARS = {
  leaf:    { name: '小树叶',   ic: 'leaf',       price: 20 },
  bow:     { name: '蝴蝶结',   ic: 'bow',        price: 30 },
  star:    { name: '星星发卡', ic: 'star',       price: 30 },
  flower:  { name: '小花发夹', ic: 'flowerclip', price: 35 },
  beret:   { name: '贝雷帽',   ic: 'beret',      price: 40 },
  cap:     { name: '棒球帽',   ic: 'cap',        price: 45 },
  nightcap: { name: '小睡帽',  ic: 'nightcap',   price: 50 },
  hat:     { name: '派对帽',   ic: 'party',      price: 50 },
  bunny:   { name: '兔耳朵',   ic: 'bunny',      price: 55 },
  glasses: { name: '小眼镜',   ic: 'glasses',    price: 60 },
  sunglasses: { name: '小墨镜', ic: 'sunglasses', price: 65 },
  headphones: { name: '小耳机', ic: 'headphones', price: 70 },
  wreath:  { name: '花环',     ic: 'wreath',     price: 80 },
  santa:   { name: '圣诞帽',   ic: 'santa',      price: 90 },
  helmet:  { name: '赛车头盔', ic: 'helmet',     price: 85 },
  pirate:  { name: '海盗帽',   ic: 'pirate',     price: 95 },
  gradcap: { name: '博士帽',   ic: 'gradcap',    price: 110 },
  wizard:  { name: '魔法帽',   ic: 'wizard',     price: 120 },
  halo:    { name: '天使光环', ic: 'halo',       price: 130 },
  crown:   { name: '小皇冠',   ic: 'crown',      price: 150 }
};
/* 旅行用品。once 用一次少一个；to 是带上它能去的地方 */
const GEAR = {
  bell:     { name: '幸运铃铛', ic: 'bell',     price: 18, desc: '更容易遇见珍贵风景', once: true },
  strawhat: { name: '草帽',     ic: 'strawhat', price: 45, desc: '可以去海边、沙漠和金字塔', to: ['sea', 'desert', 'pyramid'] },
  umbrella: { name: '小雨伞',   ic: 'umbrella', price: 55, desc: '可以去彩虹瀑布和蘑菇森林', to: ['waterfall', 'mushwood'] },
  lantern:  { name: '小灯笼',   ic: 'lantern',  price: 60, desc: '可以去竹林、小镇、乐园和水晶山洞', to: ['bamboo', 'town', 'ferris', 'cave'] },
  camera:   { name: '小相机',   ic: 'camera',   price: 70, desc: '更容易多带回一张明信片' },
  tent:     { name: '小帐篷',   ic: 'tent',     price: 80, desc: '可以去雪山、营地和长颈鹿草原', to: ['snow', 'camp', 'safari'] },
  goggles:  { name: '潜水镜',   ic: 'goggles',  price: 90, desc: '可以去海底世界', to: ['ocean'] },
  boat:     { name: '小木船',   ic: 'boat',     price: 100, desc: '可以去椰子小岛和企鹅冰原', to: ['island', 'penguin'] },
  hotair:   { name: '热气球',   ic: 'hotair',   price: 130, desc: '可以去云上城堡和糖果王国', to: ['cloud', 'candy'] },
  rocket:   { name: '小火箭',   ic: 'rocket',   price: 180, desc: '可以去月亮上面', to: ['moon'] }
};
const BASE_DESTS = ['flower', 'rice', 'spring', 'sakura', 'meadow', 'lake', 'orchard', 'maple', 'farm', 'teahill'];
const CAR_DESTS = ['track', 'canyon'];   // 只有开车才到得了的地方
const TASKS = [
  { id: 'feed',    name: '喂宠物吃 3 次饭',   need: 3, coin: 15, ic: 'apple' },
  { id: 'drink',   name: '给宠物喝 2 次水',   need: 2, coin: 10, ic: 'water' },
  { id: 'cook',    name: '煮 1 道菜',         need: 1, coin: 15, ic: 'pot' },
  { id: 'water',   name: '给植物浇 5 次水',   need: 5, coin: 15, ic: 'drop' },
  { id: 'game',    name: '玩 2 次小游戏',     need: 2, coin: 20, ic: 'kite' },
  { id: 'bath',    name: '给宠物洗 1 次澡',   need: 1, coin: 15, ic: 'tub' },
  { id: 'harvest', name: '收获 2 次植物',     need: 2, coin: 20, ic: 'sunflower' },
  { id: 'trip',    name: '送宠物去旅行 1 次', need: 1, coin: 20, ic: 'backpack' }
];
const STICKERS = [
  { id: 's1',  ic: 'apple',     name: '小小饲养员',   c: 'feed', n: 5 },
  { id: 's2',  ic: 'can',       name: '浇水小能手',   c: 'water', n: 10 },
  { id: 's3',  ic: 'sunflower', name: '小园丁',       c: 'harvest', n: 5 },
  { id: 's4',  ic: 'tub',       name: '爱干净宝宝',   c: 'bath', n: 3 },
  { id: 's5',  ic: 'heart',     name: '最好的朋友',   c: 'pet', n: 30 },
  { id: 's6',  ic: 'kite',      name: '游戏小达人',   c: 'game', n: 5 },
  { id: 's7',  ic: 'trophy',    name: '游戏冠军',     c: 'game', n: 20 },
  { id: 's8',  ic: 'backpack',  name: '小小旅行家',   c: 'trip', n: 1 },
  { id: 's9',  ic: 'tent',      name: '走遍四方',     c: 'trip', n: 8 },
  { id: 's10', ic: 'mail',      name: '明信片收藏家', c: 'cards', n: 8 },
  { id: 's11', ic: 'tea',       name: '热情小主人',   c: 'guest', n: 5 },
  { id: 's12', ic: 'crown',     name: '超级明星',     c: 'level', n: 6 },
  { id: 's13', ic: 'med',       name: '细心小护士',   c: 'cure', n: 1 },
  { id: 's14', ic: 'pot',       name: '小小厨师',     c: 'cook', n: 1 },
  { id: 's15', ic: 'pumpkin',   name: '菜谱大王',     c: 'recipes', n: 12 },
  { id: 's16', ic: 'sofa',      name: '小小设计师',   c: 'furn', n: 8 },
  { id: 's17', ic: 'noodle',    name: '料理达人',     c: 'recipes', n: 40 },
  { id: 's18', ic: 'dumpling',  name: '美食大师',     c: 'recipes', n: 100 },
  { id: 's19', ic: 'rocket',    name: '环游世界',     c: 'trip', n: 25 },
  { id: 's20', ic: 'camera',    name: '风景收藏家',   c: 'cards', n: 24 },
  { id: 's21', ic: 'minicar',   name: '小小车手',     c: 'cars', n: 1 },
  { id: 's22', ic: 'mapic',     name: '走遍地图',     c: 'places', n: 20 }
];

/* ---------- 存档 ---------- */
let S = null;
function newState(type, name) {
  const inv = { apple: 2, water: 2 }; inv[PETS[type].fav] = 3;
  return {
    v: 2, pet: { type, name }, level: 1, exp: 0, coins: 60,
    stats: { hunger: 62, thirst: 68, clean: 74, happy: 70, energy: 86 },
    inv, seeds: { carrot: 2, lettuce: 2, tulip: 1 }, owned: [], wear: null, gear: {},
    floor: 1, furn: furnDefault(), wallPick: null, dishes: {}, cookbook: {},
    plots: [null, null, null, null, null, null],
    sleeping: false, last: Date.now(),
    trip: null, mail: [], cards: {}, cardLog: [], souv: {}, visitor: null, albumNew: false,
    daily: { day: 0, signed: false, prog: {}, claimed: {} }, streak: 0,
    sick: null, runaway: null, meds: {}, risk: { cold: 0, tummy: 0, throat: 0, fever: 0 }, sweet: 0, immune: 0, souvSeen: {},
    counters: { feed: 0, water: 0, harvest: 0, game: 0, bath: 0, pet: 0, trip: 0, guest: 0, cure: 0 },
    gameLv: { math: 3, catch: 2, fly: 2, memory: 2, melody: 2 },   // 小游戏等级：口算是年级，其余是 1 轻松 / 2 普通 / 3 挑战
    stickers: [], phrases: [], soundOn: true
  };
}
function save() {
  if (!S) return;
  S.last = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { }
}
function loadState() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (!d || !d.pet || !PETS[d.pet.type]) return null;
    const b = newState(d.pet.type, d.pet.name);
    const s = Object.assign({}, b, d);
    s.stats = Object.assign(b.stats, d.stats);
    s.counters = Object.assign(b.counters, d.counters);
    s.daily = Object.assign(b.daily, d.daily);
    if (!Array.isArray(s.plots) || s.plots.length !== 6) s.plots = b.plots;
    if (s.trip && !DESTS[s.trip.dest]) s.trip = null;
    if (s.sick && !ILLS[s.sick.type]) s.sick = null;
    s.risk = Object.assign({ cold: 0, tummy: 0, throat: 0, fever: 0 }, d.risk);
    if (!d.souvSeen) { s.souvSeen = {}; for (const k in s.souv) if (s.souv[k]) s.souvSeen[k] = 1; }   // 旧存档：以前拿到过的特产都算见过
    if (s.runaway && !ILLS[s.runaway.type]) s.runaway = null;
    if (!s.furn || !Array.isArray(s.furn.own) || !Array.isArray(s.furn.put)) s.furn = furnDefault();   // 旧存档：补上原来画在背景里的那几件家具
    s.furn.put = s.furn.put.filter(p => FURNS[p.id]);
    if (s.floor !== 2) s.floor = 1;
    if (!s.meds) s.meds = {};
    return s;
  } catch (e) { return null; }
}

/* ---------- 通用小工具：提示、特效、弹窗 ---------- */
let toastTimer, bannerTimer, modalOnClose = null;
const acorns = n => icon('acorn') + ' ' + n;
function toast(t, ms) {
  const el = $('#toast'); el.textContent = t; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), ms || 2400);
}
function banner(t, ms) {
  const el = $('#banner'); el.textContent = t; el.classList.add('show');
  clearTimeout(bannerTimer); bannerTimer = setTimeout(() => el.classList.remove('show'), ms || 2400);
}
function floatFx(html, x, y) {
  const el = document.createElement('div'); el.className = 'fx-float'; el.innerHTML = html;
  el.style.left = x + 'px'; el.style.top = y + 'px';
  $('#fx').appendChild(el); setTimeout(() => el.remove(), 1250);
}
function flyIcon(name, x1, y1, x2, y2, cb) {
  const el = document.createElement('div'); el.className = 'fx-fly'; el.innerHTML = icon(name);
  $('#fx').appendChild(el);
  // 动画结束后才生效；如果页面在后台、动画不走，就靠定时器兜底，保证东西不会白白用掉
  let done = false;
  const finish = () => { if (done) return; done = true; el.remove(); cb && cb(); };
  setTimeout(finish, 900);
  if (!el.animate) { finish(); return; }
  const a = el.animate([
    { transform: `translate(${x1 - 20}px,${y1 - 20}px) scale(1.2)` },
    { transform: `translate(${(x1 + x2) / 2 - 20}px,${Math.min(y1, y2) - 90}px) scale(1.5)`, offset: .5 },
    { transform: `translate(${x2 - 20}px,${y2 - 20}px) scale(.5)` }
  ], { duration: 650, easing: 'ease-in-out' });
  a.onfinish = finish;
}
function confetti() {
  const cs = ['#EBAE9C', '#EBC66B', '#B9CFA0', '#A9CDD9', '#CBBBDD'];
  for (let i = 0; i < 36; i++) {
    const el = document.createElement('i'); el.className = 'confetti';
    el.style.left = rand(0, 100) + 'vw'; el.style.background = pick(cs);
    el.style.animationDuration = (1.6 + Math.random() * 1.6) + 's';
    el.style.animationDelay = (Math.random() * .4) + 's';
    $('#fx').appendChild(el); setTimeout(() => el.remove(), 3800);
  }
}
function openModal(html, opt) {
  opt = opt || {};
  closeModal();
  const root = $('#modal-root');
  root.innerHTML = `<div class="modal-mask"><div class="modal${opt.wide ? ' wide' : ''}">${opt.noClose ? '' : '<button class="x" data-close>×</button>'}${html}</div></div>`;
  const mask = root.firstChild;
  mask.addEventListener('click', e => {
    if ((e.target === mask && !opt.noClose) || e.target.closest('[data-close]')) { Sound.sfx.click(); closeModal(); }
  });
  modalOnClose = opt.onClose || null;
  return mask.querySelector('.modal');
}
function closeModal() {
  const root = $('#modal-root');
  if (!root.firstChild) return;
  root.innerHTML = '';
  const f = modalOnClose; modalOnClose = null; f && f();
}
const modalOpen = () => !!$('#modal-root').firstChild;
function showScreen(id) { $$('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + id)); }
function fillIcons(root) { $$('[data-ic]', root).forEach(el => { el.innerHTML = icon(el.dataset.ic); }); }
function itemBtn(attr, ic, name, sub, sel) {
  return `<button class="item${sel ? ' sel' : ''}" ${attr}>${icon(ic, 'big')}<b>${name}</b>${sub ? '<small>' + sub + '</small>' : ''}</button>`;
}

/* ---------- 成长 ---------- */
const needExp = lv => 40 + lv * 30;
const levelTitle = lv => lv < 3 ? '宝宝' : lv < 6 ? '小可爱' : lv < 10 ? '小明星' : '超级明星';
function addStat(k, v) { S.stats[k] = clamp(S.stats[k] + v, 0, 100); }
function addCoins(n) {
  S.coins += n;
  const c = $('#hud-coin'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
  Sound.sfx.coin(); updateHUD();
}
function addExp(n) {
  S.exp += n;
  let up = false;
  while (S.exp >= needExp(S.level)) { S.exp -= needExp(S.level); S.level++; S.coins += 20; up = true; }
  if (up) {
    Sound.sfx.level(); confetti();
    banner('长大啦！Lv.' + S.level + ' ' + levelTitle(S.level));
    setTimeout(() => toast('升级奖励：橡果 +20'), 2500);
    renderPet(true);
  }
}
function afterAction() { updateHUD(); renderPet(); checkStickers(); save(); }

/* ---------- 顶部状态栏 ---------- */
function updateHUD() {
  $('#hud-petname').textContent = S.pet.name;
  $('#hud-lv').innerHTML = 'Lv.' + S.level + '<em> ' + levelTitle(S.level) + '</em>';
  $('#hud-exp').style.width = (S.exp / needExp(S.level) * 100) + '%';
  $('#hud-coin b').textContent = S.coins;
  $('#hud-ill').textContent = S.runaway ? '离家出走了' : S.sick && !S.trip ? ILLS[S.sick.type].name : '';
  for (const k in S.stats) {
    const el = $(`.stat[data-k="${k}"]`); if (!el) continue;
    el.querySelector('.bar i').style.width = S.stats[k] + '%';
    el.classList.toggle('low', S.stats[k] < 25);
  }
}
function updateSoundBtn() { $('#btn-music').innerHTML = icon(S.soundOn ? 'note' : 'mute'); }
function updateDots() {
  $('#btn-tasks').classList.toggle('has', TASKS.some(t => (S.daily.prog[t.id] || 0) >= t.need && !S.daily.claimed[t.id]));
  $('#nav [data-scene=garden]').classList.toggle('has', S.mail.length > 0 || !!(S.visitor && !S.visitor.fed));
  $('#nav [data-scene=album]').classList.toggle('has', !!S.albumNew);
}

/* ---------- 宠物的表情和动作 ---------- */
let tempMood = null, tempTimer = null, petSig = '', sayTimer = null;
function calcMood() {
  if (S.sleeping) return 'sleep';
  if (tempMood) return tempMood;
  if (S.sick) return S.sick.type;
  const s = S.stats, mn = Math.min(s.hunger, s.thirst, s.clean, s.happy, s.energy);
  if (mn < 25) return 'sad';
  return (s.hunger + s.thirst + s.clean + s.happy + s.energy) / 5 >= 72 ? 'happy' : 'normal';
}
function renderPet(force) {
  const mood = calcMood(), sig = S.pet.type + '|' + mood + '|' + S.wear;
  if (!force && sig === petSig) return;
  petSig = sig;
  const svg = petSVG(S.pet.type, mood, S.wear);
  ['#pet', '#pet-garden'].forEach(id => {
    const el = $(id); el.innerHTML = svg;
    el.className = el.className.replace(/\s*mood-\w+/g, '') + ' mood-' + mood;
  });
  $('#hud-avatar').innerHTML = petSVG(S.pet.type, ['sleep', 'sad', 'cold', 'tummy', 'throat', 'fever'].includes(mood) ? mood : 'normal', S.wear);
  $('#scene-home').classList.toggle('night', S.sleeping);
  document.documentElement.style.setProperty('--grow', (0.84 + Math.min(S.level, 10) * 0.016).toFixed(3));
}
function setTempMood(m, ms) {
  tempMood = m; clearTimeout(tempTimer);
  tempTimer = setTimeout(() => { tempMood = null; if (S) renderPet(); }, ms);
  renderPet();
}
function petAnim(cls, ms) {
  const el = $('#pet'); el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), ms);
}
function say(t, ms) {
  const b = $('#bubble'); b.textContent = t; b.classList.add('show');
  clearTimeout(sayTimer); sayTimer = setTimeout(() => b.classList.remove('show'), ms || 2800);
}
/* 宠物不在家或在睡觉时，照顾类的操作先不做 */
const gone = () => !!(S.trip || S.runaway);   // 宠物现在不在家（去旅行了，或者离家出走了）
function blocked() {
  if (S.runaway) { toast(S.pet.name + ' 离家出走了，先去把它接回来吧'); return true; }
  if (S.trip) { toast(S.pet.name + ' 出门旅行了，等它回来吧'); return true; }
  if (S.sleeping) { toast('嘘… ' + S.pet.name + ' 正在睡觉，先叫它起床吧'); return true; }
  return false;
}
function petCenter() { const r = $('#pet').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r }; }

let lastPat = 0;
function patPet(e) {
  if (bath || gone() || decor) return;
  if (S.sleeping) { say('呼… 呼…', 1500); return; }
  const now = Date.now(); if (now - lastPat < 450) return; lastPat = now;
  floatFx(icon(pick(['heart', 'heart', 'sparkle'])), e.clientX, e.clientY - 20);
  Sound.sfx[PETS[S.pet.type].fly ? 'chirp' : 'pop']();
  setTempMood('joy', 900);
  addStat('happy', 2); S.counters.pet++;
  if (S.counters.pet % 4 === 1) say(pick(['好舒服呀~', '嘻嘻，好痒！', '最喜欢你啦！', '再摸摸我嘛~']));
  afterAction();
}

const LINES = {
  hunger: ['肚子咕咕叫，想吃东西~', '我饿啦，有好吃的吗？'],
  clean: ['身上脏脏的，想洗澡澡~', '帮我洗个澡好不好？'],
  happy: ['陪我玩一会儿好吗？', '有点无聊，我们去游乐场吧！'],
  energy: ['好困呀，想睡觉了…', '眼睛快睁不开啦…'],
  thirst: ['好渴呀，想喝水~', '嘴巴干干的，有喝的吗？'],
  ok: ['今天也要开开心心！', '和你在一起真好~', '花园里的小苗长高了吗？', '记得多喝水哦！', '好想去远一点的地方看看呀~', '我们是最好的朋友！', '写完作业再来找我玩哦~'],
  parrot: ['你好！你好！', '早上好呀！', '彩虹真漂亮！', '我会说话，厉害吧！']
};
function autoSay() {
  if (S.sleeping || gone() || scene !== 'home' || bath || decor || Games.active) return;
  if (S.sick) { say(pick(ILLS[S.sick.type].lines[S.sick.treated ? 1 : 0])); return; }
  const s = S.stats, keys = ['hunger', 'thirst', 'clean', 'happy', 'energy'];
  const low = keys.filter(k => s[k] < 35).sort((a, b) => s[a] - s[b])[0];
  if (low) { say(pick(LINES[low])); return; }
  if (S.mail.length) { say('信箱里好像有我寄的明信片！'); return; }
  if (S.plots.some(p => p && p.growth < 100 && p.water <= 0)) { say('花园里的小苗口渴啦，快去浇水吧！'); return; }
  if (S.plots.some(p => p && p.growth >= 100)) { say('花园里有东西成熟啦，去看看吧！'); return; }
  let pool = LINES.ok;
  if (S.pet.type === 'parrot') pool = pool.concat(LINES.parrot, S.phrases || []);
  say(pick(pool));
}
/* 在家时自己走走、看看书、喝喝茶 */
const IDLE = { book: '今天看一本图画书~', tea: '喝口茶，歇一会儿~', note: '哼一首小曲儿 ♪' };
function idleAct() {
  if (S.sleeping || gone() || S.sick || bath || decor || scene !== 'home' || Games.active || modalOpen()) return;
  const z = $('#pet-zone'), x = pick([30, 50, 50, 68]), prop = $('#prop');
  if ((z.dataset.x || '50') !== String(x)) { z.dataset.x = x; z.style.left = x + '%'; petAnim('walk', 1800); }
  const act = pick([null, 'book', 'tea', 'note']);
  if (act) {
    prop.innerHTML = icon(act);
    setTimeout(() => { if (S && !gone() && !S.sick && !bath) { prop.classList.add('show'); if (Math.random() < .6) say(IDLE[act]); } }, 1900);
  } else prop.classList.remove('show');
}
function resetIdle() { const z = $('#pet-zone'); z.dataset.x = '50'; z.style.left = '50%'; $('#prop').classList.remove('show'); }

/* ---------- 喂食：吃的、喝的、旅行带回来的特产 ---------- */
const myFoods = () => Object.keys(S.inv).filter(k => S.inv[k] > 0 && FOODS[k] && !FOODS[k].drink);
const myDrinks = () => Object.keys(S.inv).filter(k => S.inv[k] > 0 && FOODS[k] && FOODS[k].drink);
const mySouvs = () => Object.keys(S.souv).filter(k => S.souv[k] > 0 && SOUVS[k]);
const noFoodHTML = '<p class="empty">食物吃光啦！<br>去商店买一些，或者去花园种出来吧~</p><div class="row"><button class="btn small" data-go="shop">去商店</button><button class="btn small green" data-go="garden">去花园</button></div>';
/* 一样东西吃下去的效果，写成一行小字 */
const fxText = it => [it.hunger && '饱饱+' + it.hunger, it.thirst && '水分+' + it.thirst, it.happy && '开心+' + it.happy, it.energy && '精力+' + it.energy].filter(Boolean).join(' ');
let feedTab = 'food';
function openFeed(tab) {
  if (blocked() || bath) return;
  if (typeof tab === 'string') feedTab = tab;
  const fav = PETS[S.pet.type].fav;
  let body = '';
  if (feedTab === 'dish') {
    const ids = myDishes();
    body = ids.length
      ? '<div class="item-grid">' + ids.map(k => itemBtn(`data-dish="${k}"`, DISHES[k].ic, DISHES[k].name, '×' + S.dishes[k])).join('') + '</div>'
      : '<p class="empty">还没有做好的菜。<br>点“煮菜”，用两样食材做一道吧~</p>';
  } else if (feedTab === 'souv') {
    const ids = mySouvs();
    body = ids.length
      ? '<div class="item-grid">' + ids.map(k => itemBtn(`data-souv="${k}"`, SOUVS[k].ic, SOUVS[k].name, '×' + S.souv[k])).join('') + '</div>'
      : '<p class="empty">还没有特产。<br>送它去旅行，回来时会带着当地的特产~</p>';
  } else {
    const ids = feedTab === 'drink' ? myDrinks() : myFoods();
    if (ids.length) body = '<div class="item-grid">' + ids.map(k => itemBtn(`data-food="${k}"`, FOODS[k].ic, FOODS[k].name, '×' + S.inv[k] + (fav === k ? ' 最爱' : ''))).join('') + '</div>';
    else body = feedTab === 'drink'
      ? '<p class="empty">没有喝的了！<br>去商店买点清水或牛奶吧~</p><div class="row"><button class="btn small" data-go="shop">去商店</button></div>'
      : noFoodHTML;
    if (feedTab === 'food' && S.meds.vitamin) body += '<h3>保健</h3><div class="item-grid">' + itemBtn('data-vit="1"', 'vitamin', '维生素软糖', '×' + S.meds.vitamin + ' 防生病') + '</div>';
  }
  const tabs = [['food', '吃的'], ['dish', '饭菜'], ['drink', '喝的'], ['souv', '特产']];
  const m = openModal('<h2>喂点什么好呢？</h2><div class="tabs">' + tabs.map(t => `<button class="tab${feedTab === t[0] ? ' on' : ''}" data-ft="${t[0]}">${t[1]}</button>`).join('') + '</div>' + body);
  m.addEventListener('click', e => {
    const t = e.target.closest('[data-ft]'), b = e.target.closest('[data-food]'), sv = e.target.closest('[data-souv]'), g = e.target.closest('[data-go]');
    if (t) { Sound.sfx.click(); openFeed(t.dataset.ft); return; }
    if (b) { closeModal(); feed(b.dataset.food); }
    if (sv) { closeModal(); feed(sv.dataset.souv, true); }
    const dz = e.target.closest('[data-dish]');
    if (dz) { closeModal(); feed(dz.dataset.dish, 'dish'); }
    if (e.target.closest('[data-vit]')) { closeModal(); takeVitamin(); }
    if (g) { closeModal(); shopTab = feedTab === 'drink' ? 'drink' : 'food'; switchScene(g.dataset.go); }
  });
}
/* 第二个参数：不填是普通食物，true 是特产，'dish' 是自己煮的菜 */
function feed(id, isSouv) {
  const isDish = isSouv === 'dish'; if (isDish) isSouv = false;
  const it = isDish ? DISHES[id] : isSouv ? SOUVS[id] : FOODS[id], stock = isDish ? S.dishes : isSouv ? S.souv : S.inv;
  if (!it || !stock[id]) return;
  if (S.stats[it.drink ? 'thirst' : 'hunger'] >= 96) { say(it.drink ? '喝得饱饱的，喝不下啦~' : '我吃得饱饱的，吃不下啦~'); return; }
  if (it.sweet && S.sick && S.sick.type === 'tummy') { say('肚子疼，现在不能吃甜的…'); return; }
  stock[id]--; $('#prop').classList.remove('show');
  const pc = petCenter(), st = $('#stage').getBoundingClientRect();
  flyIcon(it.ic, st.left + st.width / 2, st.bottom - 10, pc.x, pc.r.top + pc.r.height * .56, () => {
    Sound.sfx[it.drink ? 'water' : 'eat'](); setTempMood('eat', 1300); petAnim('chomp', 1300);
    ['hunger', 'thirst', 'happy', 'energy'].forEach(k => { if (it[k]) addStat(k, it[k]); });
    if (isDish) say(pick(['自己做的' + it.name + '，最好吃啦！', '热乎乎的，好香呀~']));
    else if (isSouv) say(pick(['是旅行带回来的' + it.name + '！真好吃~', '一尝就想起那次旅行啦~']));
    else if (PETS[S.pet.type].fav === id) { addStat('happy', 10); say('哇！是我最爱吃的' + it.name + '！'); }
    else say(it.drink ? pick(['咕嘟咕嘟，真解渴！', '好喝！谢谢你~']) : pick(['啊呜啊呜，真好吃！', '谢谢你，好香呀~', '吃饱饱，长高高！']));
    floatFx(icon(it.drink ? 'water' : 'bowl') + '+' + (it.drink ? it.thirst : it.hunger), pc.x, pc.r.top);
    S.counters.feed++; progress(it.drink ? 'drink' : 'feed'); addExp(isSouv || isDish ? 12 : 8); afterAction();
    if (it.sweet) {   // 甜食连着吃太多会肚子疼：第二份先提醒，第三份才生病
      S.sweet = (S.sweet || 0) + 1;
      if (S.sweet >= 2.6) setTimeout(() => { if (S) getSick('tummy'); }, 1600);
      else if (S.sweet >= 1.6) setTimeout(() => { if (S && !S.sick) say('甜甜的真好吃！不过再吃甜的就要肚子疼啦~', 3600); }, 1600);
    }
  });
}
function takeVitamin() {
  if (S.sick) { say('已经生病了，要吃对症的药才行…'); return; }
  if (!S.meds.vitamin) return;
  S.meds.vitamin--; S.immune = 600; S.risk = { cold: 0, tummy: 0, throat: 0, fever: 0 };
  Sound.sfx.eat(); setTempMood('eat', 1200); petAnim('chomp', 1200);
  say('酸酸甜甜的！接下来 10 分钟我都不会生病~', 3800);
  afterAction();
}

/* ---------- 洗澡 ---------- */
let bath = null;
function startBath() {
  if (blocked() || bath) return;
  if (S.stats.clean >= 95) { say('我已经香喷喷的啦~'); return; }
  resetIdle();
  const layer = $('#bath-layer');
  layer.innerHTML = `<div class="bath-tip">在 ${esc(S.pet.name)} 身上搓一搓，搓出泡泡</div><div class="bath-bar"><i></i></div><button class="bath-x">×</button>`;
  layer.classList.add('on'); $('#pet-zone').classList.add('bathing');
  $('#bubble').classList.remove('show');
  bath = { p: 0, last: 0, n: 0, done: false };
  Sound.sfx.water();
}
function bathMove(e) {
  if (!bath || bath.done) return;
  const now = performance.now(); if (now - bath.last < 45) return;
  const r = $('#pet').getBoundingClientRect();
  if (e.clientX < r.left - 14 || e.clientX > r.right + 14 || e.clientY < r.top - 14 || e.clientY > r.bottom + 14) return;
  bath.last = now;
  const layer = $('#bath-layer'), lr = layer.getBoundingClientRect(), sz = rand(16, 42);
  const b = document.createElement('i'); b.className = 'bub';
  b.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX - lr.left - sz / 2}px;top:${e.clientY - lr.top - sz / 2}px`;
  layer.appendChild(b);
  if (++bath.n % 4 === 0) Sound.sfx.bubble();
  bath.p = Math.min(100, bath.p + 2);
  layer.querySelector('.bath-bar i').style.width = bath.p + '%';
  if (bath.p >= 100) finishBath();
}
function finishBath() {
  bath.done = true;
  const layer = $('#bath-layer'), lr = layer.getBoundingClientRect(), r = $('#pet').getBoundingClientRect();
  layer.querySelector('.bath-tip').textContent = '哗啦啦~ 冲干净';
  layer.classList.add('rinse'); Sound.sfx.water();
  $$('.bub', layer).forEach(b => { b.style.animationDelay = (Math.random() * .4) + 's'; });
  for (let i = 0; i < 16; i++) {
    const d = document.createElement('i'); d.className = 'drop';
    d.style.left = (r.left - lr.left + Math.random() * r.width) + 'px';
    d.style.top = (r.top - lr.top - 20) + 'px';
    d.style.animationDelay = (Math.random() * .45) + 's';
    layer.appendChild(d);
  }
  setTimeout(() => {
    if (!bath) return;
    endBath();
    S.stats.clean = 100; addStat('happy', 8);
    S.counters.bath++; progress('bath'); addExp(12);
    const pc = petCenter();
    for (let i = 0; i < 5; i++) setTimeout(() => floatFx(icon('sparkle'), pc.r.left + Math.random() * pc.r.width, pc.r.top + Math.random() * pc.r.height * .7), i * 120);
    Sound.sfx.ok(); setTempMood('joy', 1500); say('洗白白，香喷喷！谢谢你~');
    afterAction();
  }, 1300);
}
function endBath() {
  bath = null;
  const layer = $('#bath-layer'); layer.classList.remove('on', 'rinse'); layer.innerHTML = '';
  $('#pet-zone').classList.remove('bathing');
}

/* ---------- 睡觉 ---------- */
function toggleSleep() {
  if (bath) return;
  if (gone()) { blocked(); return; }
  if (!S.sleeping) {
    if (S.stats.energy >= 92 && !S.sick) { say('我现在精神满满，还不想睡~'); return; }
    S.sleeping = true; resetIdle(); say('晚安…', 2000);
  } else { S.sleeping = false; setTimeout(() => say('睡得真香！你好呀~'), 300); }
  Sound.sfx.click();
  renderPet(true); updateActions(); playSceneMusic(); save();
}
function updateActions() {
  const set = (act, ic, label) => { const b = $(`.act[data-act=${act}]`); b.querySelector('i').innerHTML = icon(ic); b.querySelector('em').textContent = label; };
  set('sleep', S.sleeping ? 'sun' : 'moon', S.sleeping ? '起床' : '睡觉');
  const p = PETS[S.pet.type];
  if (S.sick && !gone()) set('talent', 'med', '吃药'); else set('talent', p.talentIcon, p.talent);
  set('travel', S.trip ? 'mapic' : 'backpack', S.trip ? '看地图' : '旅行');
  set('decor', 'sofa', decor ? '摆好了' : '布置');
  $$('.act').forEach(b => b.classList.toggle('off', b.dataset.act === 'decor' ? false : !!decor || (gone() && !(S.trip && b.dataset.act === 'travel'))));
}

/* ---------- 才艺（小鸟唱歌 / 鹦鹉学说话 / 其他宠物表演） ---------- */
function talent() {
  if (blocked() || bath) return;
  if (S.stats.energy < 5) { say('好累呀，想先睡一觉…'); return; }
  const type = S.pet.type;
  if (type === 'parrot') { openParrotTalk(); return; }
  $('#prop').classList.remove('show');
  S.stats.energy = clamp(S.stats.energy - 3, 0, 100); addStat('happy', 8); addExp(4);
  if (type === 'bird') birdSing();
  else {
    petAnim({ cat: 'trick-roll', dog: 'trick-spin', rabbit: 'trick-jump', hamster: 'trick-flip' }[type], 1300);
    setTempMood('joy', 1400); Sound.sfx.ok();
    say(pick(['看我的！', '厉害吧？嘿嘿~', '当当当当~ 表演完毕！']));
  }
  afterAction();
}
function birdSing() {
  petAnim('flap', 1600); setTempMood('eat', 1700); say('啾啾~ 啾啾啾~ ♪', 2400);
  const notes = [1047, 1175, 1319, 1568, 1760, 2093], pc = petCenter();
  for (let i = 0; i < 8; i++) setTimeout(() => {
    Sound.beep(pick(notes), .2, 'sine', .2);
    floatFx(icon('note'), pc.r.left + pc.r.width * (.2 + Math.random() * .6), pc.r.top + pc.r.height * .2);
  }, i * 200);
}
function openParrotTalk() {
  const chips = (S.phrases || []).map(p => `<button class="chip" data-say="${esc(p)}">${esc(p)}</button>`).join('');
  const m = openModal(`<h2>教 ${esc(S.pet.name)} 说话</h2><p>写一句话，它会学着说给你听哦</p>
    <input id="say-input" class="text-input" maxlength="16" placeholder="比如：你好呀" autocomplete="off">
    <div class="row"><button class="btn" id="say-go">教它说</button></div>
    ${chips ? '<p class="hint">已经学会的话（点一下再说一遍）</p><div class="chips">' + chips + '</div>' : ''}`);
  const go = t => {
    t = (t || '').trim().slice(0, 16);
    if (!t) { toast('先写一句话吧~'); return; }
    closeModal(); parrotSay(t);
  };
  $('#say-go', m).onclick = () => go($('#say-input', m).value);
  $('#say-input', m).onkeydown = e => { if (e.key === 'Enter') go(e.target.value); };
  m.addEventListener('click', e => { const c = e.target.closest('[data-say]'); if (c) go(c.dataset.say); });
}
function parrotSay(t) {
  S.stats.energy = clamp(S.stats.energy - 3, 0, 100); addStat('happy', 8); addExp(4);
  S.phrases = [t].concat((S.phrases || []).filter(p => p !== t)).slice(0, 6);
  $('#prop').classList.remove('show');
  petAnim('flap', 1600); setTempMood('eat', 1800); Sound.sfx.chirp();
  say('「' + t + '」！' + t + '~', 3600);
  try {
    if (S.soundOn && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(t);
      u.lang = 'zh-CN'; u.pitch = 1.9; u.rate = 1.15;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    }
  } catch (e) { }
  afterAction();
}

/* ---------- 生病、照顾和离家出走 ----------
 * 1. 某项状态太低 → 先出现症状，画面上方提示“再不处理，多久后会生病”
 * 2. SICK_AFTER 秒不处理 → 生病。生病时不能旅行、表演和玩小游戏
 * 3. 吃对症的药 + 休息 → 康复；万能药水可以马上治好
 * 4. 生病后 RUNAWAY_AFTER 秒一直不吃药（关掉游戏的时间也算）→ 离家出走，
 *    要带着药和它最爱的食物去接，接回来病就好了 */
const NO_RISK = () => ({ cold: 0, tummy: 0, throat: 0, fever: 0 });
/* 把秒数写成“2 分 30 秒”，按 5 秒取整，免得数字跳得太快 */
function fmtLeft(s) {
  s = Math.max(5, Math.ceil(s / 5) * 5);
  const m = Math.floor(s / 60), r = s % 60;
  return (m ? m + ' 分' : '') + (r ? (m ? ' ' : '') + r + ' 秒' : (m ? '钟' : ''));
}
/* 现在有没有“快要生病”的症状：有的话返回最紧急的那一种 */
function symptom() {
  if (!S || S.sick || gone() || S.immune > 0) return null;
  let best = null;
  for (const t in ILLS) {
    const ill = ILLS[t];
    if (S.stats[ill.stat] < ill.below) { const left = SICK_AFTER - (S.risk[t] || 0); if (!best || left < best.left) best = { type: t, left }; }
  }
  return best;
}
/* 画面上方的提醒条：症状、生病、离家出走三种情况都在这里说清楚还剩多久、该怎么办 */
function renderAlert() {
  const el = $('#alert'), name = esc(S.pet.name);
  let html = '', bad = false;
  if (S.runaway) { bad = true; html = `<b>${name} 离家出走了</b><span>带上药和它最爱吃的，去接它回家</span><button data-al="fetch">去接它</button>`; }
  else if (S.sick && !S.trip) {
    const k = S.sick, ill = ILLS[k.type]; bad = true;
    if (k.treated) html = `<b>${name} ${ill.name}</b><span>已经吃过药了，${ill.rest === 'sleep' ? '让它睡一觉就会好' : '再休息一会儿就会好'}</span>` + (ill.rest === 'sleep' && !S.sleeping ? '<button data-al="sleep">去睡觉</button>' : '');
    else html = `<b>${name} ${ill.name}</b><span>再不吃药，${fmtLeft(RUNAWAY_AFTER - k.age)}后它会离家出走</span><button data-al="med">去治疗</button>`;
  } else {
    const sy = symptom();
    if (sy) { const ill = ILLS[sy.type]; html = `<b>${name} ${ill.symptom}</b><span>${ill.cause}，再不${ill.fix}，${fmtLeft(sy.left)}后会${ill.short}</span><button data-al="${ill.act}">去${ill.fix}</button>`; }
  }
  if (bath || Games.active) html = '';   // 洗澡和玩小游戏时先不打扰
  if (el.dataset.h === html) return;
  el.dataset.h = html; el.innerHTML = html;
  el.classList.toggle('on', !!html); el.classList.toggle('bad', bad);
}
function alertAction(act) {
  Sound.sfx.click();
  if (act === 'fetch') { openFetch(); return; }
  if (scene !== 'home') switchScene('home');
  if (act === 'bath') startBath();
  else if (act === 'feed') openFeed('food');
  else if (act === 'drink') openFeed('drink');
  else if (act === 'sleep') { if (!S.sleeping) toggleSleep(); }
  else if (act === 'med') openMeds();
}

function getSick(type) {
  if (!S || S.sick || gone() || S.immune > 0) return;
  S.sick = { type, treated: false, rest: 0, age: 0 };
  S.risk = NO_RISK(); S.sweet = 0;
  resetIdle(); renderPet(true); updateActions(); updateHUD(); renderAlert(); Sound.sfx.bad();
  say(ILLS[type].say, 4000);
  if (!Games.active && !modalOpen()) showSickHelp(); else toast(S.pet.name + ' ' + ILLS[type].name);
  save();
}
function showSickHelp() {
  const ill = ILLS[S.sick.type], med = MEDS[ill.med];
  const m = openModal(`<div class="hero">${petSVG(S.pet.type, S.sick.type, S.wear)}</div><h2>${esc(S.pet.name)} ${ill.name}</h2>
    <p>别担心，${ill.how}。<br>${med.name}可以在商店买${Object.keys(SEEDS).some(s => SEEDS[s].med === ill.med) ? '，也可以在花园里种' : ''}。</p>
    <p class="hint">要是 ${fmtLeft(RUNAWAY_AFTER)}内一直不给它吃药，它会难过得离家出走。</p>
    <div class="row"><button class="btn" id="sick-go">去照顾它</button></div>`);
  $('#sick-go', m).onclick = () => { closeModal(); if (scene !== 'home') switchScene('home'); openMeds(); };
}
function openMeds() {
  if (!S.sick || gone() || bath) return;
  const k = S.sick, ill = ILLS[k.type], key = ill.med, med = MEDS[key], n = S.meds[key] || 0, pn = S.meds.panacea || 0;
  if (k.treated) { toast(ill.rest === 'sleep' ? '已经吃过药啦，让它睡一觉吧' : '已经吃过药啦，让它休息一会儿'); return; }
  if (S.sleeping) { toast('它睡着了，先叫醒再吃药吧'); return; }
  let html = `<h2>${esc(S.pet.name)} ${ill.name}</h2><p>${ill.how}。</p>`;
  if (n || pn) html += '<div class="item-grid">' + (n ? itemBtn(`data-med="${key}"`, med.ic, med.name, '×' + n) : '') + (pn ? itemBtn('data-med="panacea"', 'panacea', '万能药水', '×' + pn + ' 马上好') : '') + '</div>';
  else html += `<p class="empty">家里没有${med.name}了。</p><div class="row"><button class="btn small" data-go="shop">去商店买</button>` +
    (Object.keys(SEEDS).some(s => SEEDS[s].med === key) ? '<button class="btn small green" data-go="garden">去花园种</button>' : '') + '</div>';
  const m = openModal(html);
  m.addEventListener('click', e => {
    const g = e.target.closest('[data-go]'), b = e.target.closest('[data-med]');
    if (g) { closeModal(); shopTab = g.dataset.go === 'shop' ? 'med' : shopTab; switchScene(g.dataset.go); }
    if (b) { closeModal(); giveMed(b.dataset.med); }
  });
}
function giveMed(key) {
  const k = S.sick; if (!k || k.treated || !S.meds[key]) return;
  const ill = ILLS[k.type], all = key === 'panacea';
  if (!all && key !== ill.med) return;
  S.meds[key]--;
  if (!all) { k.treated = true; k.rest = 0; }
  const pc = petCenter(), st = $('#stage').getBoundingClientRect();
  flyIcon(MEDS[key].ic, st.left + st.width / 2, st.bottom - 10, pc.x, pc.r.top + pc.r.height * .56, () => {
    Sound.sfx.eat(); setTempMood('eat', 1300); petAnim('chomp', 1300);
    if (all) { setTimeout(() => { if (S && S.sick) cure(); }, 1300); return; }
    say(ill.rest === 'sleep' ? '舒服一点了… 我想睡一觉' : '舒服一点了，让我歇一会儿', 3600);
    renderAlert();
  });
  save();
}
function cure() {
  S.sick = null; S.immune = 240; S.counters.cure = (S.counters.cure || 0) + 1;
  addStat('happy', 15);
  renderPet(true); updateActions(); updateHUD(); renderAlert(); playSceneMusic();
  Sound.sfx.level(); confetti(); banner(S.pet.name + ' 好起来啦');
  say('我好啦！谢谢你照顾我~', 3800);
  addExp(10); afterAction();
}

/* 离家出走：不是永远离开，带上药和它最爱的食物就能接回来 */
function runAway() {
  const k = S.sick; if (!k || gone()) return;
  if (bath) endBath();
  S.runaway = { type: k.type, since: Date.now() };
  S.sick = null; S.sleeping = false;
  resetIdle(); renderAway(); renderPet(true); updateActions(); updateHUD(); renderAlert(); playSceneMusic(); Sound.sfx.bad();
  if (!Games.active && !modalOpen()) showRunawayHelp(); else toast(S.pet.name + ' 离家出走了…', 3600);
  save();
}
function showRunawayHelp() {
  const ill = ILLS[S.runaway.type], fav = FOODS[PETS[S.pet.type].fav];
  const m = openModal(`<div class="hero">${icon('mail')}</div><h2>${esc(S.pet.name)} 离家出走了</h2>
    <p>它${ill.short}太久，一直没有吃到药，<br>难过地去了刺猬栗子家。</p>
    <p>带上<b>${MEDS[ill.med].name}</b>（或万能药水）和它最爱的<b>${fav.name}</b>去接它，它就会回家。</p>
    <div class="row"><button class="btn" id="ra-go">去接它回家</button></div>`);
  $('#ra-go', m).onclick = () => { closeModal(); openFetch(); };
}
function openFetch() {
  const r = S.runaway; if (!r) return;
  const ill = ILLS[r.type], favId = PETS[S.pet.type].fav, fav = FOODS[favId];
  const medKey = S.meds[ill.med] ? ill.med : (S.meds.panacea ? 'panacea' : null), hasFood = (S.inv[favId] || 0) > 0;
  const row = (ic, name, ok) => `<div class="need${ok ? ' ok' : ''}">${icon(ic)}<b>${name}</b><span>${ok ? '准备好了' : '还没有'}</span></div>`;
  let html = `<h2>去接 ${esc(S.pet.name)} 回家</h2><p>它在刺猬栗子家等你。要带上这两样：</p>` +
    row(MEDS[medKey || ill.med].ic, medKey === 'panacea' ? '万能药水' : MEDS[ill.med].name + '（或万能药水）', !!medKey) + row(fav.ic, '它最爱的' + fav.name, hasFood);
  if (medKey && hasFood) html += '<div class="row"><button class="btn big green" id="fetch-go">出发</button></div>';
  else html += '<div class="row">' + (medKey ? '' : '<button class="btn small" data-shop="med">去买药</button>') + (hasFood ? '' : '<button class="btn small" data-shop="food">去买吃的</button>') + '</div>';
  const m = openModal(html);
  m.addEventListener('click', e => {
    const s = e.target.closest('[data-shop]');
    if (s) { closeModal(); shopTab = s.dataset.shop; switchScene('shop'); }
    if (e.target.closest('#fetch-go')) { closeModal(); fetchBack(medKey, favId); }
  });
}
function fetchBack(medKey, favId) {
  if (!S.runaway || !S.meds[medKey] || !S.inv[favId]) return;
  S.meds[medKey]--; S.inv[favId]--;
  S.runaway = null; S.immune = 240; S.risk = NO_RISK();
  const st = S.stats, floor = { hunger: 50, thirst: 50, clean: 45, energy: 50, happy: 45 };
  for (const k in floor) st[k] = Math.max(st[k], floor[k]);
  if (scene !== 'home') switchScene('home');
  renderAway(); resetIdle(); renderPet(true); updateActions(); updateHUD(); renderAlert(); playSceneMusic();
  Sound.sfx.trip(); confetti(); setTempMood('joy', 2500);
  openModal(`<div class="hero">${petSVG(S.pet.type, 'joy', S.wear)}</div><h2>${esc(S.pet.name)} 回家啦</h2>
    <p>它吃了药，又吃到了最爱的东西，病已经好了。</p>
    <div class="row"><button class="btn" data-close>欢迎回家</button></div>`,
    { onClose: () => say('对不起，让你担心了… 下次我不舒服，要早点给我吃药哦', 4200) });
  addExp(5); afterAction();
}

let symNow = null, symFx = 0;
function tickSick(dt) {
  if (gone()) { renderAlert(); return; }
  S.immune = Math.max(0, (S.immune || 0) - dt);
  S.sweet = Math.max(0, (S.sweet || 0) - dt / 120);   // 两分钟消化掉一份甜食
  const k = S.sick, st = S.stats;
  if (!k) {
    if (!Games.active && S.immune <= 0) {
      for (const t in ILLS) { const ill = ILLS[t]; S.risk[t] = st[ill.stat] < ill.below ? (S.risk[t] || 0) + dt : Math.max(0, (S.risk[t] || 0) - dt * 2); }
      const due = Object.keys(ILLS).filter(t => S.risk[t] >= SICK_AFTER)[0];
      if (due) { symNow = null; getSick(due); renderAlert(); return; }
    }
    const sy = symptom();
    if (sy && sy.type !== symNow && !Games.active) { const ill = ILLS[sy.type]; toast(S.pet.name + ' ' + ill.symptom + '：' + ill.cause + '，快' + ill.fix + '吧', 3800); Sound.sfx.pop(); }
    symNow = sy ? sy.type : null;
    if (sy && scene === 'home' && !S.sleeping && !bath && !modalOpen() && (symFx += dt) >= 6) {
      symFx = 0; const pc = petCenter(); floatFx(ILLS[sy.type].fx, pc.x, pc.r.top + 10);
    }
  } else {
    k.age += dt;
    if (k.treated) {
      if (ILLS[k.type].rest === 'sleep') { if (S.sleeping) k.rest += dt; if (k.rest >= 20) { S.sleeping = false; cure(); } }
      else { if (!Games.active) k.rest += dt; if (k.rest >= 30) cure(); }
    } else if (k.age >= RUNAWAY_AFTER) runAway();
  }
  if (S) renderAlert();
}

/* ---------- 装扮 ---------- */
function openWardrobe() {
  if (blocked() || bath) return;
  let html = '<h2>今天戴什么呢？</h2>';
  if (!S.owned.length) html += '<p class="empty">还没有装饰品哦~<br>去商店挑一件漂亮的吧</p><div class="row"><button class="btn small" data-go="shop">去商店</button></div>';
  else html += '<div class="item-grid">' + `<button class="item${!S.wear ? ' sel' : ''}" data-wear=""><b style="line-height:44px">不戴</b></button>` +
    S.owned.map(k => itemBtn(`data-wear="${k}"`, WEARS[k].ic, WEARS[k].name, '', S.wear === k)).join('') + '</div>';
  const m = openModal(html);
  m.addEventListener('click', e => {
    const b = e.target.closest('[data-wear]'), g = e.target.closest('[data-go]');
    if (g) { closeModal(); shopTab = 'wear'; switchScene('shop'); }
    if (b) {
      S.wear = b.dataset.wear || null; closeModal(); renderPet(true); renderWall();
      if (S.wear) { petAnim('trick-jump', 1200); Sound.sfx.ok(); say('好看吗？'); }
      save();
    }
  });
}

/* ---------- 旅行：准备行囊 → 出发 → 寄明信片 → 带特产回家 ---------- */
const tripLeft = () => S.trip ? Math.max(0, S.trip.dur - (Date.now() - S.trip.start) / 1000 * SPEED) : 0;
const leftText = () => { const s = tripLeft(); return s < 60 ? '不到 1 分钟就回来' : '大约 ' + Math.ceil(s / 60) + ' 分钟后回来'; };
const travelWear = () => S.wear || (S.gear.strawhat ? 'strawhat' : null);
function pcHTML(id, cls) {
  const p = id.split(':');
  return `<span class="pc${p[1] === 'b' ? ' rare' : ''}${cls ? ' ' + cls : ''}" data-card="${id}"><span class="img">${postcardSVG(id, S.pet.type, travelWear())}</span><span class="cap">${DESTS[p[0]].name}</span></span>`;
}
function openPack() {
  if (bath) return;
  if (S.trip) { openMap(); return; }
  if (blocked()) return;
  if (S.sick) { say('生病了不能出门，先把病养好吧…'); return; }
  if (S.stats.hunger < 40) { say('肚子还饿着呢，吃饱了再出发吧~'); return; }
  if (S.stats.energy < 35) { say('有点困，睡一觉再去旅行吧~'); return; }
  if (S.stats.thirst < 30) { say('好渴呀，先喝点水再出发吧~'); return; }
  const foods = myFoods(), fav = PETS[S.pet.type].fav;
  if (!foods.length && !myMeals().length) {
    const m0 = openModal('<h2>准备行囊</h2><p class="empty">出门要带便当，可是家里没有吃的了。</p>' + noFoodHTML.replace(/^<p.*?<\/p>/, ''));
    m0.addEventListener('click', e => { const g = e.target.closest('[data-go]'); if (g) { closeModal(); shopTab = 'food'; switchScene(g.dataset.go); } });
    return;
  }
  const tools = Object.keys(GEAR).filter(k => !GEAR[k].once && S.gear[k]);
  const drinks = myDrinks();
  const sel = { food: null, drink: null, tool: null, bell: false, car: null };
  let html = `<h2>准备行囊</h2><p>带上便当，${esc(S.pet.name)} 会自己去远方走走，<br>路上还会寄明信片回来。</p><h3>便当（选一样）</h3><div class="item-grid">` +
    foods.map(k => itemBtn(`data-pf="${k}"`, FOODS[k].ic, FOODS[k].name, '×' + S.inv[k] + (fav === k ? ' 最爱' : ''))).join('') +
    myMeals().map(k => itemBtn(`data-pf="dish:${k}"`, DISHES[k].ic, DISHES[k].name, '×' + S.dishes[k] + ' 亲手做')).join('') + '</div>' +
    (drinks.length ? '<h3>水壶（可以不带，带了回来不口渴）</h3><div class="item-grid">' + drinks.map(k => itemBtn(`data-pd="${k}"`, FOODS[k].ic, FOODS[k].name, '×' + S.inv[k])).join('') + '</div>' : '') +
    '<h3>旅行用品（可以不带）</h3>';
  if (!tools.length && !S.gear.bell) html += '<p class="hint" style="margin-top:0">商店的“旅行用品”里有草帽、雨伞、小木船、热气球、小火箭……<br>带上它们能去更远的地方。</p>';
  else html += '<div class="item-grid">' + tools.map(k => itemBtn(`data-pt="${k}"`, GEAR[k].ic, GEAR[k].name, GEAR[k].desc)).join('') +
    (S.gear.bell ? itemBtn('data-pb="1"', 'bell', '幸运铃铛', '×' + S.gear.bell) : '') + '</div>';
  const cars = myCars();
  if (cars.length) {   // 有车就默认开最快的那辆，点一下可以不开
    sel.car = cars.slice().sort((a, b) => FURNS[b].car - FURNS[a].car)[0];
    html += '<h3>开车去（路上更快，点一下可以不开）</h3><div class="item-grid">' + cars.map(k => itemBtn(`data-pc="${k}"`, FURNS[k].ic, FURNS[k].name, FURNS[k].tip, k === sel.car)).join('') + '</div>';
  }
  html += '<div class="row"><button class="btn big green" id="go-trip">出发</button></div>';
  const m = openModal(html);
  m.addEventListener('click', e => {
    const f = e.target.closest('[data-pf]'), t = e.target.closest('[data-pt]'), b = e.target.closest('[data-pb]'), d = e.target.closest('[data-pd]');
    const c = e.target.closest('[data-pc]');
    if (c) { sel.car = sel.car === c.dataset.pc ? null : c.dataset.pc; $$('[data-pc]', m).forEach(x => x.classList.toggle('sel', x.dataset.pc === sel.car)); Sound.sfx.pop(); }
    if (d) { sel.drink = sel.drink === d.dataset.pd ? null : d.dataset.pd; $$('[data-pd]', m).forEach(x => x.classList.toggle('sel', x.dataset.pd === sel.drink)); Sound.sfx.pop(); }
    if (f) { sel.food = f.dataset.pf; $$('[data-pf]', m).forEach(x => x.classList.toggle('sel', x === f)); Sound.sfx.pop(); }
    if (t) { sel.tool = sel.tool === t.dataset.pt ? null : t.dataset.pt; $$('[data-pt]', m).forEach(x => x.classList.toggle('sel', x.dataset.pt === sel.tool)); Sound.sfx.pop(); }
    if (b) { sel.bell = !sel.bell; b.classList.toggle('sel', sel.bell); Sound.sfx.pop(); }
    if (e.target.closest('#go-trip')) {
      if (!sel.food) { toast('先选一样便当吧'); return; }
      closeModal(); startTrip(sel);
    }
  });
}
function startTrip(sel) {
  const dishBento = sel.food.indexOf('dish:') === 0 ? sel.food.slice(5) : null;   // 便当也可以带自己煮的菜
  if (dishBento) S.dishes[dishBento]--; else S.inv[sel.food]--;
  if (sel.bell) S.gear.bell--;
  if (sel.drink) S.inv[sel.drink]--;
  const isFav = !!dishBento || PETS[S.pet.type].fav === sel.food;   // 亲手做的菜和最爱的食物一样好：一定带回特产
  const to = sel.tool && GEAR[sel.tool].to;   // 带了能去远方的用品，四次里有三次会去那里
  const car = sel.car && FURNS[sel.car] && FURNS[sel.car].car ? sel.car : null, v = car ? FURNS[car].car : 1;
  const dest = to && Math.random() < .75 ? pick(to) : car && Math.random() < .45 ? pick(CAR_DESTS) : pick(BASE_DESTS);
  const rareP = .15 + (sel.bell ? .3 : 0) + (isFav ? .1 : 0) + (sel.food === 'cake' ? .1 : 0);
  const rare = Math.random() < rareP;
  S.trip = {
    dest, start: Date.now(), dur: Math.round(DESTS[dest].time * (.16 + .84 / v)), a: .42 / (.16 * v + .84), car,
    card: dest + (rare ? ':b' : ':a'),
    extra: Math.random() < (rare ? .5 : .2) + (sel.tool === 'camera' ? .4 : 0) ? dest + (rare ? ':a' : ':b') : null,
    souv: isFav || Math.random() < .7 ? DESTS[dest].souv : null,
    coins: rand(8, 20), mailed: false, drink: !!sel.drink
  };
  progress('trip'); resetIdle();
  Sound.sfx.trip(); setTempMood('joy', 1500); say(car ? '坐稳啦，开车出发！等我的明信片哦~' : '我出发啦！等我的明信片哦~', 1800);
  setTimeout(() => { if (S && S.trip) { renderAway(); renderFurn(); updateActions(); toast(S.pet.name + (S.trip.car ? ' 开着' + FURNS[S.trip.car].name + '出门了' : ' 背着小包出门了')); } }, 1700);
  save();
}
function renderAway() {
  const away = gone();
  $('#pet-zone').classList.toggle('gone', away);
  $('#pet-garden').style.visibility = away ? 'hidden' : '';
  const note = $('#away-note');
  note.classList.toggle('on', away);
  if (S.runaway) note.innerHTML = `<b>我去栗子家住几天…</b><small>生病了一直没吃到药，有点难过</small><div class="sign">—— ${esc(S.pet.name)}</div><div class="row"><button class="btn small" data-fetch="1">去接它回家</button></div>`;
  else if (away) note.innerHTML = `<b>我${S.trip.car && FURNS[S.trip.car] ? '开着' + FURNS[S.trip.car].name : ''}去旅行啦</b><small id="away-left">${leftText()}</small><div class="sign">—— ${esc(S.pet.name)}</div><div class="row"><button class="btn small" data-map="1">看看它在哪</button></div>`;
}
function addCard(id) {
  const isNew = !S.cards[id];
  S.cards[id] = (S.cards[id] || 0) + 1;
  if (isNew) { S.cardLog.push(id); S.albumNew = true; } else S.coins += 5;
  return isNew;
}
function tickTrip() {
  const t = S.trip; if (!t) return;
  const el = (Date.now() - t.start) / 1000 * SPEED;
  if (!t.mailed && el >= t.dur * .5) {
    t.mailed = true; S.mail.push(t.card);
    Sound.sfx.mail(); if (!Games.active) toast('叮咚~ 信箱里有一张新明信片');
    renderMailbox(); updateDots(); save();
  }
  if (el >= t.dur) { if (!Games.active && !modalOpen()) finishTrip(); }
  else { const a = $('#away-left'); if (a) a.textContent = leftText(); updateMap(); }
}
function finishTrip() {
  const t = S.trip, st = S.stats, d = DESTS[t.dest];
  const chilly = (t.dest === 'snow' || t.dest === 'camp' || t.dest === 'penguin') && !S.immune && Math.random() < .2;   // 去冷的地方，偶尔会着凉
  if (!t.mailed) S.mail.push(t.card);
  S.trip = null;
  st.hunger = Math.max(30, st.hunger - 25); st.clean = Math.max(28, st.clean - 32);
  st.energy = Math.max(30, st.energy - 25); st.happy = Math.min(100, st.happy + 30);
  if (!t.drink) st.thirst = Math.max(30, st.thirst - 25);   // 带了水壶就不会口渴
  S.coins += t.coins;
  let gifts = `<span>${acorns('+' + t.coins)}</span>`;
  if (t.souv) {
    const sv = SOUVS[t.souv], isNew = !S.souvSeen[t.souv];
    S.souv[t.souv] = (S.souv[t.souv] || 0) + 1; S.souvSeen[t.souv] = 1; if (isNew) S.albumNew = true;
    gifts += `<span>${icon(sv.ic)}${sv.name}${isNew ? '<i class="new-tag">新</i>' : ''}</span>`;
  }
  let extra = '';
  if (t.extra) { const isNew = addCard(t.extra); extra = pcHTML(t.extra, 'big') + (isNew ? '' : '<p class="hint">这张已经有了，换成了 5 颗橡果</p>'); }
  S.counters.trip++;
  renderAway(); resetIdle(); renderPet(true); updateActions(); renderMailbox(); renderWall(); updateDots();
  if (scene === 'album' && albumTab === 'map') renderAlbum();
  Sound.sfx.trip(); confetti(); setTempMood('joy', 2500);
  openModal(`<div class="hero">${petSVG(S.pet.type, 'joy', travelWear())}</div><h2>${esc(S.pet.name)} 回来啦</h2>
    <p>它去了「${d.name}」，给你带回了：</p><div class="gift-list">${gifts}</div>${extra}
    ${t.souv ? '<p class="hint">特产可以在“喂食”的“特产”里吃掉</p>' : ''}
    ${S.mail.length ? '<p class="hint">花园的信箱里还有它寄来的明信片，记得去看看</p>' : ''}
    <div class="row"><button class="btn" data-close>欢迎回家</button></div>`,
    { onClose: () => { if (chilly) getSick('cold'); else say(pick(['外面真好玩！不过我有点饿了…', '走了好远的路，想洗个澡~', '下次还想去更远的地方！'])); } });
  addExp(20); afterAction();
}
function renderMailbox() {
  const el = $('#mailbox'); el.innerHTML = mailboxSVG(S.mail.length > 0); el.classList.toggle('has', S.mail.length > 0);
}
function openMailbox() {
  if (!S.mail.length) { toast(S.trip ? '信箱还是空的，明信片在路上了' : '信箱空空的，送' + S.pet.name + '去旅行才会有明信片'); return; }
  const id = S.mail.shift(), isNew = addCard(id), rare = id.split(':')[1] === 'b';
  Sound.sfx.page(); renderMailbox(); renderWall(); updateDots();
  const m = openModal(`<h2>${esc(S.pet.name)} 寄来的明信片</h2>${pcHTML(id, 'big')}
    <p>${rare ? '是很难遇见的珍贵风景！<br>' : ''}${isNew ? '已经收进旅行手帐啦' : '这张已经有了，换成了 5 颗橡果'}</p>
    <div class="row"><button class="btn" data-close>收好</button><button class="btn plain" id="to-album">去手帐看看</button></div>`);
  $('#to-album', m).onclick = () => { closeModal(); switchScene('album'); };
  afterAction();
}
/* ---------- 小车和旅行地图 ---------- */
const myCars = () => S.furn.own.filter(id => FURNS[id] && FURNS[id].car);
const beenTo = d => !!(S.cards[d + ':a'] || S.cards[d + ':b'] || S.souvSeen[DESTS[d].souv]);
/* 新买的车直接停到一楼；第一次买车送一块停车位 */
function parkCar(id) {
  if (!S.furn.own.includes('parkmat')) {
    S.furn.own.push('parkmat');
    const m = { id: 'parkmat', f: 1, x: 170, y: 496 }; clampFurn(m); S.furn.put.push(m);
  }
  const mat = S.furn.put.find(p => p.id === 'parkmat' && p.f === 1);
  const p = { id, f: 1, x: (mat ? mat.x : 170) + 36 * (myCars().length - 1), y: mat ? mat.y - 14 : 480 };
  clampFurn(p); S.furn.put.push(p);
  renderFurn();
}
/* 旅行走到哪一步了：去的路上（go）、在那里玩（stay）、回家的路上（back）；u 是在路上的位置，0 是家，1 是目的地 */
function tripStage() {
  const t = S.trip, f = clamp((Date.now() - t.start) / 1000 * SPEED / t.dur, 0, 1), a = t.a || .42;
  return f < a ? { at: 'go', u: f / a } : f <= 1 - a ? { at: 'stay', u: 1 } : { at: 'back', u: (1 - f) / a };
}
function mapHTML() {
  const n = Object.keys(DESTS).filter(beenTo).length;
  return `<p class="map-say"></p><div class="mapbox"><div class="mapin">${mapSVG(beenTo, S.trip ? S.trip.dest : null, !!S.runaway)}</div></div>` +
    `<p class="album-note" style="margin:8px 0 0">去过的地方会亮起来 · 已经去过 ${n} / ${Object.keys(DESTS).length} 个地方</p>`;
}
/* 把地图上的宠物挪到它现在的位置（页面上有几张地图就挪几张）；center 表示顺便把地图滚到它那里 */
function updateMap(center) {
  const pets = $$('.map-pet'); if (!pets.length || !S) return;
  let pos = MAP_HOME, text = S.pet.name + ' 在家里', d = '', car = null;
  if (S.runaway) { pos = MAP_FRIEND; text = S.pet.name + ' 在栗子家，等你去接它'; }
  else if (S.trip && MAP_AT[S.trip.dest]) {
    const t = S.trip, st = tripStage(), r = mapRoute(MAP_AT[t.dest]), name = DESTS[t.dest].name;
    pos = r.at(st.u); d = r.d; car = t.car && FURNS[t.car] ? FURNS[t.car] : null;
    text = st.at === 'go' ? `${S.pet.name} ${car ? '开着' + car.name : '背着小包'}，正在去「${name}」的路上`
      : st.at === 'stay' ? `${S.pet.name} 正在「${name}」玩` : `${S.pet.name} 正在回家的路上，${leftText()}`;
  }
  const wear = gone() ? travelWear() : S.wear, sig = S.pet.type + '|' + (wear || '') + '|' + (car ? car.ic : '');
  pets.forEach(g => {
    const fresh = g.dataset.sig !== sig;
    if (fresh) { g.dataset.sig = sig; g.innerHTML = mapPetSVG(S.pet.type, wear, car && car.ic); }
    g.style.transition = fresh || center ? 'none' : '';
    g.style.transform = `translate(${pos[0].toFixed(1)}px, ${(pos[1] - 8).toFixed(1)}px)`;
  });
  $$('.map-route').forEach(p => p.setAttribute('d', d));
  $$('.map-say').forEach(p => { p.textContent = text; });
  if (center) $$('.mapbox').forEach(b => {
    const w = b.firstChild.clientWidth, h = b.firstChild.clientHeight;
    b.scrollLeft = pos[0] / 800 * w - b.clientWidth / 2; b.scrollTop = pos[1] / 520 * h - b.clientHeight / 2;
  });
}
function openMap() {
  Sound.sfx.page();
  openModal('<h2>旅行地图</h2>' + mapHTML(), { wide: true });
  updateMap(true);
}

/* ---------- 旅行手帐（明信片 / 特产 / 贴纸） ---------- */
let albumTab = 'cards';
function renderAlbum() {
  $$('#album-tabs .tab').forEach(t => t.classList.toggle('on', t.dataset.tab === albumTab));
  const body = $('#album-body'); let h = '';
  if (albumTab === 'cards') {
    const all = []; Object.keys(DESTS).forEach(d => { all.push(d + ':a', d + ':b'); });
    const got = all.filter(id => S.cards[id]).length;
    h = `<p class="album-note">收集到 ${got} / ${all.length} 张 · 带上不同的旅行用品，能去不同的地方</p><div class="pc-grid">` +
      all.map(id => S.cards[id] ? pcHTML(id) : `<span class="pc lock"><span class="img">？</span><span class="cap">${id.split(':')[1] === 'b' ? '珍贵风景' : '还没去过'}</span></span>`).join('') + '</div>';
  } else if (albumTab === 'souv') {
    const seen = Object.keys(DESTS).filter(d => S.souvSeen[DESTS[d].souv]).length;
    h = `<p class="album-note">见过 ${seen} / ${Object.keys(DESTS).length} 种 · 特产可以在“喂食”里吃掉，带着最爱的便当出门一定能带回来</p><div class="souv-grid">` +
      Object.keys(DESTS).map(d => {
        const k = DESTS[d].souv, sv = SOUVS[k], ok = S.souvSeen[k], n = S.souv[k] || 0;
        return `<div class="souv${ok ? '' : ' lock'}">${icon(sv.ic, 'big')}<b>${ok ? sv.name : '？？？'}</b><small>${ok ? DESTS[d].name + ' ×' + n : '还没有'}</small></div>`;
      }).join('') + '</div>';
  } else if (albumTab === 'cook') {
    const keys = Object.keys(DISHES), mine = Object.keys(S.cookbook).filter(k => DISHES[k]).reverse(), rest = keys.filter(k => !S.cookbook[k]);
    const tips = []; for (let i = 0; i < 3 && rest.length; i++) { const k = rest[(dayNum() * 7 + i * 131) % rest.length]; if (!tips.includes(k)) tips.push(k); }
    h = `<p class="album-note">学会 ${mine.length} / ${keys.length} 道 · 在小屋点“煮菜”，把两样食材放进锅里试试</p><div class="souv-grid">` +
      tips.map(k => `<div class="souv tip">${icon('pot', 'big')}<b>今日灵感</b><small>${FOODS[DISHES[k].a].name} + ${FOODS[DISHES[k].b].name}</small></div>`).join('') +
      mine.map(k => { const d = DISHES[k]; return `<div class="souv">${icon(d.ic, 'big')}<b>${d.name}</b><small>${FOODS[d.a].name} + ${FOODS[d.b].name}</small></div>`; }).join('') + '</div>' +
      (rest.length ? `<p class="album-note" style="margin-top:10px">还有 ${rest.length} 道菜等你发现，换着食材多试试吧</p>` : '');
  } else if (albumTab === 'map') {
    h = mapHTML();
  } else {
    h = `<p class="album-note">贴纸 ${S.stickers.length} / ${STICKERS.length} · 多照顾、多旅行、多玩耍就能得到</p><div class="souv-grid">` +
      STICKERS.map(s => { const own = S.stickers.includes(s.id); return `<div class="souv${own ? '' : ' lock'}">${icon(s.ic, 'big')}<b>${s.name}</b><small>${own ? '已获得' : '还没有'}</small></div>`; }).join('') + '</div>';
  }
  body.innerHTML = h;
  if (albumTab === 'map') updateMap(true);
  if (S.albumNew) { S.albumNew = false; updateDots(); }
}

/* ---------- 来做客的小伙伴 ---------- */
function renderGuest() {
  const v = S.visitor;
  $('#guest').innerHTML = stumpSVG() + (v ? `<span class="friend">${friendSVG(v.id)}</span>${v.fed ? '' : '<span class="tag">请我吃点东西吧</span>'}` : '');
}
function tickVisitor(dt) {
  const v = S.visitor;
  if (v) { if (Date.now() > v.until) { S.visitor = null; renderGuest(); updateDots(); } return; }
  if (Math.random() < dt / (gone() ? 60 : 140)) {
    const id = pick(Object.keys(FRIENDS));
    S.visitor = { id, until: Date.now() + 180000, fed: false };
    renderGuest(); updateDots(); Sound.sfx.pop();
    if (scene !== 'garden' && !Games.active) toast(FRIENDS[id].name + ' 来花园做客啦');
  }
}
function openGuest() {
  const v = S.visitor;
  if (!v) { toast('树桩上空空的，也许一会儿会有小客人来'); return; }
  const f = FRIENDS[v.id];
  if (v.fed) { toast(f.name + '：吃得好饱，谢谢你！'); return; }
  const foods = myFoods();
  const m = openModal(`<div class="hero">${friendSVG(v.id)}</div><h2>${f.name} 来做客啦</h2><p>“${f.line}”<br>请它吃点什么呢？</p>` +
    (foods.length ? '<div class="item-grid">' + foods.map(k => itemBtn(`data-gf="${k}"`, FOODS[k].ic, FOODS[k].name, '×' + S.inv[k])).join('') + '</div>' : noFoodHTML));
  m.addEventListener('click', e => {
    const b = e.target.closest('[data-gf]'), g = e.target.closest('[data-go]');
    if (g) { closeModal(); shopTab = 'food'; switchScene(g.dataset.go); }
    if (b && S.visitor && !S.visitor.fed) {
      S.inv[b.dataset.gf]--; closeModal();
      S.visitor.fed = true; S.visitor.until = Date.now() + 8000;
      const n = rand(6, 14), bell = Math.random() < .25;
      if (bell) S.gear.bell = (S.gear.bell || 0) + 1;
      S.counters.guest++; renderGuest(); updateDots();
      const r = $('#guest').getBoundingClientRect();
      floatFx(icon('heart'), r.left + r.width / 2, r.top - 30);
      toast(f.name + '：谢谢款待！送你 ' + n + ' 颗橡果' + (bell ? '和一个幸运铃铛' : ''), 3200);
      addCoins(n); addExp(6); afterAction();
    }
  });
}

/* ---------- 花园 ---------- */
function plotStage(p) { return !p ? 'empty' : p.growth >= 100 ? 'ripe' : p.growth < 25 ? 's0' : p.growth < 60 ? 's1' : 's2'; }
function renderGarden() {
  $('#plots').innerHTML = S.plots.map((p, i) => `<button class="plot" data-i="${i}"></button>`).join('');
  S.plots.forEach((p, i) => renderPlot(i, true));
  renderMailbox(); renderGuest();
}
function renderPlot(i, force) {
  const el = $$('#plots .plot')[i]; if (!el) return;
  const p = S.plots[i], st = plotStage(p), growing = p && st !== 'ripe', dry = growing && p.water <= 0;
  const sig = st + '|' + (dry ? 1 : 0) + '|' + (p ? p.seed : '');
  if (force || el.dataset.sig !== sig) {
    el.dataset.sig = sig;
    el.className = 'plot ' + st + (dry ? ' dry' : '') + (growing && !dry ? ' wet' : '');
    let h = '<span class="soil"></span>';
    if (!p) h += '<span class="plus">＋</span>';
    else {
      h += `<span class="plant">${plantSVG(st)}</span>`;
      if (st === 'ripe') h += `<span class="crop">${icon(SEEDS[p.seed].ic)}</span><span class="tag">收获</span>`;
      else h += '<span class="grow"><i></i></span>';
      if (dry) h += `<span class="thirst">${icon('drop')}</span>`;
    }
    el.innerHTML = h;
  }
  const bar = el.querySelector('.grow i');
  if (bar && p) bar.style.width = Math.min(100, p.growth) + '%';
}
function plotClick(i) {
  const p = S.plots[i];
  if (!p) openSeedPicker(i);
  else if (p.growth >= 100) harvest(i);
  else water(i);
}
function openSeedPicker(i) {
  const ids = Object.keys(S.seeds).filter(k => S.seeds[k] > 0 && SEEDS[k]);
  let html = '<h2>种点什么呢？</h2>';
  if (!ids.length) html += '<p class="empty">种子用完啦，去商店买一些吧~</p><div class="row"><button class="btn small" data-go="shop">去商店</button></div>';
  else html += '<div class="item-grid">' + ids.map(k => { const s = SEEDS[k]; return itemBtn(`data-seed="${k}"`, s.ic, s.name, '×' + S.seeds[k] + (s.food ? ' 结' + s.give + '个' : s.med ? ' 做药' + s.give + '份' : ' 可卖钱')); }).join('') + '</div>';
  const m = openModal(html);
  m.addEventListener('click', e => {
    const b = e.target.closest('[data-seed]'), g = e.target.closest('[data-go]');
    if (g) { closeModal(); shopTab = 'seed'; switchScene('shop'); }
    if (b && !S.plots[i]) {
      const k = b.dataset.seed; S.seeds[k]--;
      S.plots[i] = { seed: k, growth: 0, water: 0 };
      closeModal(); Sound.sfx.pop(); renderPlot(i, true);
      toast('种下了' + SEEDS[k].name + '，记得浇水哦'); save();
    }
  });
}
function water(i) {
  const p = S.plots[i];
  if (p.water > 80) { toast('水还很多呢，等一会儿再浇吧~'); return; }
  p.water = 100; p.growth = Math.min(99.9, p.growth + 4);
  const r = $$('#plots .plot')[i].getBoundingClientRect(), fx = $('#fx');
  const can = document.createElement('div'); can.className = 'can'; can.innerHTML = icon('can');
  can.style.left = (r.left + r.width * .5) + 'px'; can.style.top = (r.top - 30) + 'px';
  fx.appendChild(can); setTimeout(() => can.remove(), 1150);
  for (let k = 0; k < 8; k++) {
    const d = document.createElement('i'); d.className = 'wdrop';
    d.style.left = (r.left + r.width * .5 - 14 + Math.random() * 22) + 'px';
    d.style.top = (r.top + 6 + Math.random() * 10) + 'px';
    d.style.animationDelay = (.2 + k * .08) + 's';
    fx.appendChild(d); setTimeout(() => d.remove(), 1500);
  }
  Sound.sfx.water();
  S.counters.water++; progress('water'); addExp(3);
  renderPlot(i); afterAction();
}
function harvest(i) {
  const p = S.plots[i], s = SEEDS[p.seed];
  const r = $$('#plots .plot')[i].getBoundingClientRect(), cx = r.left + r.width / 2;
  if (s.food) {
    S.inv[s.food] = (S.inv[s.food] || 0) + s.give;
    for (let k = 0; k < s.give; k++) setTimeout(() => floatFx(icon(FOODS[s.food].ic), cx - 30 + k * 26, r.top + 20), k * 110);
    toast('收获了 ' + FOODS[s.food].name + ' ×' + s.give + '，可以当饭吃，也可以做便当');
    Sound.sfx.ok();
  } else if (s.med) {
    S.meds[s.med] = (S.meds[s.med] || 0) + s.give;
    floatFx(icon(MEDS[s.med].ic) + '+' + s.give, cx, r.top + 20);
    toast('收获了 ' + MEDS[s.med].name + ' ×' + s.give + '，生病的时候用得上');
    Sound.sfx.ok();
  } else {
    floatFx(acorns('+' + s.coins), cx, r.top + 20);
    toast('漂亮的' + s.name + '换了 ' + s.coins + ' 颗橡果'); addCoins(s.coins);
  }
  S.plots[i] = null;
  S.counters.harvest++; progress('harvest'); addExp(10);
  renderPlot(i, true);
  const g = $('#pet-garden'); g.classList.remove('trick-jump'); void g.offsetWidth; g.classList.add('trick-jump');
  setTimeout(() => g.classList.remove('trick-jump'), 1200);
  afterAction();
}
function tickGarden(dt) {
  S.plots.forEach((p, i) => {
    if (!p || p.growth >= 100) return;
    if (p.water > 0) {
      p.growth = Math.min(100, p.growth + 100 / SEEDS[p.seed].time * dt);
      p.water = Math.max(0, p.water - 100 / 45 * dt);
      if (p.growth >= 100) {
        if (scene === 'garden') Sound.sfx.pop();
        if (!Games.active) toast(SEEDS[p.seed].name + '成熟啦');
      }
    }
    if (scene === 'garden') renderPlot(i);
  });
}

/* ---------- 商店 ---------- */
let shopTab = 'food';
function renderShop() {
  $$('#shop-tabs .tab').forEach(t => t.classList.toggle('on', t.dataset.tab === shopTab));
  const card = (ic, name, d1, d2, price, kind, id, owned) =>
    `<div class="sitem">${icon(ic, 'big')}<b>${name}</b><small>${d1}</small><small>${d2}</small>` +
    (owned ? '<button class="btn small gray" disabled>已拥有</button>' : `<button class="btn small" data-buy="${kind}:${id}">${acorns(price)}</button>`) + '</div>';
  let h = '';
  if (shopTab === 'food' || shopTab === 'drink' || shopTab === 'veg') {
    const fav = PETS[S.pet.type].fav;
    for (const k in FOODS) { const f = FOODS[k]; if ((f.drink ? 'drink' : isProduce(k) ? 'veg' : 'food') !== shopTab) continue; h += card(f.ic, f.name, fxText(f) + (k === fav ? ' 最爱' : ''), '我有 ' + (S.inv[k] || 0) + ' 份', f.price, 'food', k); }
  } else if (shopTab === 'seed') {
    for (const k in SEEDS) { const s = SEEDS[k]; h += card(s.ic, s.name + '种子', s.food ? '能结 ' + s.give + ' 个' : s.med ? '能做 ' + s.give + ' 份' + MEDS[s.med].name : '开花能换 ' + s.coins + ' 橡果', '我有 ' + (S.seeds[k] || 0) + ' 颗', s.price, 'seed', k); }
  } else if (shopTab === 'med') {
    for (const k in MEDS) { const m = MEDS[k]; h += card(m.ic, m.name, m.desc, m.pack ? '' : '我有 ' + (S.meds[k] || 0) + ' 份', m.price, 'med', k); }
  } else if (shopTab === 'wear') {
    for (const k in WEARS) { const w = WEARS[k]; h += card(w.ic, w.name, '给宠物戴上', '', w.price, 'wear', k, S.owned.includes(k)); }
  } else if (shopTab === 'furn') {
    const kind = { floor: '放在地上', rug: '铺在地上', wall: '挂在墙上' };
    for (const k in FURNS) {
      const f = FURNS[k]; if (!f.price || f.car) continue;
      h += `<div class="sitem"><div class="thumb">${furnSVG(k)}</div><b>${f.name}</b><small>${kind[f.type]}</small><small></small>` +
        (S.furn.own.includes(k) ? '<button class="btn small gray" disabled>已拥有</button>' : `<button class="btn small" data-buy="furn:${k}">${acorns(f.price)}</button>`) + '</div>';
    }
  } else if (shopTab === 'car') {
    h = '<p class="shop-note">开车去旅行，路上更快，还能去只有开车才到得了的地方</p>';
    for (const k in FURNS) {
      const f = FURNS[k]; if (!f.car) continue;
      h += `<div class="sitem"><div class="thumb">${furnSVG(k)}</div><b>${f.name}</b><small>${f.tip}</small><small>停在小屋一楼</small>` +
        (S.furn.own.includes(k) ? '<button class="btn small gray" disabled>已拥有</button>' : `<button class="btn small" data-buy="car:${k}">${acorns(f.price)}</button>`) + '</div>';
    }
  } else {
    for (const k in GEAR) { const g = GEAR[k]; h += card(g.ic, g.name, g.desc, g.once ? '用一次少一个 · 有 ' + (S.gear[k] || 0) + ' 个' : '可以一直用', g.price, 'gear', k, !g.once && !!S.gear[k]); }
  }
  $('#shop-grid').innerHTML = h;
}
function buy(kind, id, btn) {
  const item = { food: FOODS, seed: SEEDS, wear: WEARS, gear: GEAR, med: MEDS, furn: FURNS, car: FURNS }[kind][id];
  if (!item) return;
  if (kind === 'car' && S.furn.own.includes(id)) return;
  if (S.coins < item.price) { Sound.sfx.bad(); toast('橡果不够啦，去游乐场玩游戏捡一些吧'); return; }
  S.coins -= item.price;
  if (kind === 'food') S.inv[id] = (S.inv[id] || 0) + 1;
  else if (kind === 'seed') S.seeds[id] = (S.seeds[id] || 0) + 1;
  else if (kind === 'med') { if (item.pack) { item.pack.forEach(k => { S.meds[k] = (S.meds[k] || 0) + 1; }); toast('买到啦！四种药各多了一份'); } else S.meds[id] = (S.meds[id] || 0) + 1; }
  else if (kind === 'furn') { if (S.furn.own.includes(id)) return; S.furn.own.push(id); toast('买到啦！回小屋点“布置”，把' + item.name + '摆出来'); }
  else if (kind === 'car') { S.furn.own.push(id); parkCar(id); toast('买到啦！' + item.name + '停在小屋一楼了，准备行囊的时候可以开上它'); }
  else if (kind === 'gear') { S.gear[id] = (S.gear[id] || 0) + 1; if (!item.once) toast('买到啦！准备行囊的时候记得带上' + item.name); }
  else { S.owned.push(id); S.wear = id; renderPet(true); toast(gone() ? '买到啦！等 ' + S.pet.name + ' 回家就能戴上' : '买到啦！已经帮 ' + S.pet.name + ' 戴上了'); }
  const r = btn.getBoundingClientRect();
  floatFx((item.ic ? icon(item.ic) : '') + '+1', r.left + r.width / 2, r.top - 20);
  Sound.sfx.coin(); updateHUD(); renderShop(); renderAlert(); checkStickers(); save();
}

/* ---------- 每日签到、任务和贴纸 ---------- */
function checkDaily() {
  const d = dayNum();
  if (S.daily.day !== d) {
    S.streak = S.daily.day === d - 1 ? (S.streak || 0) + 1 : 1;
    S.daily = { day: d, signed: false, prog: {}, claimed: {} };
    save();
  }
  if (!S.daily.signed && !modalOpen()) {
    const bonus = 30 + Math.min(6, S.streak - 1) * 5;
    const m = openModal(`<div class="hero">${icon('gift')}</div><h2>每日签到 · 第 ${S.streak} 天</h2><p>${esc(S.pet.name)} 每天都在等你来哦<br>今天的礼物：<b>${bonus} 颗橡果</b></p><div class="row"><button class="btn big" id="sign-go">收下礼物</button></div>`, { noClose: true });
    $('#sign-go', m).onclick = () => { S.daily.signed = true; closeModal(); addCoins(bonus); confetti(); toast('签到成功，橡果 +' + bonus); save(); };
  }
  updateDots();
}
function progress(key) {
  const t = TASKS.find(x => x.id === key); if (!t) return;
  const before = S.daily.prog[key] || 0;
  S.daily.prog[key] = before + 1;
  if (before < t.need && before + 1 >= t.need) setTimeout(() => toast('任务完成：' + t.name + '，去领奖励吧'), 900);
  updateDots();
}
function stickerValue(s) { return s.c === 'level' ? S.level : s.c === 'cards' ? Object.keys(S.cards).length : s.c === 'recipes' ? Object.keys(S.cookbook).length : s.c === 'furn' ? S.furn.own.length : s.c === 'cars' ? myCars().length : s.c === 'places' ? Object.keys(DESTS).filter(beenTo).length : (S.counters[s.c] || 0); }
function checkStickers() {
  STICKERS.forEach(s => {
    if (!S.stickers.includes(s.id) && stickerValue(s) >= s.n) {
      S.stickers.push(s.id); S.albumNew = true; updateDots();
      setTimeout(() => { banner('新贴纸：' + s.name); Sound.sfx.level(); }, 1200);
    }
  });
}
function openTasks() {
  let h = '<h2>今日任务</h2>';
  TASKS.forEach(t => {
    const v = Math.min(t.need, S.daily.prog[t.id] || 0), done = v >= t.need, got = S.daily.claimed[t.id];
    h += `<div class="task">${icon(t.ic)}<div class="t-mid">${t.name}（${v}/${t.need}）<div class="t-bar"><i style="width:${v / t.need * 100}%"></i></div></div>` +
      (got ? '<button class="btn small gray" disabled>已领取</button>' : done ? `<button class="btn small" data-claim="${t.id}">领 ${acorns(t.coin)}</button>` : `<button class="btn small gray" disabled>${acorns(t.coin)}</button>`) + '</div>';
  });
  h += '<p class="hint">贴纸、明信片和特产都收在“手帐”里</p>';
  const m = openModal(h);
  m.addEventListener('click', e => {
    const b = e.target.closest('[data-claim]'); if (!b) return;
    const t = TASKS.find(x => x.id === b.dataset.claim);
    if (!t || S.daily.claimed[t.id]) return;
    S.daily.claimed[t.id] = true; addCoins(t.coin);
    const r = b.getBoundingClientRect(); floatFx(acorns('+' + t.coin), r.left + r.width / 2, r.top);
    updateDots(); save(); openTasks();
  });
}

/* ---------- 设置 ---------- */
function openMenu() {
  const m = openModal(`<h2>设置</h2><p class="hint" style="margin:0 0 8px">这一轮已经玩了 ${Math.floor(PT.secs / 60)} 分钟，玩满 ${PLAY_LIMIT / 60} 分钟要休息 ${COOL_DOWN / 60} 分钟</p>
    <div class="row"><button class="btn small plain" id="m-rename">改名字</button><button class="btn small green" id="m-title">回到封面</button></div>
    <h3>给爸爸妈妈的话</h3>
    <p style="font-size:15px;text-align:left">进度会自动保存在这台设备的浏览器里。一次旅行大约 2～4 分钟，关掉游戏时间也照常走。每连续玩 15 分钟会强制休息 5 分钟，倒计时结束才能继续（中途离开 5 分钟以上会重新计时）。宠物太脏、太饿、太渴或太累时，会先出现症状并提示还有多久会生病；生病后吃药加休息就好。如果生病后 10 分钟一直不吃药（关掉游戏的时间也算），它会离家出走，带上药和它最爱的食物就能接回来。</p>
    <div class="row"><button class="btn small gray" id="m-reset">重新领养一只</button></div>`);
  $('#m-rename', m).onclick = () => {
    const m2 = openModal(`<h2>新名字</h2><input id="rn" class="text-input" maxlength="6" value="${esc(S.pet.name)}" autocomplete="off"><div class="row"><button class="btn" id="rn-ok">好啦</button></div>`);
    $('#rn-ok', m2).onclick = () => { const v = $('#rn', m2).value.trim().slice(0, 6); if (v) { S.pet.name = v; updateHUD(); renderAway(); save(); if (!gone()) say('我的新名字是' + v + '！'); } closeModal(); };
  };
  $('#m-title', m).onclick = () => { closeModal(); save(); backToTitle(); };
  $('#m-reset', m).onclick = () => confirmReset();
}
function confirmReset() {
  const m = openModal(`<h2>真的要重新领养吗？</h2><p>现在的宠物、橡果、花园和明信片都会重新开始哦。</p><div class="row"><button class="btn" data-close>再想想</button><button class="btn gray" id="rs-ok">重新领养</button></div>`);
  $('#rs-ok', m).onclick = () => {
    closeModal(); try { localStorage.removeItem(SAVE_KEY); } catch (e) { }
    S = null; stopTicker(); showChoose();
  };
}
function backToTitle() { stopTicker(); S = null; Sound.music('home'); initTitle(); showScreen('title'); }

/* ---------- 煮菜：两样食材放进锅里，变成一道菜 ---------- */
/* 能下锅的食材。t 是种类：veg 蔬菜、pan 厨房里的食材、fruit 水果；c 是它在盘子里的颜色；
 * n 是菜名里的叫法（不写就用食物的名字）；juicy 表示能榨成汁。
 * 顺序不能动、新的只能加在后面：存档里的菜是按这个顺序记的 */
const COOK = {
  carrot:      { t: 'veg', c: '#E6A15C', juicy: 1 }, corn:     { t: 'veg', c: '#EBC66B', juicy: 1 },
  tomato:      { t: 'veg', c: '#D9705F', juicy: 1 }, lettuce:  { t: 'veg', c: '#C3D69B', juicy: 1 },
  potato:      { t: 'veg', c: '#E2C48A' },           mushroom: { t: 'veg', c: '#D9BFA6' },
  pumpkin:     { t: 'veg', c: '#E9A04E', juicy: 1 }, eggplant: { t: 'veg', c: '#9A7DB8' },
  cabbage:     { t: 'veg', c: '#DDE8BE', juicy: 1 }, cucumber: { t: 'veg', c: '#8DB574', juicy: 1 },
  broccoli:    { t: 'veg', c: '#7FA86B' },           spinach:  { t: 'veg', c: '#6F9A66', juicy: 1 },
  onion:       { t: 'veg', c: '#C9A3C4' },           sweetpotato: { t: 'veg', c: '#C0788A', juicy: 1 },
  pea:         { t: 'veg', c: '#A9CC7A' },           radish:   { t: 'veg', c: '#F3EFE2', n: '萝卜' },
  egg:         { t: 'pan', c: '#F3D56B' },           rice:     { t: 'pan', c: '#FFFDF6' },
  noodle:      { t: 'pan', c: '#F1DDA6' },           tofu:     { t: 'pan', c: '#F6F0DC' },
  cheese:      { t: 'pan', c: '#F0CE5A' },           milk:     { t: 'pan', c: '#FBF7EA' },
  bread:       { t: 'pan', c: '#E2B877' },
  apple:       { t: 'fruit', c: '#D6655A' },         strawberry: { t: 'fruit', c: '#E47C8A' },
  watermelon:  { t: 'fruit', c: '#E0606A', juicy: 1 }, orange:  { t: 'fruit', c: '#F0A04E', juicy: 1 },
  peach:       { t: 'fruit', c: '#F2B8A6' },         banana:   { t: 'fruit', c: '#F3DC7A' },
  grape:       { t: 'fruit', c: '#A68BC4', juicy: 1 },
  cherry:      { t: 'fruit', c: '#C9485A' },         pineapple: { t: 'fruit', c: '#EFC84A', juicy: 1 },
  mango:       { t: 'fruit', c: '#F0B24E' },         lemon:    { t: 'fruit', c: '#F3DC5A', juicy: 1 }
};
const COOK_IDS = Object.keys(COOK);
const isProduce = k => !!COOK[k] && COOK[k].t !== 'pan';   // 蔬菜和水果，商店里放在“蔬果”那一栏
/* 菜谱：'食材A+食材B': [菜名, 做法]。做法决定盘子的样子和额外的好处：
 * soup 汤（补水分）、salad 沙拉（补一点水分）、bake 烤或做成饼和泥（补精力）、stir 炒或烧（更开心）、
 * rice 饭（更管饱）、noodle 面、bun 面包和三明治、juice 果汁奶昔（当饮料喝）、sweet 甜点（算甜食） */
const RECIPES = {
  'carrot+carrot': ['蜜汁胡萝卜', 'stir'], 'corn+corn': ['烤玉米', 'bake'], 'tomato+tomato': ['番茄浓汤', 'soup'], 'lettuce+lettuce': ['生菜沙拉', 'salad'],
  'potato+potato': ['土豆泥', 'bake'], 'mushroom+mushroom': ['烤蘑菇', 'bake'], 'pumpkin+pumpkin': ['南瓜粥', 'soup'], 'eggplant+eggplant': ['烤茄子', 'bake'],
  'carrot+corn': ['玉米胡萝卜汤', 'soup'], 'carrot+tomato': ['番茄胡萝卜汤', 'soup'], 'carrot+lettuce': ['胡萝卜沙拉', 'salad'], 'carrot+potato': ['土豆炖胡萝卜', 'stir'],
  'carrot+mushroom': ['蘑菇炒胡萝卜', 'stir'], 'carrot+pumpkin': ['金黄蔬菜泥', 'bake'], 'carrot+eggplant': ['茄子烧胡萝卜', 'stir'],
  'corn+tomato': ['番茄玉米汤', 'soup'], 'corn+lettuce': ['玉米生菜沙拉', 'salad'], 'corn+potato': ['玉米土豆饼', 'bake'], 'corn+mushroom': ['蘑菇炒玉米', 'stir'],
  'corn+pumpkin': ['南瓜玉米羹', 'soup'], 'corn+eggplant': ['茄子玉米粒', 'stir'],
  'tomato+lettuce': ['番茄生菜沙拉', 'salad'], 'tomato+potato': ['番茄土豆汤', 'soup'], 'tomato+mushroom': ['番茄蘑菇汤', 'soup'], 'tomato+pumpkin': ['番茄南瓜汤', 'soup'],
  'tomato+eggplant': ['番茄烧茄子', 'stir'],
  'lettuce+potato': ['土豆生菜卷', 'salad'], 'lettuce+mushroom': ['蘑菇生菜汤', 'soup'], 'lettuce+pumpkin': ['南瓜生菜沙拉', 'salad'], 'lettuce+eggplant': ['茄子拌生菜', 'salad'],
  'potato+mushroom': ['蘑菇土豆泥', 'bake'], 'potato+pumpkin': ['南瓜土豆饼', 'bake'], 'potato+eggplant': ['土豆烧茄子', 'stir'],
  'mushroom+pumpkin': ['南瓜蘑菇汤', 'soup'], 'mushroom+eggplant': ['蘑菇炒茄子', 'stir'],
  'pumpkin+eggplant': ['南瓜焖茄子', 'stir'],
  // 白菜
  'carrot+cabbage': ['胡萝卜炒白菜', 'stir'], 'corn+cabbage': ['玉米白菜汤', 'soup'], 'tomato+cabbage': ['番茄白菜汤', 'soup'], 'lettuce+cabbage': ['青菜沙拉', 'salad'],
  'potato+cabbage': ['白菜炖土豆', 'stir'], 'mushroom+cabbage': ['蘑菇扒白菜', 'stir'], 'pumpkin+cabbage': ['南瓜白菜汤', 'soup'], 'eggplant+cabbage': ['茄子炒白菜', 'stir'],
  'cabbage+cabbage': ['醋溜白菜', 'stir'],
  // 黄瓜
  'carrot+cucumber': ['胡萝卜拌黄瓜', 'salad'], 'corn+cucumber': ['玉米黄瓜沙拉', 'salad'], 'tomato+cucumber': ['番茄黄瓜沙拉', 'salad'], 'lettuce+cucumber': ['黄瓜生菜沙拉', 'salad'],
  'potato+cucumber': ['土豆黄瓜沙拉', 'salad'], 'mushroom+cucumber': ['蘑菇炒黄瓜', 'stir'], 'pumpkin+cucumber': ['南瓜黄瓜汤', 'soup'], 'eggplant+cucumber': ['茄子拌黄瓜', 'salad'],
  'cabbage+cucumber': ['白菜拌黄瓜', 'salad'], 'cucumber+cucumber': ['拍黄瓜', 'salad'],
  // 西兰花
  'carrot+broccoli': ['胡萝卜炒西兰花', 'stir'], 'corn+broccoli': ['玉米炒西兰花', 'stir'], 'tomato+broccoli': ['番茄西兰花汤', 'soup'], 'lettuce+broccoli': ['西兰花生菜沙拉', 'salad'],
  'potato+broccoli': ['土豆西兰花泥', 'bake'], 'mushroom+broccoli': ['蘑菇炒西兰花', 'stir'], 'pumpkin+broccoli': ['南瓜西兰花泥', 'bake'], 'eggplant+broccoli': ['茄子炒西兰花', 'stir'],
  'cabbage+broccoli': ['白菜西兰花汤', 'soup'], 'cucumber+broccoli': ['黄瓜西兰花沙拉', 'salad'], 'broccoli+broccoli': ['清炒西兰花', 'stir'],
  // 菠菜
  'carrot+spinach': ['胡萝卜拌菠菜', 'salad'], 'corn+spinach': ['玉米菠菜汤', 'soup'], 'tomato+spinach': ['番茄菠菜汤', 'soup'], 'lettuce+spinach': ['菠菜生菜沙拉', 'salad'],
  'potato+spinach': ['菠菜土豆泥', 'bake'], 'mushroom+spinach': ['蘑菇菠菜汤', 'soup'], 'pumpkin+spinach': ['南瓜菠菜羹', 'soup'], 'eggplant+spinach': ['茄子炒菠菜', 'stir'],
  'cabbage+spinach': ['白菜菠菜汤', 'soup'], 'cucumber+spinach': ['黄瓜拌菠菜', 'salad'], 'broccoli+spinach': ['翡翠蔬菜泥', 'bake'], 'spinach+spinach': ['清炒菠菜', 'stir'],
  // 洋葱
  'carrot+onion': ['洋葱炒胡萝卜', 'stir'], 'corn+onion': ['洋葱炒玉米', 'stir'], 'tomato+onion': ['番茄洋葱汤', 'soup'], 'lettuce+onion': ['洋葱生菜沙拉', 'salad'],
  'potato+onion': ['洋葱炒土豆', 'stir'], 'mushroom+onion': ['洋葱炒蘑菇', 'stir'], 'pumpkin+onion': ['洋葱南瓜汤', 'soup'], 'eggplant+onion': ['洋葱烧茄子', 'stir'],
  'cabbage+onion': ['洋葱炒白菜', 'stir'], 'cucumber+onion': ['洋葱拌黄瓜', 'salad'], 'broccoli+onion': ['洋葱炒西兰花', 'stir'], 'spinach+onion': ['洋葱菠菜汤', 'soup'],
  'onion+onion': ['烤洋葱圈', 'bake'],
  // 红薯
  'carrot+sweetpotato': ['胡萝卜红薯泥', 'bake'], 'corn+sweetpotato': ['玉米红薯饼', 'bake'], 'tomato+sweetpotato': ['番茄红薯汤', 'soup'], 'lettuce+sweetpotato': ['红薯生菜沙拉', 'salad'],
  'potato+sweetpotato': ['双薯饼', 'bake'], 'mushroom+sweetpotato': ['蘑菇焖红薯', 'stir'], 'pumpkin+sweetpotato': ['南瓜红薯羹', 'soup'], 'eggplant+sweetpotato': ['茄子焖红薯', 'stir'],
  'cabbage+sweetpotato': ['白菜红薯汤', 'soup'], 'cucumber+sweetpotato': ['黄瓜红薯沙拉', 'salad'], 'broccoli+sweetpotato': ['西兰花红薯泥', 'bake'], 'spinach+sweetpotato': ['菠菜红薯饼', 'bake'],
  'onion+sweetpotato': ['洋葱烤红薯', 'bake'], 'sweetpotato+sweetpotato': ['烤红薯', 'bake'],
  // 豌豆
  'carrot+pea': ['胡萝卜炒豌豆', 'stir'], 'corn+pea': ['玉米炒豌豆', 'stir'], 'tomato+pea': ['番茄豌豆汤', 'soup'], 'lettuce+pea': ['豌豆生菜沙拉', 'salad'],
  'potato+pea': ['豌豆土豆泥', 'bake'], 'mushroom+pea': ['蘑菇炒豌豆', 'stir'], 'pumpkin+pea': ['南瓜豌豆羹', 'soup'], 'eggplant+pea': ['茄子炒豌豆', 'stir'],
  'cabbage+pea': ['白菜豌豆汤', 'soup'], 'cucumber+pea': ['黄瓜豌豆沙拉', 'salad'], 'broccoli+pea': ['豌豆炒西兰花', 'stir'], 'spinach+pea': ['菠菜豌豆汤', 'soup'],
  'onion+pea': ['洋葱炒豌豆', 'stir'], 'sweetpotato+pea': ['豌豆红薯泥', 'bake'], 'pea+pea': ['豌豆浓汤', 'soup'],
  // 白萝卜
  'carrot+radish': ['双色萝卜汤', 'soup'], 'corn+radish': ['玉米萝卜汤', 'soup'], 'tomato+radish': ['番茄萝卜汤', 'soup'], 'lettuce+radish': ['萝卜生菜沙拉', 'salad'],
  'potato+radish': ['土豆炖萝卜', 'stir'], 'mushroom+radish': ['蘑菇萝卜汤', 'soup'], 'pumpkin+radish': ['南瓜炖萝卜', 'stir'], 'eggplant+radish': ['茄子烧萝卜', 'stir'],
  'cabbage+radish': ['白菜萝卜汤', 'soup'], 'cucumber+radish': ['黄瓜拌萝卜', 'salad'], 'broccoli+radish': ['西兰花萝卜汤', 'soup'], 'spinach+radish': ['菠菜萝卜汤', 'soup'],
  'onion+radish': ['洋葱炖萝卜', 'stir'], 'sweetpotato+radish': ['红薯萝卜汤', 'soup'], 'pea+radish': ['豌豆萝卜汤', 'soup'], 'radish+radish': ['萝卜丝饼', 'bake'],
  // 厨房里的食材互相搭配
  'egg+egg': ['蒸蛋羹', 'bake'], 'egg+rice': ['蛋炒饭', 'rice'], 'egg+noodle': ['鸡蛋面', 'noodle'], 'egg+tofu': ['鸡蛋豆腐羹', 'soup'],
  'egg+cheese': ['芝士蛋卷', 'bake'], 'egg+milk': ['牛奶炖蛋', 'sweet'], 'egg+bread': ['鸡蛋三明治', 'bun'],
  'rice+rice': ['白饭团', 'rice'], 'rice+noodle': ['米线', 'noodle'], 'rice+tofu': ['豆腐盖饭', 'rice'], 'rice+cheese': ['芝士焗饭', 'rice'],
  'rice+milk': ['牛奶粥', 'soup'], 'rice+bread': ['米饭汉堡', 'bun'],
  'noodle+noodle': ['阳春面', 'noodle'], 'noodle+tofu': ['豆腐汤面', 'noodle'], 'noodle+cheese': ['芝士焗面', 'noodle'], 'noodle+milk': ['奶油意面', 'noodle'],
  'noodle+bread': ['炒面面包', 'bun'],
  'tofu+tofu': ['香煎豆腐', 'stir'], 'tofu+cheese': ['芝士豆腐', 'bake'], 'tofu+milk': ['牛奶豆花', 'sweet'], 'tofu+bread': ['豆腐汉堡', 'bun'],
  'cheese+cheese': ['烤奶酪', 'bake'], 'cheese+milk': ['芝士奶盖', 'juice'], 'cheese+bread': ['芝士吐司', 'bun'],
  'milk+milk': ['双皮奶', 'sweet'], 'milk+bread': ['牛奶吐司', 'bun'], 'bread+bread': ['烤吐司', 'bun'],
  // 蔬菜 + 厨房食材里，比“按规矩起名”更好听的那些
  'lettuce+egg': ['生菜蛋花汤', 'soup'], 'potato+egg': ['土豆蛋饼', 'bake'], 'pumpkin+egg': ['南瓜蒸蛋', 'bake'], 'cabbage+egg': ['白菜蛋花汤', 'soup'],
  'sweetpotato+egg': ['红薯蛋饼', 'bake'], 'radish+egg': ['萝卜丝蛋汤', 'soup'],
  'tomato+rice': ['番茄烩饭', 'rice'], 'lettuce+rice': ['生菜包饭', 'rice'], 'potato+rice': ['土豆焖饭', 'rice'], 'mushroom+rice': ['蘑菇烩饭', 'rice'],
  'pumpkin+rice': ['南瓜焖饭', 'rice'], 'eggplant+rice': ['茄子盖饭', 'rice'], 'cabbage+rice': ['白菜泡饭', 'rice'], 'cucumber+rice': ['黄瓜饭卷', 'rice'],
  'spinach+rice': ['菠菜粥', 'soup'], 'sweetpotato+rice': ['红薯粥', 'soup'], 'pea+rice': ['豌豆焖饭', 'rice'], 'radish+rice': ['萝卜粥', 'soup'],
  'corn+noodle': ['玉米汤面', 'noodle'], 'tomato+noodle': ['番茄汤面', 'noodle'], 'lettuce+noodle': ['生菜汤面', 'noodle'], 'mushroom+noodle': ['蘑菇汤面', 'noodle'],
  'pumpkin+noodle': ['南瓜汤面', 'noodle'], 'eggplant+noodle': ['茄子拌面', 'noodle'], 'cabbage+noodle': ['白菜汤面', 'noodle'], 'cucumber+noodle': ['黄瓜凉面', 'noodle'],
  'spinach+noodle': ['菠菜面', 'noodle'], 'sweetpotato+noodle': ['红薯粉', 'noodle'], 'pea+noodle': ['豌豆面', 'noodle'], 'radish+noodle': ['萝卜汤面', 'noodle'],
  'corn+tofu': ['玉米豆腐羹', 'soup'], 'tomato+tofu': ['番茄豆腐汤', 'soup'], 'lettuce+tofu': ['生菜豆腐汤', 'soup'], 'pumpkin+tofu': ['南瓜豆腐羹', 'soup'],
  'cabbage+tofu': ['白菜炖豆腐', 'stir'], 'cucumber+tofu': ['黄瓜拌豆腐', 'salad'], 'spinach+tofu': ['菠菜豆腐汤', 'soup'], 'sweetpotato+tofu': ['红薯豆腐羹', 'soup'],
  'radish+tofu': ['萝卜豆腐汤', 'soup'],
  'corn+cheese': ['芝士玉米', 'bake'], 'lettuce+cheese': ['芝士生菜卷', 'salad'], 'cucumber+cheese': ['黄瓜芝士卷', 'salad'], 'onion+cheese': ['芝士洋葱圈', 'bake'],
  'eggplant+milk': ['奶油焗茄子', 'bake'], 'cabbage+milk': ['奶油白菜', 'stir'], 'cucumber+milk': ['黄瓜牛奶汁', 'juice'], 'sweetpotato+milk': ['红薯牛奶', 'juice'],
  'carrot+bread': ['胡萝卜面包', 'bun'], 'corn+bread': ['玉米面包', 'bun'], 'potato+bread': ['土豆泥三明治', 'bun'], 'pumpkin+bread': ['南瓜面包', 'bun'],
  'sweetpotato+bread': ['红薯面包', 'bun'],
  // 水果
  'apple+apple': ['苹果酱', 'sweet'], 'watermelon+watermelon': ['西瓜冰沙', 'juice'], 'banana+banana': ['烤香蕉', 'bake'],
  'rice+pineapple': ['菠萝炒饭', 'rice'], 'bread+pineapple': ['菠萝包', 'bun'], 'rice+mango': ['芒果糯米饭', 'rice'], 'mango+mango': ['芒果布丁', 'sweet'],
  'lemon+lemon': ['柠檬茶', 'juice']
};
/* 没有专门起名字的搭配，按食材的种类来定菜名和做法 */
const PAN_RULE = {    // 蔬菜 + 厨房食材
  egg: v => [v + '炒蛋', 'stir'], rice: v => [v + '炒饭', 'rice'], noodle: v => [v + '炒面', 'noodle'], tofu: v => [v + '烧豆腐', 'stir'],
  cheese: v => ['芝士焗' + v, 'bake'], milk: v => ['奶油' + v + '汤', 'soup'], bread: v => [v + '三明治', 'bun']
};
const FRUIT_RULE = {  // 厨房食材 + 水果
  egg: f => [f + '蛋糕', 'sweet'], rice: f => [f + '甜粥', 'soup'], noodle: f => [f + '凉面', 'noodle'], tofu: f => [f + '豆花', 'sweet'],
  cheese: f => [f + '奶酪杯', 'sweet'], milk: f => [f + '奶昔', 'juice'], bread: f => [f + '吐司', 'bun']
};
function recipeOf(a, b) {   // a 排在 b 前面
  if (RECIPES[a + '+' + b]) return RECIPES[a + '+' + b];
  const A = COOK[a], B = COOK[b], na = A.n || FOODS[a].name, nb = B.n || FOODS[b].name;
  if (A.t === 'veg' && B.t === 'pan') return PAN_RULE[b](na);
  if (A.t === 'veg' && B.t === 'fruit') return A.juicy ? [na + nb + '汁', 'juice'] : [nb + na + '沙拉', 'salad'];
  if (A.t === 'pan' && B.t === 'fruit') return FRUIT_RULE[a](nb);
  if (A.t === 'fruit' && B.t === 'fruit') return a === b ? [na + '果酱', 'sweet'] : A.juicy || B.juicy ? [na + nb + '汁', 'juice'] : [na + nb + '水果杯', 'salad'];
  return [na + nb + '大杂烩', 'stir'];
}
/* 每道菜的效果：比分开吃两样食材更管饱，再加上做法带来的好处 */
const DISHES = {};
COOK_IDS.forEach((a, i) => COOK_IDS.slice(i).forEach(b => {
  const key = a + '+' + b, rc = recipeOf(a, b), kind = rc[1], fa = FOODS[a], fb = FOODS[b];
  const base = (fa.hunger || 0) + (fb.hunger || 0), wet = Math.round(((fa.thirst || 0) + (fb.thirst || 0)) / 2);
  const d = DISHES[key] = {
    name: rc[0], ic: 'dish:' + key, kind, a, b,
    hunger: Math.round(base * ({ rice: 1.2, bun: 1.15, noodle: 1.1, juice: .5 }[kind] || 1.05)),
    happy: { stir: 16, sweet: 20, juice: 12 }[kind] || 10,
    thirst: ({ soup: 18, salad: 8, noodle: 8, juice: 18 }[kind] || 0) + wet,
    energy: { bake: 8, bun: 5, rice: 5 }[kind] || 0
  };
  if (kind === 'juice') d.drink = true;   // 果汁和奶昔当饮料喝
  if (kind === 'sweet') d.sweet = 1;      // 甜点算甜食，连着吃太多会肚子疼
  const fruitFirst = kind === 'juice' && COOK[a].t === 'pan' && a !== b;   // 奶昔的颜色跟着水果走，不跟着牛奶
  ICONS[d.ic] = fruitFirst ? dishIcon(kind, COOK[b].c, COOK[a].c) : dishIcon(kind, COOK[a].c, a === b ? '#FBF5E3' : COOK[b].c);
}));
const dishKey = (a, b) => COOK_IDS.indexOf(a) <= COOK_IDS.indexOf(b) ? a + '+' + b : b + '+' + a;
const myCookables = () => COOK_IDS.filter(k => (S.inv[k] || 0) > 0);
const myDishes = () => Object.keys(S.dishes).filter(k => S.dishes[k] > 0 && DISHES[k]);
const myMeals = () => myDishes().filter(k => !DISHES[k].drink);   // 能当便当带出门的（果汁不算）

function openCook() {
  if (blocked() || bath) return;
  if (S.sick) { say('生病了没力气做饭，先把病养好吧…'); return; }
  if (S.stats.energy < 5) { say('好累呀，想先睡一觉…'); return; }
  const sel = [];
  const m = openModal('<div id="cook-box"></div>');
  const left = k => (S.inv[k] || 0) - sel.filter(x => x === k).length;
  const draw = () => {
    const have = myCookables(), total = have.reduce((n, k) => n + S.inv[k], 0);
    const slot = i => sel[i] ? `<button class="cslot full" data-cs="${i}">${icon(FOODS[sel[i]].ic)}</button>` : '<span class="cslot">？</span>';
    let h = `<h2>${esc(S.pet.name)} 的小厨房</h2><p>选两样食材放进锅里，看看能做出什么菜</p>` +
      `<div class="pot-row">${slot(0)}<span class="plus">＋</span>${slot(1)}<span class="plus">→</span><span class="potic">${icon('pot')}</span></div>`;
    if (sel.length === 2) {   // 选好两样就告诉她：做过没有。开煮的按钮放在食材上面，食材再多也不用往下翻
      const k2 = dishKey(sel[0], sel[1]);
      h += `<p class="hint" style="margin:-2px 0 8px">${S.cookbook[k2] ? '做过这道：' + DISHES[k2].name : '新搭配，还没试过哦'}</p><div class="row" style="margin-bottom:10px"><button class="btn big green" id="cook-go">开煮</button></div>`;
    }
    if (have.length) h += '<div class="item-grid">' + have.map(k => itemBtn(`data-cv="${k}"`, FOODS[k].ic, FOODS[k].name, '×' + left(k))).join('') + '</div>';
    if (total < 2) h += '<p class="empty">食材不够两样了。<br>去花园种一些，或者去商店买吧~</p><div class="row"><button class="btn small" data-go="shop">去商店</button><button class="btn small green" data-go="garden">去花园</button></div>';
    h += `<p class="hint">已经学会 ${Object.keys(S.cookbook).length} / ${Object.keys(DISHES).length} 道菜，菜谱收在“手帐”里</p>`;
    $('#cook-box', m).innerHTML = h;
  };
  draw();
  m.addEventListener('click', e => {
    const v = e.target.closest('[data-cv]'), c = e.target.closest('[data-cs]'), g = e.target.closest('[data-go]');
    if (v && sel.length < 2 && left(v.dataset.cv) > 0) { sel.push(v.dataset.cv); Sound.sfx.pop(); draw(); }
    else if (c) { sel.splice(+c.dataset.cs, 1); Sound.sfx.pop(); draw(); }
    else if (g) { closeModal(); if (g.dataset.go === 'shop') shopTab = 'veg'; switchScene(g.dataset.go); }
    else if (e.target.closest('#cook-go') && sel.length === 2) cook(sel[0], sel[1]);
  });
}
function cook(a, b) {
  const key = dishKey(a, b), d = DISHES[key];
  if (!d || (S.inv[a] || 0) < (a === b ? 2 : 1) || (S.inv[b] || 0) < 1) return;
  S.inv[a]--; S.inv[b]--;
  S.stats.energy = clamp(S.stats.energy - 3, 0, 100);
  const isNew = !S.cookbook[key];
  S.dishes[key] = (S.dishes[key] || 0) + 1; S.cookbook[key] = 1;
  S.counters.cook = (S.counters.cook || 0) + 1;
  if (isNew) { S.coins += 5; S.albumNew = true; }
  progress('cook'); save();
  // 先咕嘟咕嘟煮一会儿，再端出来
  openModal(`<div class="cooking"><div class="hero">${petSVG(S.pet.type, 'joy', 'chef')}</div><h2>咕嘟咕嘟… 正在煮</h2>
    <div class="pot-row"><span class="cslot full">${icon(FOODS[a].ic)}</span><span class="plus">＋</span><span class="cslot full">${icon(FOODS[b].ic)}</span><span class="plus">→</span><span class="potic">${icon('pot')}</span></div></div>`, { noClose: true });
  for (let i = 0; i < 5; i++) setTimeout(() => Sound.sfx.bubble(), i * 300);
  setTimeout(() => {
    if (!S) return;
    Sound.sfx.ok(); if (isNew) confetti();
    const m = openModal(`<div class="dish-big">${icon(d.ic)}</div><h2>${d.name}${isNew ? ' <i class="new-tag">新菜谱</i>' : ''}</h2>
      <p>${fxText(d)}${isNew ? '<br>第一次做出这道菜，奖励 5 颗橡果' : ''}</p>
      <div class="row"><button class="btn" id="dish-eat">现在就吃</button><button class="btn plain" id="dish-more">再煮一道</button><button class="btn plain" data-close>先收起来</button></div>`);
    $('#dish-eat', m).onclick = () => { closeModal(); feed(key, 'dish'); };
    $('#dish-more', m).onclick = () => { closeModal(); openCook(); };
    addExp(isNew ? 15 : 6); afterAction();
  }, 1700);
}

/* ---------- 两层楼和家具 ----------
 * 家具的位置用和房间背景同一把尺子（宽 800、高 500）：
 * 地上的家具和地毯记的是“底边中点”，墙上的记的是“正中心” */
let stageU = 1;                       // 房间里 1 个单位等于屏幕上多少像素，fitStage 里更新
let decor = null, drag = null, floorBusy = false;
const furnDefault = () => ({
  own: ['rug', 'cushion', 'stump', 'cards'],
  put: [{ id: 'rug', f: 1, x: 400, y: 494 }, { id: 'cushion', f: 1, x: 262, y: 440 }, { id: 'stump', f: 1, x: 548, y: 446 }, { id: 'cards', f: 1, x: 400, y: 150 }]
});
function furnStyle(p) {
  const f = FURNS[p.id];
  return `left:calc(50% + var(--u) * ${p.x - 400});top:calc(100% - var(--u) * ${500 - p.y});width:calc(var(--u) * ${f.w});z-index:${f.type === 'rug' ? 1 : f.type === 'wall' ? 2 : Math.round(p.y)}`;
}
/* 把家具限制在能看见、也合理的范围里：地上的不上墙，墙上的不落地，左右不出屏幕 */
function clampFurn(p) {
  const f = FURNS[p.id], st = $('#stage'), halfW = st.clientWidth / (2 * stageU), visTop = 500 - st.clientHeight / stageU;
  const h = f.w * f.vb[1] / f.vb[0];
  let x0 = Math.max(0, 400 - halfW) + f.w / 2, x1 = Math.min(800, 400 + halfW) - f.w / 2;
  if (x0 > x1) x0 = x1 = 400;
  p.x = Math.round(clamp(p.x, x0, x1));
  if (f.type === 'wall') { const top = Math.max(40, visTop + 6) + h / 2, bot = Math.max(top, 304 - h / 2); p.y = Math.round(clamp(p.y, top, bot)); }
  else p.y = Math.round(clamp(p.y, f.type === 'rug' ? Math.min(498, 378 + h) : 388, 498));
}
/* 明信片绳上的三张：自己选过就按选的贴，没选过就贴最近的三张 */
function wallCards() { const last = S.cardLog.slice(-3); return S.wallPick || [0, 1, 2].map(i => last[i] || null); }
function cardSlotsHTML() {
  const xs = [50, 135, 220], ys = [24, 33, 24], ids = wallCards();
  return ids.map((id, i) => {
    const st = `left:${((xs[i] - 36) / 270 * 100).toFixed(1)}%;top:${(ys[i] / 112 * 100).toFixed(1)}%;transform:rotate(${[-4, 2, 5][i]}deg)`;
    if (!id || !S.cards[id]) return `<span class="slot empty" data-slot="${i}" style="${st}">＋</span>`;
    return `<span class="slot" data-slot="${i}" style="${st}"><span class="pc${id.split(':')[1] === 'b' ? ' rare' : ''}"><span class="img">${postcardSVG(id, S.pet.type, travelWear())}</span></span></span>`;
  }).join('');
}
function renderFurn() {
  $('#furn').innerHTML = S.furn.put.filter(p => p.f === S.floor && FURNS[p.id] && !(S.trip && S.trip.car === p.id)).map(p =>
    `<div class="fi ${FURNS[p.id].type}${decor && decor.sel === p.id ? ' sel' : ''}" data-fid="${p.id}" style="${furnStyle(p)}">${furnSVG(p.id)}${p.id === 'cards' ? cardSlotsHTML() : ''}<button class="stow" data-stow="${p.id}">收起来</button></div>`
  ).join('');
}
function renderWall() { renderFurn(); }
function openCardPicker(i) {
  const have = S.cardLog.filter(id => S.cards[id]);
  if (!have.length) { toast('还没有明信片，送' + S.pet.name + '去旅行就会有啦'); return; }
  const cur = wallCards();
  const m = openModal(`<h2>这里贴哪一张呢？</h2><div class="pc-grid">${have.slice().reverse().map(id => pcHTML(id, cur[i] === id ? 'on' : '')).join('')}</div>
    <div class="row"><button class="btn plain" id="card-none">这里先空着</button></div>`);
  const set = id => {
    const w = wallCards().slice();
    if (id) for (let k = 0; k < 3; k++) if (w[k] === id) w[k] = null;   // 同一张只贴一处
    w[i] = id; S.wallPick = w;
    closeModal(); Sound.sfx.page(); renderFurn(); save();
  };
  m.addEventListener('click', e => { const c = e.target.closest('.pc[data-card]'); if (c) set(c.dataset.card); });
  $('#card-none', m).onclick = () => set(null);
}

/* 布置模式：拖动换位置，点一下选中后可以收起来；收起来的家具在下面一排，点一下摆出来 */
function toggleDecor() {
  if (bath) return;
  if (decor) decor = null;
  else { decor = { sel: null }; $('#bubble').classList.remove('show'); resetIdle(); toast('拖动家具换位置，点一下家具可以收起来'); }
  $('#scene-home').classList.toggle('decor', !!decor); $('#screen-game').classList.toggle('decor-on', !!decor);
  fitStage(); renderFurn(); renderDecorBar(); updateActions();
  if (!decor) save();
}
function renderDecorBar() {
  const bar = $('#decor-bar');
  if (!decor) { bar.innerHTML = ''; return; }
  const spare = S.furn.own.filter(id => FURNS[id] && !S.furn.put.some(p => p.id === id) && !(S.trip && S.trip.car === id));
  bar.innerHTML = '<div class="tray">' + (spare.length
    ? spare.map(id => `<button data-place="${id}" title="${FURNS[id].name}">${furnSVG(id)}</button>`).join('')
    : '<span class="tip">家具都摆出来了。想要更多，去商店的“家具”看看。<br>点右边的楼梯，可以去布置另一层。</span>') +
    '</div><button class="btn small" id="decor-done">摆好了</button>';
}
function placeFurn(id) {
  const f = FURNS[id]; if (!decor || !f || S.furn.put.some(p => p.id === id)) return;
  if (f.car && S.floor !== 1) { toast('小车上不了楼梯，只能停在一楼哦'); return; }
  const p = { id, f: S.floor, x: f.type === 'floor' ? 300 : 400, y: f.type === 'wall' ? 190 : f.type === 'rug' ? 494 : 444 };
  clampFurn(p); S.furn.put.push(p); decor.sel = id;
  Sound.sfx.pop(); renderFurn(); renderDecorBar();
}
function stowFurn(id) {
  S.furn.put = S.furn.put.filter(p => p.id !== id);
  if (decor) decor.sel = null;
  Sound.sfx.pop(); renderFurn(); renderDecorBar();
}
function furnDown(e) {
  if (!decor || e.target.closest('.stow')) return;
  const el = e.target.closest('.fi'); if (!el) return;
  const p = S.furn.put.find(q => q.id === el.dataset.fid); if (!p) return;
  drag = { el, p, sx: e.clientX, sy: e.clientY, x0: p.x, y0: p.y, moved: false };
  try { el.setPointerCapture(e.pointerId); } catch (err) { }
  e.preventDefault();
}
function furnMove(e) {
  if (!drag) return;
  if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 6) return;
  drag.moved = true;
  drag.p.x = drag.x0 + (e.clientX - drag.sx) / stageU; drag.p.y = drag.y0 + (e.clientY - drag.sy) / stageU;
  clampFurn(drag.p);
  drag.el.style.cssText = furnStyle(drag.p);
}
function furnUp() {
  if (!drag) return;
  const d = drag; drag = null;
  if (!decor) return;
  if (d.moved) { Sound.sfx.pop(); save(); return; }
  decor.sel = decor.sel === d.p.id ? null : d.p.id;
  $$('#furn .fi').forEach(x => x.classList.toggle('sel', x.dataset.fid === decor.sel));
}

/* 上楼和下楼：画面和宠物一起换楼层 */
function updateFloorBtn() {
  $('#floor-btn').innerHTML = icon(S.floor === 1 ? 'stairsup' : 'stairsdown') + (S.floor === 1 ? '上楼' : '下楼');
  $('#scene-home').classList.toggle('floor2', S.floor === 2);
}
function goFloor() {
  if (floorBusy || bath) return;
  if (S.sleeping && !gone()) { toast('嘘… 它在睡觉，等它醒了再一起' + (S.floor === 1 ? '上楼' : '下楼') + '吧'); return; }
  floorBusy = true; Sound.sfx.click();
  const z = $('#pet-zone');
  $('#bubble').classList.remove('show'); $('#prop').classList.remove('show');
  z.classList.add('stair');
  setTimeout(() => {
    floorBusy = false;
    if (!S) return;
    S.floor = S.floor === 1 ? 2 : 1;
    if (decor) decor.sel = null;
    updateFloorBtn(); renderFurn(); renderDecorBar(); resetIdle();
    z.classList.remove('stair'); Sound.sfx.pop(); save();
    if (!gone() && !decor) setTimeout(() => { if (S && scene === 'home') say(S.floor === 2 ? pick(['二楼好安静呀~', '从小圆窗能看到好远！']) : '还是楼下热闹~'); }, 600);
  }, 520);
}

/* ---------- 场景切换 ---------- */
let scene = 'home', built = false;
const GAME_COLORS = ['#EBB0A6', '#A9CDD9', '#CBBBDD', '#EBC66B', '#B9CFA0'];
function buildScenes() {
  if (built) return; built = true;
  $('#scene-home .bg.f1').innerHTML = sceneHomeSVG();
  $('#scene-home .bg.f2').innerHTML = sceneAtticSVG();
  $('#scene-garden .bg').innerHTML = sceneGardenSVG();
  $('#scene-play .bg').innerHTML = scenePlaySVG();
  $('#scene-shop .bg').innerHTML = sceneShopSVG();
  $('#tub').innerHTML = tubSVG();
  renderGameCards();
}
function renderGameCards() {
  $('#game-cards').innerHTML = Games.LIST.map((g, i) => `<button class="gcard" data-game="${g.id}" style="background:${GAME_COLORS[i % 5]}">${icon(g.ic)}<b>${g.name}</b><small>${g.desc}</small><i class="lv-tag">${Games.levelName(g.id)}</i></button>`).join('');
}
function fitStage() {
  const st = $('#stage'), W = st.clientWidth, H = st.clientHeight; if (!W || !H) return;
  const u = Math.max(W / 800, H / 500), pu = Math.max(0.3, Math.min(u, (H - 44 * u - 46) / 215));
  st.style.setProperty('--u', u + 'px'); st.style.setProperty('--pu', pu + 'px'); st.style.setProperty('--stH', H + 'px');
  stageU = u;
}
function playSceneMusic() {
  Sound.music({ home: S && S.sleeping ? 'night' : 'home', garden: 'garden', play: 'play', shop: 'shop', album: 'album' }[scene]);
}
function switchScene(n) {
  if (bath) endBath();
  if (decor && n !== 'home') toggleDecor();
  scene = n;
  $$('.scene').forEach(el => el.classList.toggle('active', el.id === 'scene-' + n));
  $$('#nav button').forEach(b => b.classList.toggle('on', b.dataset.scene === n));
  $('#actions').classList.toggle('hide', n !== 'home');
  if (n === 'garden') renderGarden();
  if (n === 'shop') renderShop();
  if (n === 'play') renderGameCards();
  if (n === 'album') { renderAlbum(); Sound.sfx.page(); }
  fitStage(); playSceneMusic();
}

/* ---------- 游戏计时：每玩 15 分钟，强制休息 5 分钟 ----------
 * 计时存在浏览器里，和宠物存档分开：刷新页面、重新领养都绕不过去。
 * 休息的 5 分钟按真实时间算，关掉游戏也照样走；中途离开 5 分钟以上，算已经休息过，重新计时。
 * 休息期间游戏里的时间停住，不掉状态，生病的倒计时也不走。 */
const PLAY_LIMIT = 15 * 60;   // 连续玩多少秒要休息
const COOL_DOWN = 5 * 60;     // 休息多少秒
const TIMER_KEY = 'mengchong_playtimer_v1';
let restOn = false, restTimer = null;
const PT = (() => {
  try { const d = JSON.parse(localStorage.getItem(TIMER_KEY) || 'null'); if (d && typeof d.secs === 'number') return d; } catch (e) { }
  return { secs: 0, last: 0, lockStart: 0, lockUntil: 0, warned: false };
})();
function savePT() { try { localStorage.setItem(TIMER_KEY, JSON.stringify(PT)); } catch (e) { } }
/* 每秒记一次时间；到点了返回 true，表示已经开始休息 */
function playTick(dt) {
  const now = Date.now();
  if (PT.last && now - PT.last > COOL_DOWN * 1000 / SPEED) { PT.secs = 0; PT.warned = false; }   // 已经歇够了，重新计时
  PT.last = now; PT.secs += dt * SPEED;
  const left = PLAY_LIMIT - PT.secs;
  if (left <= 60 && left > 0 && !PT.warned) { PT.warned = true; toast('再玩 1 分钟就到休息时间啦', 4200); }
  if (left <= 0 && (!Games.active || left < -60)) { startRest(); return true; }   // 正在玩小游戏就等这一局结束，最多多等 1 分钟
  if (tickN % 5 === 0) savePT();
  return false;
}
function startRest() {
  if (restOn) return;
  if (Games.active) Games.close();
  closeModal();
  if (bath) endBath();
  if (decor) toggleDecor();
  PT.lockStart = Date.now(); PT.lockUntil = PT.lockStart + COOL_DOWN * 1000 / SPEED;
  PT.secs = 0; PT.warned = false; savePT();
  if (S) save();
  showRest();
}
function showRest() {
  restOn = true; Sound.suspend();
  $('#app').inert = true;
  const el = $('#rest');
  el.innerHTML = `<div class="rest-card"><div class="hero">${S ? petSVG(S.pet.type, 'sleep', S.wear) : icon('eye')}</div>
    <h2>休息时间到啦</h2>
    <p>已经玩了 ${Math.round(PLAY_LIMIT / 60)} 分钟。<br>让眼睛休息一下：站起来动一动，看看窗外远远的地方。</p>
    <div class="rest-clock" id="rest-clock"></div>
    <p class="hint" id="rest-hint">倒计时结束才能继续玩，关掉游戏时间也照样走</p>
    <div class="row"><button class="btn big green" id="rest-go" style="display:none">休息好了，继续玩</button></div></div>`;
  el.classList.add('on');
  $('#rest-go').onclick = endRest;
  clearInterval(restTimer); restTimer = setInterval(updateRest, 500); updateRest();
}
function updateRest() {
  const s = Math.max(0, Math.ceil((PT.lockUntil - Date.now()) / 1000 * SPEED));
  $('#rest-clock').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  if (s > 0) return;
  clearInterval(restTimer);
  $('#rest-hint').textContent = '休息好啦，眼睛亮晶晶~';
  $('#rest-go').style.display = '';
}
function endRest() {
  if (Date.now() < PT.lockUntil) return;
  restOn = false; clearInterval(restTimer);
  const el = $('#rest'); el.classList.remove('on'); el.innerHTML = '';
  $('#app').inert = false;
  PT.secs = 0; PT.warned = false; PT.last = Date.now(); savePT();
  Sound.resume(); lastTick = Date.now();
  if (S) { playSceneMusic(); if (!gone() && !S.sleeping && scene === 'home') say('休息好啦？我们继续玩吧~'); }
}

/* ---------- 时间流逝 ---------- */
let ticker = null, lastTick = 0, tickN = 0;
function stopTicker() { clearInterval(ticker); ticker = null; }
function applyOffline() {
  const real = Math.max(0, (Date.now() - (S.last || Date.now())) / 1000), el = Math.min(real, 8 * 3600);
  if (el < 5) return;
  // 不在线时状态掉得慢，而且最低只掉到 30：回来时宠物没精神，但不会一打开就出现生病的症状
  const st = S.stats, soft = (k, rate) => { st[k] = Math.max(Math.min(st[k], 30), st[k] - el * rate * 0.2); };
  if (!gone()) {
    const slept = S.sleeping;
    if (slept) { st.energy = clamp(st.energy + el * 1.6, 0, 100); if (st.energy >= 100) S.sleeping = false; }
    else soft('energy', 0.03);
    soft('hunger', 0.1); soft('thirst', 0.11); soft('clean', 0.045); soft('happy', 0.06);
    const k = S.sick;
    const restGap = Math.max(0, Math.min(Date.now(), PT.lockUntil) - Math.max(S.last || 0, PT.lockStart)) / 1000;   // 这段离线时间里，有多少是被要求休息的
    if (k && !k.treated) k.age += Math.max(0, real - restGap);   // 生病没吃药就关掉游戏，时间照样算（强制休息的时间除外）
    if (k && k.treated && (ILLS[k.type].rest !== 'sleep' || slept)) k.rest += el;
  }
  S.plots.forEach(p => {
    if (!p || p.growth >= 100) return;
    const eff = Math.min(el, p.water / 100 * 45);
    p.growth = Math.min(100, p.growth + 100 / SEEDS[p.seed].time * eff);
    p.water = Math.max(0, p.water - el * 100 / 45);
  });
  if (S.visitor && Date.now() > S.visitor.until) S.visitor = null;
}
function tick() {
  if (!S || restOn) return;   // 强制休息的时候，游戏里的时间也停住
  const now = Date.now(), dt = clamp((now - lastTick) / 1000, 0, 5); lastTick = now;
  if (playTick(dt)) return;
  const st = S.stats, dec = (k, r) => { st[k] = clamp(st[k] - r * dt, 0, 100); };
  if (gone()) { /* 宠物不在家，家里的状态先不变 */ }
  else if (S.sleeping) {
    st.energy = clamp(st.energy + 1.6 * dt, 0, 100); dec('hunger', 0.03); dec('thirst', 0.03);
    if (st.energy >= 100 && !(S.sick && S.sick.treated && ILLS[S.sick.type].rest === 'sleep')) {
      S.sleeping = false; renderPet(true); updateActions(); playSceneMusic();
      say('睡饱啦！精神满满~'); toast(S.pet.name + ' 睡醒啦');
    }
  } else if (!Games.active) {
    dec('hunger', 0.1); dec('thirst', 0.11); dec('clean', 0.045); dec('happy', 0.06); dec('energy', 0.03);
  }
  tickGarden(dt); tickTrip(); if (S) { tickVisitor(dt); tickSick(dt); }
  updateHUD(); renderPet();
  tickN++;
  if (tickN % 5 === 0) save();
  if (tickN % 16 === 6) autoSay();
  if (tickN % 16 === 14) idleAct();
}


/* ---------- 开始界面 ---------- */
function initTitle() {
  $('#title-pets').innerHTML = Object.keys(PETS).map((k, i) => `<div class="tp" style="animation-delay:${(i * .3).toFixed(2)}s">${petSVG(k, 'happy')}</div>`).join('');
  const has = !!loadState();
  $('#btn-continue').style.display = has ? '' : 'none';
  $('#btn-new').textContent = has ? '重新领养' : '开始领养';
  $('#btn-continue').onclick = () => { Sound.init(); Sound.sfx.click(); S = loadState(); if (S) enterGame(false); else showChoose(); };
  $('#btn-new').onclick = () => {
    Sound.init(); Sound.sfx.click(); Sound.music('home');
    if (has) confirmReset(); else showChoose();
  };
}
let chosen = 'bird';
function showChoose() {
  showScreen('choose'); Sound.music('shop');
  const grid = $('#choose-grid'), inp = $('#pet-name');
  grid.innerHTML = Object.keys(PETS).map(k => `<button class="pcard" data-type="${k}"><div class="pp">${petSVG(k, 'happy')}</div><b>${PETS[k].name}</b><small>${PETS[k].desc}</small></button>`).join('');
  delete inp.dataset.touched;
  const sel = (k, quiet) => {
    chosen = k; $$('.pcard').forEach(c => c.classList.toggle('sel', c.dataset.type === k));
    if (!inp.dataset.touched) inp.value = PETS[k].defName;
    if (!quiet) Sound.sfx[PETS[k].fly ? 'chirp' : 'pop']();
  };
  grid.onclick = e => { const c = e.target.closest('.pcard'); if (c) sel(c.dataset.type); };
  inp.oninput = () => { inp.dataset.touched = '1'; };
  sel('bird', true);
  $('#btn-adopt').onclick = () => {
    Sound.init();
    const name = (inp.value || '').trim().slice(0, 6) || PETS[chosen].defName;
    S = newState(chosen, name); save(); enterGame(true);
  };
}
function enterGame(isNew) {
  showScreen('game'); buildScenes();
  if (!isNew) applyOffline();
  Sound.setOn(S.soundOn !== false);
  petSig = ''; tempMood = null; shopTab = 'food'; albumTab = 'cards';
  decor = null; drag = null; $('#scene-home').classList.remove('decor'); $('#screen-game').classList.remove('decor-on'); $('#pet-zone').classList.remove('stair');
  renderPet(true); updateHUD(); updateActions(); updateSoundBtn(); resetIdle(); renderAway(); updateFloorBtn(); renderFurn(); renderDecorBar(); updateDots(); renderAlert(); switchScene('home');
  // 第一次进屋时，把默认家具挪进这台设备看得见的范围（手机屏幕窄，两边会被裁掉）
  if (!S.furn.fit) { S.furn.put.forEach(clampFurn); S.furn.fit = 1; renderFurn(); }
  stopTicker(); lastTick = Date.now(); ticker = setInterval(tick, 1000);
  if (isNew) {
    confetti(); Sound.sfx.level(); banner('欢迎 ' + S.pet.name + ' 回家');
    say('你好呀！我是' + S.pet.name + '，以后请多多照顾~', 4200);
    setTimeout(() => { if (S) checkDaily(); }, 3000);
  } else {
    if (!gone()) say(pick(['你回来啦！我好想你~', '欢迎回来！今天做点什么呢？']), 3200);
    setTimeout(() => { if (S) checkDaily(); }, 700);
  }
}

/* ---------- 绑定事件 ---------- */
function bindEvents() {
  $('#nav').addEventListener('click', e => { const b = e.target.closest('[data-scene]'); if (b) { Sound.sfx.click(); switchScene(b.dataset.scene); } });
  $('#actions').addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    Sound.sfx.click();
    if (decor && b.dataset.act !== 'decor') { toast('先点“摆好了”，再做别的事'); return; }
    ({ cook: openCook, decor: toggleDecor, feed: openFeed, bath: startBath, sleep: toggleSleep, talent: () => (S.sick && !gone() ? openMeds() : talent()), dress: openWardrobe, travel: openPack })[b.dataset.act]();
  });
  $('#pet').addEventListener('pointerdown', patPet);
  $('#pet-garden').addEventListener('pointerdown', e => { if (!S.sleeping) { floatFx(icon('heart'), e.clientX, e.clientY - 20); Sound.sfx.pop(); } });
  const layer = $('#bath-layer');
  layer.addEventListener('pointermove', bathMove); layer.addEventListener('pointerdown', bathMove);
  layer.addEventListener('click', e => { if (e.target.closest('.bath-x')) endBath(); });
  $('#plots').addEventListener('click', e => { const b = e.target.closest('.plot'); if (b) plotClick(+b.dataset.i); });
  $('#mailbox').onclick = () => openMailbox();
  const furn = $('#furn');
  furn.addEventListener('pointerdown', furnDown); furn.addEventListener('pointermove', furnMove);
  furn.addEventListener('pointerup', furnUp); furn.addEventListener('pointercancel', furnUp);
  furn.addEventListener('click', e => {
    const s = e.target.closest('[data-stow]'), c = e.target.closest('.slot');
    if (s && decor) stowFurn(s.dataset.stow);
    else if (c && !decor) { Sound.sfx.click(); openCardPicker(+c.dataset.slot); }
  });
  $('#floor-btn').onclick = () => goFloor();
  $('#decor-bar').addEventListener('click', e => {
    const p = e.target.closest('[data-place]');
    if (p) placeFurn(p.dataset.place);
    else if (e.target.closest('#decor-done')) { Sound.sfx.click(); toggleDecor(); }
  });
  $('#alert').addEventListener('click', e => { const b = e.target.closest('[data-al]'); if (b) alertAction(b.dataset.al); });
  $('#away-note').addEventListener('click', e => { if (e.target.closest('[data-fetch]')) { Sound.sfx.click(); openFetch(); } else if (e.target.closest('[data-map]')) openMap(); });
  $('#guest').onclick = () => { Sound.sfx.click(); openGuest(); };
  $('#scene-shop').addEventListener('click', e => {
    const t = e.target.closest('.tab'), b = e.target.closest('[data-buy]');
    if (t) { Sound.sfx.click(); shopTab = t.dataset.tab; renderShop(); }
    if (b) { const a = b.dataset.buy.split(':'); buy(a[0], a[1], b); }
  });
  $('#scene-album').addEventListener('click', e => {
    const t = e.target.closest('.tab'), c = e.target.closest('.pc[data-card]');
    if (t) { Sound.sfx.page(); albumTab = t.dataset.tab; renderAlbum(); }
    if (c) {
      Sound.sfx.page(); const id = c.dataset.card;
      openModal(pcHTML(id, 'big') + `<p>${esc(S.pet.name)} 在「${DESTS[id.split(':')[0]].name}」${id.split(':')[1] === 'b' ? '<br>遇见了很难得的风景' : ''}</p>`);
    }
  });
  $('#game-cards').addEventListener('click', e => { const b = e.target.closest('[data-game]'); if (b) { Sound.sfx.click(); Games.open(b.dataset.game); } });
  $('#btn-tasks').onclick = () => { Sound.sfx.click(); openTasks(); };
  $('#btn-menu').onclick = () => { Sound.sfx.click(); openMenu(); };
  $('#btn-music').onclick = () => { S.soundOn = !S.soundOn; Sound.setOn(S.soundOn); updateSoundBtn(); Sound.sfx.click(); save(); };
  window.addEventListener('resize', fitStage);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { save(); savePT(); Sound.suspend(); } else { if (!restOn) Sound.resume(); lastTick = Date.now(); }
  });
  window.addEventListener('pagehide', save);
}

window.addEventListener('DOMContentLoaded', () => {
  $('#svg-defs').innerHTML = '<svg width="0" height="0"><defs>' + FILTER_DEFS + '</defs></svg>';
  $('#title-bg').innerHTML = sceneTitleSVG();
  fillIcons(document);
  bindEvents(); initTitle();
  if (Date.now() < PT.lockUntil) showRest();   // 休息还没结束就刷新或重新打开，接着休息
});
