const cheerio = require('cheerio');
const rp = require('request-promise');
const fs = require('fs');

const ARCHILLECT = 'http://archillect.com';
const FOLDER_PREFIX = './images/';

const getIndex = async () => {
  try {
    const result = await rp(ARCHILLECT);
    return result;
  }
  catch (err) {
    return false;
  }
}

const getImageSrc = async (image) => {
  try {
    const result = await rp(ARCHILLECT + image);
    const $ = cheerio.load(result);
    return $('img#ii').attr('src');
  } catch (err) {
    return false;
  }
};

const downloadImage = async (filename, src) => {
  try {
    const path = `${FOLDER_PREFIX}${filename}.jpg`;
    if (fs.existsSync(path)) {
      console.log(`File ${path} already exists!`);
      return false;
    }
    const options = {
      url: src,
      encoding: null,
      gzip: true
    }
    const result = await rp(options);
    fs.writeFileSync(`${path}`, result, 'binary');
    console.log(`Successfully wrote: ${path}`);
  } catch (err) {
    console.log(`downloadImage(${filename}) error: ${err}`);
    return false;
  }
}

const main = async () => {
  console.log('Getting archillect.com...');
  const index = await getIndex();

  console.log('Parsing results...');
  const $ = cheerio.load(index);
  const items = $('#container a');
  const links = items.map(function(i, el) {
    // this === el
    return $(el).attr('href');
  }).get();

  links.forEach(async (e) => {
    console.log(`Downloading ${e}...`);
    const src = await getImageSrc(e);
    downloadImage(
      e.replace('/',''),
      src
    );
  });
};

main();
