const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto('https://www.crypto-careers.com/jobs/search?d=&l=&lat=&long=&q=bitcoin');

  const data = await page.evaluate(() => {
    const jobList = document.querySelectorAll('.job-listing');
    const results = [];

    jobList.forEach((job) => {
      const title = job.querySelector('.jobList-title').textContent;
      const company = job.querySelector('.jobList-introMeta > li:nth-child(1)').textContent;
      const location = job.querySelector('.jobList-introMeta > li:nth-child(2)').textContent;
      const date = job.querySelector('.jobList-date').textContent;

      results.push({
        title,
        company,
        location,
        date,
      });
    });

    return results;
  });

  console.log(data);

  await browser.close();
})();
