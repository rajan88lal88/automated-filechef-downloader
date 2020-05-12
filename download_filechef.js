let puppeteer = require("puppeteer");
let fs = require("fs")
let http = require("http")
let https = require("https")
let song = process.argv[3];
let catagory=process.argv[2];
//catogories: audio , video, application, text, image
(async function () {
  let browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["start--maximized", "--disable-notifications"]
  });
  console.log(song)
  let pages = await browser.pages();
  let page = pages[0];
  await page.setDefaultNavigationTimeout(0);
  await page.goto("https://www.filechef.com/search?filetype="+catagory+"&page=1&query=" + song)
  console.log("page loaded")
  await page.waitForSelector("body > div.container > div.card > div.row > div.col-lg-9.col-sm-12.col-xs-12.col-md-9 > div > div")
  let target = await page.$("body > div.container > div.card > div.row > div.col-lg-9.col-sm-12.col-xs-12.col-md-9 > div > div:nth-child(1) > div > a");
  let link = await page.evaluate(function (el) {
    return el.getAttribute("href");
  }, target);
  console.log("got song page link");
  await page.goto(link)
  // await page.waitForNavigation();
  console.log("song page opened")
  await page.waitForSelector("body > div.container > div.card.text-center > div:nth-child(1)");
  let button = await page.$("body > div.container > div.card.text-center > div:nth-child(1) > div.col-lg-9.col-sm-12.col-xs-12.col-md-9 > a");
  link = await page.evaluate(function (el) {
    return el.getAttribute("href");
  }, button);
  let ext="";
  for(let i=link.length-1;link[i]!=".";i--)
  {
    ext=link[i]+ext;
  }
  console.log(ext)
  if (link[4] == 's')
    result = await download_https(link, song + "."+ext);
  else
    result = await download_http(link, song + "."+ext);
  // result = true;
  if (result === true) {
    console.log('Success:', link, 'has been downloaded successfully.');
  } else {
    console.log('Error:', link, 'was not downloaded.');
    console.error(result);
  }

  // await page.close();
})()
const download_https = (url, destination) => new Promise((resolve, reject) => {
  const file = fs.createWriteStream(destination);
  https.get(url, response => {
    response.pipe(file);
    file.on('finish', () => {
      file.close(resolve(true));
    });
  }).on('error', error => {
    fs.unlink(destination);
    reject(error.message);
  });
});

const download_http = (url, destination) => new Promise((resolve, reject) => {
  const file = fs.createWriteStream(destination);
  http.get(url, response => {
    response.pipe(file);
    file.on('finish', () => {
      file.close(resolve(true));
    });
  }).on('error', error => {
    fs.unlink(destination);
    reject(error.message);
  });
});