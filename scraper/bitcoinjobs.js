const { default: puppeteer } = require("puppeteer");

async function scrapeBitcoinjobs(page) {
  const jobItems = await page.evaluate(() => {
    const items = [];
    const URL = document.querySelector('.link-block').getAttribute('href');
    const jobCards = document.querySelectorAll('.job-card');

    jobCards.forEach((card) => {
      const jobItem = {};
      const jobName = card.querySelector('.job-name');
      const jobCompany = card.querySelector('.job-company');
      const locationText = card.querySelector('.categories-text');
      const baseUrl = 'https://bitcoinjobs.com'
      jobItem.title = jobName.textContent.trim();
      jobItem.company = jobCompany.textContent.trim();
      jobItem.location = locationText.textContent.trim();
      jobItem.url = baseUrl + URL;  // Concatenate baseUrl with jobLink

      const tags = [];
      const tagElements = card.querySelectorAll('.categories-text');
      tagElements.forEach((tagElement) => {
        tags.push(tagElement.textContent.trim());
      });

      // Add the second tag to the 'type' field
      if (tags.length >= 2) {
        jobItem.type = tags[1];
      } else {
        jobItem.type = "";
      }

      // Add the last tag to the 'tags' field
      if (tags.length >= 1) {
        jobItem.tags = [tags[tags.length - 1]];
      } else {
        jobItem.tags = [];
      }

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
