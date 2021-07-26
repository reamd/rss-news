import fs from 'fs/promises';
import ffmpeg from 'fluent-ffmpeg';
import cheerio from 'cheerio';
import fetch from 'node-fetch';

async function download(params) {
  const command = ffmpeg(params.url);

  await new Promise((resolve, reject) => {
    command
    .on('start', () => { console.log('Processing started !'); })
    .on('progress', (progress) => { console.log('Processing: ' + Math.floor(progress.percent) + '% done'); })
    .on('end', () => {
      resolve();
    })
    .on('error', (err) => { 
      console.log('An error occurred: ' + err.message); 
      reject();
    })
    .audioCodec('libmp3lame')
    .audioBitrate('320')
    .mergeToFile(`./dist/audio/latest.mp3`, './temp_dist');  
  });

}

async function getLastOriUri() {
  const response = await fetch('https://news.rthk.hk/rthk/ch/pth-news.htm', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10130'
    },
  });

  const $ = cheerio.load(await response.text());
  const parent = $('#avatar-pos-main-body-top .news');
  const date = parent.find('.title_date').text().trim();
  const tName = $(parent.find('.item')[0]).find('.title').text().trim().split(' ')[1];
  const url = $(parent.find('.item')[0]).find('.listenbuttondiv').find('span').text().trim();

  await fs.writeFile(`./dist/audio/date.json`, JSON.stringify({
    date,
  }));

  return {
    name: tName.replace(':', '_'),
    url
  }
}

async function main () {
  const pObj = await getLastOriUri();
  await download(pObj);
  console.log('finish');
}

export default main;
