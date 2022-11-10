const http = require("http");
const fs = require("fs");
const puppeteer = require("puppeteer");
const { assert } = require("console");

let server;
let browser;
let page;

beforeAll(async () => {
  server = http.createServer(function (req, res) {
    fs.readFile(__dirname + "/.." + req.url, function (err, data) {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
  });

  server.listen(process.env.PORT || 3000);
});

afterAll(() => {
  server.close();
});

beforeEach(async () => {
  browser = await puppeteer.launch();
  page = await browser.newPage();
  await page.goto("http://localhost:3000/index.html");
});

afterEach(async () => {
  await browser.close();
});

describe('the javascript in the script element', () => {
  it('should be cut and moved to the index.js file', async () => {
    const innerHtml = await page.$eval('body script', (script) => {
      return script.innerHTML.trim();
    })
    
    expect(innerHtml).toBe('');
  });
  
  it('should point to the index.js file', async () => {
    const src = await page.$eval('body script', (script) => {
      return script.getAttribute('src');
    })
    
    expect(src).toBe("index.js")
  });
  
  it('should set the result element to 50', async () => {
    const innerHtml = await page.$eval('#result', (result) => {
      return result.innerHTML;
    })
      
    expect(innerHtml).toBe('50');
  });
});

