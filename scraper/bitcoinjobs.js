const { default: puppeteer } = require("puppeteer");

async function scrapeBitcoinjobs(page) {
  // Wait for the selector to ensure the elements are loaded
  await page.waitForSelector('.w-dyn-item');

  const jobItems = await page.evaluate(() => {
    const items = [];
    const jobElements = document.querySelectorAll('.w-dyn-item'); // Select the wrapper elements

    jobElements.forEach((element) => {
      const jobItem = {};

      const linkBlock = element.querySelector('.link-block');
      if (!linkBlock) {
        console.error('Link block not found');
        return;
      }
      
      // Extracting the href from the anchor tag wrapping the job card
      const jobLink = linkBlock.getAttribute('href');
      const baseUrl = 'https://bitcoinjobs.com';
      jobItem.url = baseUrl + jobLink;

      const jobCard = element.querySelector('.job-card');
      if (!jobCard) {
        console.error('Job card not found');
        return;
      }

      const jobName = jobCard.querySelector('.job-name');
      const jobCompany = jobCard.querySelector('.job-company');
      const locationText = jobCard.querySelector('.categories-text');

      jobItem.title = jobName ? jobName.textContent.trim() : '';
      jobItem.company = jobCompany ? jobCompany.textContent.trim() : '';
      jobItem.location = locationText ? locationText.textContent.trim() : '';

      const tags = [];
      const tagElements = jobCard.querySelectorAll('.categories-text');
      tagElements.forEach((tagElement) => {
        if (tagElement) {
          tags.push(tagElement.textContent.trim());
        }
      });

      jobItem.type = tags.length >= 2 ? tags[1] : '';
      jobItem.tags = tags.length >= 1 ? [tags[tags.length - 1]] : [];

      items.push(jobItem);
    });

    return items;
  });

  return jobItems;
}

module.exports = scrapeBitcoinjobs;

// async function main() {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   await page.goto('https://bitcoinjobs.com/');
//   const jobDetails = await scrapeBitcoinjobs(page);
//   console.log(jobDetails);

//   await browser.close();
// }

// main().catch(console.error);
