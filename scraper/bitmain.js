const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  const page = await browser.newPage();
  await page.goto("https://jobs.bitmain.com/");

  while (true) {
    const rows = await page.$$(".ivu-table-row");

    if (rows.length === 0) {
      break; // No more rows to process
    }

    for (const row of rows) {
      try {
        await row.click();
        await page.waitForNavigation({ waitUntil: "domcontentloaded" });

        const newPageUrl = page.url();
        console.log("URL of the new page:", newPageUrl);

        await page.goBack();
        await page.waitForSelector(".ivu-table-row", { visible: true });
      } catch (error) {
        console.error("Error:", error);
      }
    }
  }

  await browser.close();
})();
