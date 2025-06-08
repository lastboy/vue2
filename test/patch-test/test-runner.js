const puppeteer = require('puppeteer')
const path = require('path')

async function runTest(file) {
    console.log(`\n -------------> Loading test file: ${file}\n`);
  const browser = await puppeteer.launch({
    args: ['--allow-file-access-from-files']
  })
  const page = await browser.newPage()

  page.on('console', msg => console.log(`[${file}]`, msg.text()))
  await page.goto('file://' + path.resolve(__dirname, file), {
    waitUntil: 'load'
  })
  await new Promise(res => setTimeout(res, 1000))

  await browser.close()
}

;(async () => {
  await runTest('patched-namespace.html')
  await runTest('not-patched.html')
  await runTest('patched.html')
})()
