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
  it('should contain a single line comment that comments out line 14', async () => {
    const matches = await page.$eval('body script', (script) => {
      return script.innerHTML.match(/\/\/.*total = total - 2;/g).length
    });
    
    expect(matches).toBe(1);
  });

  it('should contain a multi-line comment that comments out lines 16, 17 and 18', async () => {
    const matches = await page.$eval('body script', (script) => {
      return script.innerHTML.match(/\/\*[\s\S][^\*\/]*total = total - 4;[\s\S][^\*\/]*total = total - 5;[\s\S][^\*\/]*total = total - 6;[\s\S]*\*\//g).length
    });  
      
    expect(matches).toBe(1);
  });

  it('should set the result element to 39', async () => {
    const result = await page.$eval('#result', (result) => {
      return result.innerHTML;
    });
      
    expect(result).toBe('39');
  });
});
