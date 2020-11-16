const fs = require('fs');
const japanese = require('encoding-japanese');

const buf = fs.readFileSync('./Resources/KEN_ALL.CSV');
const csv = japanese.convert(buf, {
  from:'SJIS',
  to: 'UNICODE',
  type:'string'
});

const mappingPrefctureCode = (prefecture) => {
  const prefectureMap = [
    {code:1, name:"北海道"},
    {code:2, name:"青森県"},
    {code:3, name:"岩手県"},
    {code:4, name:"宮城県"},
    {code:5, name:"秋田県"},
    {code:6, name:"山形県"},
    {code:7, name:"福島県"},
    {code:8, name:"茨城県"},
    {code:9, name:"栃木県"},
    {code:10, name:"群馬県"},
    {code:11, name:"埼玉県"},
    {code:12, name:"千葉県"},
    {code:13, name:"東京都"},
    {code:14, name:"神奈川県"},
    {code:15, name:"新潟県"},
    {code:16, name:"富山県"},
    {code:17, name:"石川県"},
    {code:18, name:"福井県"},
    {code:19, name:"山梨県"},
    {code:20, name:"長野県"},
    {code:21, name:"岐阜県"},
    {code:22, name:"静岡県"},
    {code:23, name:"愛知県"},
    {code:24, name:"三重県"},
    {code:25, name:"滋賀県"},
    {code:26, name:"京都府"},
    {code:27, name:"大阪府"},
    {code:28, name:"兵庫県"},
    {code:29, name:"奈良県"},
    {code:30, name:"和歌山県"},
    {code:31, name:"鳥取県"},
    {code:32, name:"島根県"},
    {code:33, name:"岡山県"},
    {code:34, name:"広島県"},
    {code:35, name:"山口県"},
    {code:36, name:"徳島県"},
    {code:37, name:"香川県"},
    {code:38, name:"愛媛県"},
    {code:39, name:"高知県"},
    {code:40, name:"福岡県"},
    {code:41, name:"佐賀県"},
    {code:42, name:"長崎県"},
    {code:43, name:"熊本県"},
    {code:44, name:"大分県"},
    {code:45, name:"宮崎県"},
    {code:46, name:"鹿児島県"},
    {code:47, name:"沖縄県"}    
  ];
  const data = prefectureMap.find(x =>x.name === prefecture);
  if (data == null) throw new Error(`都道府県がありませんでした。存在しない都道府県：${prefecture}`);
  return data.code;
}

const remakeTown = (town) => {
  return town.replace(/（.*）|以下に掲載がない場合/g, '');
}

const createInsert = (item) => {
  return `insert into post_code_master (post_code, prefecture_code, city, town) VALUES('${item.postCode}', ${item.prefectureCode}, '${item.city}', '${item.town}');`
}

const rows = csv.replace(/"/g, '').split('\r\n');
const mapper = new Map(rows.map((row, i) => {
  const cells = row.split(',');
  if (cells.length < 9) return [null, null];

  const postCode = cells[2].trim();
  const prefectureCode = mappingPrefctureCode(cells[6].trim());
  const city = cells[7].trim();
  const town = remakeTown(cells[8].trim());

  return [postCode,  {postCode, prefectureCode, city, town}];
}));
mapper.delete(null);
const data = [...mapper.values()];

// JSON形式で一度出力する
fs.writeFile('./dest/post_code.json', JSON.stringify(data, null, 2), (err) => {
  if (err != null) {
    console.log(err);
  }
});

const sql = data.map(x => createInsert(x)).join('\n');
fs.writeFile('./dest/post_code.sql', sql, (err) => {
  if (err != null) {
    console.log(err);
  }
});

