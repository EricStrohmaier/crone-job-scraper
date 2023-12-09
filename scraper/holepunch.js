const puppeteer = require('puppeteer');

async function scrapeHolepunch( page, baseUrl) {
//   const baseUrl = 'https://holepunch.recruitee.com'; // Replace with the actual base URL
  const browser = await puppeteer.launch(
    {
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    },
  );
//   const page = await browser.newPage();

//   // Navigate to the jobs page
//   await page.goto(baseUrl);

  const jobDetails = [];

  // Select all job listing items
  const jobListingItems = await page.$$('.sc-uzptka-1.ifQvfy');

  for (const jobItem of jobListingItems) {
    const jobTitle = await jobItem.$eval('.harIFI', (element) =>
      element.textContent.trim()
    );

    const jobUrl = await jobItem.$eval('.harIFI', (element) =>
      element.getAttribute('href')
    );

    const jobLocation = await jobItem.$eval('.custom-css-style-job-location', (element) =>
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
            console.log("found bitcoin");
          jobDetails.push({
            category: '',
            title: jobTitle,
            url: baseUrl + jobUrl,
            location: jobLocation,
            type: "",
            company: "Holepunch",
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
    // jobDetails.push({
    //   title: jobTitle,
    //   url: baseUrl + jobUrl,
    //   location: jobLocation,
    // });

   return jobDetails;
}

module.exports = scrapeHolepunch;

