//no keywords needed
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate to the page
  await page.goto('https://careers.bitrefill.com/jobs');

  // Wait for the list of job items to load (you may need to adjust the selector and timing)
  await page.waitForSelector('#jobs_list_container');

  // Extract job items
  const jobItems = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('#jobs_list_container li'));
    return items.map(item => {
      const link = item.querySelector('a');
      const title = link.querySelector('.text-block-base-link').getAttribute('title');
      const href = link.getAttribute('href');
      const tags = Array.from(item.querySelectorAll('.text-md span')).map(tag => tag.textContent.trim());
      return {
        title,
        href,
        tags,
      };
    });
  });

  console.log(jobItems);

  // Close the browser
  await browser.close();
})();
