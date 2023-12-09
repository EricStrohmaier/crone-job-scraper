const puppeteer = require('puppeteer');

async function scrapeJobDetails(page) {
  const jobDetails = await page.evaluate(() => {
    const debug = true; // Set this to true to enable console logs in the browser context

    if (debug) {
      const pageContent = document.body.textContent;
      console.log('pageContent', pageContent);
    }
    const openJobs = document.querySelectorAll('.x-open-positions');
    console.log(openJobs);
    const positions = [];

    // Selecting all department headers
    const departmentHeaders = document.querySelectorAll('.x-open-positions__department-header');

    departmentHeaders.forEach(header => {
      const departmentName = header.textContent.trim();

      // Selecting all cards under the current department header
      const cards = header.nextElementSibling.querySelectorAll('.x-open-positions__card');

      cards.forEach(card => {
        const title = card.querySelector('.x-open-positions__card-body1 h4').textContent.trim();
        const location = card.querySelector('.x-open-positions__card-labeltxt').textContent.trim();
        const salaryRange = card.querySelector('.pay-range').textContent.trim();
        const description = card.querySelector('.x-open-positions__card-body1-txt').textContent.trim();

        positions.push({
          department: departmentName,
          title,
          location,
          salaryRange,
          description,
        });
      });
    });

    return positions;
  });

  return jobDetails;
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://www.exodus.com/careers/');

  const scrapedData = await scrapeJobDetails(page);

  console.log(scrapedData);

  await browser.close();
})();
