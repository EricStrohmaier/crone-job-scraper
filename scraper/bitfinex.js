const puppeteer = require("puppeteer");

const url = "https://bitfinex.recruitee.com/";

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://bitfinex.recruitee.com/");

  const jobLinks = await page.$$eval(".job-title a", (elements) =>
    elements.map((element) => element.getAttribute("href"))
  );

  for (const link of jobLinks) {
    await page.goto(url + link);
    const pageContent = await page.evaluate(() => document.body.textContent);


    if (pageContent.includes("bitcoin") || pageContent.includes("Bitcoin")) {
      console.log(`'bitcoin' found on ${link}`);

      await page.waitForSelector(".info-container");

      // Use page.evaluate to extract the title and li text content
      const jobInfo = await page.evaluate(() => {
        const title = document.querySelector(".info h2").textContent;
        const liText = document.querySelector(".info li").textContent;
        return { title, liText };
      });
      console.log("Job Lik:",url + link);
      console.log("Title:", jobInfo.title);
      console.log("LI Text Content:", jobInfo.liText);
    } else {
      console.log(`'bitcoin' not found on ${link}`);
    }
    await page.goBack();
  }

  await browser.close();
})();
