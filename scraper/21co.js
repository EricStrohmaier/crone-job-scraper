const puppeteer = require('puppeteer');

async function scrape21co(page, baseUrl) {

  const browser = await puppeteer.launch(
    {
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    },
  );

  const sections = await page.$$("section.level-0");
  const jobDetails = [];

  for (const section of sections) {
    const categoryName = await section.$eval("h3", (element) =>
      element.textContent.trim()
    );

    const jobLinks = await section.$$('a[data-mapped="true"]');
    const jobLocations = await section.$$("span.location");

    for (let i = 0; i < jobLinks.length; i++) {
      const jobTitle = await jobLinks[i].evaluate((element) =>
        element.textContent.trim()
      );
      const jobUrl = await jobLinks[i].evaluate((element) =>
        element.getAttribute("href")
      );
      const jobLocation = await jobLocations[i].evaluate((element) =>
        element.textContent.trim()
      );

      try {
        const jobPage = await browser.newPage(); // Create a new page for each job link
        await jobPage.goto(baseUrl + jobUrl);
        const pageContent = await jobPage.evaluate(
          () => document.body.textContent
        );

        if (
          pageContent.includes("bitcoin") ||
          pageContent.includes("Bitcoin")
        ) {
          jobDetails.push({
            category: categoryName,
            title: jobTitle,
            url: baseUrl + jobUrl,
            location: jobLocation,
            type: "",
            company: "21.co",
            tags: [],
            salary: "",
            applyUrl: "",
          });
        }

        await jobPage.close();

      } catch (error) {
        console.error("Error scraping job data:", error);
      }
    }
  }

  return jobDetails;
}

module.exports = scrape21co;