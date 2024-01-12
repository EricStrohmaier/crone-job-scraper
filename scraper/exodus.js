// const { default: puppeteer } = require("puppeteer");

async function scrapeExodus(page, baseUrl) {

  const sections = await page.$$('section.level-0');

  const jobDetails = [];

  for (const section of sections) {
    const categoryName = await section.$eval('h3', (element) => element.textContent.trim());

    const jobLinks = await section.$$('a[data-mapped="true"]');
    const jobLocations = await section.$$('span.location');

    for (let i = 0; i < jobLinks.length; i++) {
      const jobTitle = await jobLinks[i].evaluate((element) => element.textContent.trim());
      const jobUrl = await jobLinks[i].evaluate((element) => element.getAttribute('href'));
      const jobLocation = await jobLocations[i].evaluate((element) => element.textContent.trim());

      jobDetails.push({
        category: categoryName,
        title: jobTitle,
        url: baseUrl + jobUrl,
        location: jobLocation,
        company: "Exodus",
      });
    }
  }

  return jobDetails;

}

module.exports = scrapeExodus;

// async function main() {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   await page.goto('https://boards.greenhouse.io/exodus54/');
//   const baseUrl = 'https://boards.greenhouse.io';
//   const jobDetails = await scrapeExodus(page, baseUrl);
//   console.log(jobDetails);

//   await browser.close();
// }

// main().catch(console.error);
