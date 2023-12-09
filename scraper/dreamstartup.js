const puppeteer = require('puppeteer');

async function scrapeDreamStartupJob(page) {
  const jobDetails = [];

  const jobListingItems = await page.$$('.listing-item__jobs');

  for (const jobItem of jobListingItems) {
    const jobTitle = await jobItem.$eval('.listing-item__title a', (element) =>
      element.textContent.trim()
    );

    const jobUrl = await jobItem.$eval('.listing-item__title a', (element) =>
      element.getAttribute('href')
    );

    const companyName = await jobItem.$eval('.listing-item__info--item-company', (element) =>
      element.textContent.trim()
    );

    const jobLocation = await jobItem.$eval('.listing-item__info--item-location', (element) =>
      element.textContent.trim()
    );

    const jobDate = await jobItem.$eval('.listing-item__date', (element) =>
      element.textContent.trim()
    );

    const jobDescription = await jobItem.$eval('.listing-item__desc', (element) =>
      element.textContent.trim().replace(/\s+/g, " ")
    );
 
  

    jobDetails.push({
      title: jobTitle,
      url: jobUrl,
      company: companyName,
      location: jobLocation,
      date: jobDate,
      description: jobDescription,
    });
  }

  return jobDetails;
}

module.exports = scrapeDreamStartupJob;

// (async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   // Replace 'YOUR_URL' with the actual URL of the page containing the job listings
//   await page.goto('https://dreamstartupjob.com/jobs/?q=bitcoin&l=&industry=Cryptocurrency');

//   const scrapedData = await scrapeDreamStartupJob(page);

//   console.log(scrapedData);

//   await browser.close();
// })();
