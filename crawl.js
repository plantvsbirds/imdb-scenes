const DIR = `${__dirname}/imdb_frames`
const STATUS_FILE = `${DIR}/status.txt`

Array.prototype.unique = function() {
  return this.filter(function (value, index, self) { 
    return self.indexOf(value) === index;
  });
}

const worker = async (imdb_id) => { //tt0317248
  console.log(`Working on ${imdb_id}`)
  const p = require('puppeteer');
  const wget = require('node-wget-promise');
  const command = require('command');

  const b = await p.launch()
  const page = await b.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36')
  await page.goto(`https://www.imdb.com/title/${imdb_id}/mediaindex?refine=still_frame&ref_=ttmi_ref_sf`)

  const posterMatcher = /https:\/\/ia\.media-imdb\.com\/images\/M\/((?!").)*100,100((?!").)*\.jpg/g
  const pageContent = await page.content()
  const posters = pageContent.match(posterMatcher).map(u => u.split('_V1_')[0] + '_V1_.jpg')

  const fname = (url) => {
    let a = url.split('/')
    return a[a.length - 1]
  }

  await command.open(DIR).exec('mkdir', [imdb_id])
  const DownloadPromiseGenerator = (posterUrl) => wget(posterUrl, { output: `${DIR}/${imdb_id}/${fname(posterUrl)}` })
  console.log(`  requesting ${posters.length} url`)
  return Promise.all([...posters.map(DownloadPromiseGenerator), b.close()])
}

(async () => {
  await worker('tt0317248')
})()