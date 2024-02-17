const puppeteer = require('puppeteer');

async function scrapeCoinTelegraph(page, baseUrl) {

    const jobDetails = await page.evaluate((base) => { // Notice the `base` parameter here
        const jobElements = document.querySelectorAll('#job-listings .job-listings-item');
        const jobs = [];

        jobElements.forEach((jobElement) => {
            const titleElement = jobElement.querySelector('.job-details-link');
            const title = titleElement.querySelector('h3')?.textContent.trim();
            const jobUrl = base + titleElement.getAttribute('href');
            const company = jobElement.querySelector('.job-details-secondary-info .job-info-link-item')?.textContent.trim();
            const jobType = jobElement.querySelector('.job-details-info-item a[href*="/jobs/full-time"]')?.textContent.trim();
            const location = jobElement.querySelector('.job-details-info-item a[href*="/jobs/in-"]')?.textContent.trim();
            const salary = jobElement.querySelector('.job-details-info-item')?.nextSibling.textContent.trim();
            const postedDate = jobElement.querySelector('.job-posted-date')?.textContent.trim().replace('ago', '').trim();
            const applyLink = jobElement.querySelector('.apply-button')?.getAttribute('href');

            const tags = Array.from(jobElement.querySelectorAll('.job-tags .job-tag')).map(tag => tag.textContent.trim());

            jobs.push({
                title,
                url: jobUrl,
                company,
                type: jobType,
                location,
                salary,
                date: postedDate,
                applyUrl: base + applyLink,
                tags
            });
        });

        return jobs;
    }, baseUrl);

    return jobDetails;
}
module.exports =  scrapeCoinTelegraph;

// (async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto('https://jobs.cointelegraph.com/jobs?q=bitcoin', { waitUntil: 'networkidle0' });

//     const baseUrl = 'https://jobs.cointelegraph.com'; // Define the base URL here
//     const jobListings = await scrapeJobListings(page, baseUrl);
//     console.log(jobListings);

//     await browser.close();
// })();
