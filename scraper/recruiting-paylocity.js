const puppeteer = require('puppeteer');

async function scrapeCormint(page, url) {
  const jobDetails = [];

  const jobListingItems = await page.$$('.job-listing-job-item');

  for (const jobItem of jobListingItems) {
    const jobTitle = await jobItem.$eval('.job-item-title a', (element) =>
      element.textContent.trim()
    );

    const jobUrl = await jobItem.$eval('.job-item-title a', (element) =>
      element.getAttribute('href')
    );

    const jobCategory = await jobItem.$eval('.job-item-normal', (element) =>
      element.textContent.trim()
    ).catch(() => ''); // Catch errors in case the element is not found

    const jobLocation = await jobItem.$eval('.location-column', (element) =>
      element.textContent.trim()
    ).catch(() => ''); // Catch errors in case the element is not found

    jobDetails.push({
      title: jobTitle,
      url: url + jobUrl,
      category: jobCategory,
      location: jobLocation,
      type: "",
      company: "Cormint",
      tags: [],
      salary: "",
      applyUrl: "",
    });
  }

  return jobDetails;

}

module.exports = scrapeCormint;