import fs from 'fs/promises';
import AbortController from 'abort-controller';
import fetch from 'node-fetch';
import dwAudio from './audio.js';

const controller = new AbortController();
// 30 秒后取消请求
const timeout = setTimeout(
  () => { controller.abort(); },
  30000,
);

const urlMap = {
  HK: 'https://rthk.hk/rthk/news/rss/c_expressnews_clocal.xml',
  ZH: 'https://rthk.hk/rthk/news/rss/c_expressnews_greaterchina.xml',
  NT: 'https://rthk.hk/rthk/news/rss/c_expressnews_cinternational.xml',
  FI: '	https://rthk.hk/rthk/news/rss/c_expressnews_cfinance.xml',
};

async function initDir() {
  await fs.rmdir('./dist', { recursive: true });
  console.log(`successfully deleted ./dist`);

  await fs.mkdir('./dist');
  console.log(`successfully create ./dist`);
  
  await fs.mkdir('./dist/audio');
  console.log(`successfully create ./dist/audio`);
}

async function request(obj) {
  const response = await fetch(obj.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10130',
      signal: controller.signal
    },
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error('wrong status code');
  }

  await fs.writeFile(`./dist/rss_${obj.key}.xml`, await response.text());
  console.log(`successfully write rss_${obj.key}.xml`);
}

async function main() {
  await initDir();

  Object.keys(urlMap).forEach(async (item) => {
    await request({
      key: item,
      url: urlMap[item]
    })
    .catch(err => {
      console.log(err);
      process.exit(1);
    })
    .finally(() => {
      clearTimeout(timeout);
    });
  });
  await dwAudio();
}

main();