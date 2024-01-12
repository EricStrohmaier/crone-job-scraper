// const puppeteer = require("puppeteer");

async function f2poolscraper(page, baseUrl) {
    try {
        await page.waitForSelector('div.jobs-list');

        const jobDetails = await page.evaluate((baseUrl) => { // Pass baseUrl as an argument here
            const jobsList = document.querySelector('div.jobs-list');
            const jobElements = jobsList.querySelectorAll('a.job');
            const jobCategories = jobsList.querySelectorAll('div.dep-name');

            let currentCategory = '';
            const jobDetailsArray = [];

            jobElements.forEach((jobElement, index) => {
                if (jobCategories[index]) {
                    currentCategory = jobCategories[index].textContent.trim();
                }

                const title = jobElement.querySelector('.job-name').textContent.trim();
                const location = jobElement.querySelector('.place').textContent.trim();
                const joburl = jobElement.getAttribute('href');
                const url = baseUrl + joburl;
                const company = 'F2 Pool';

                jobDetailsArray.push({ category: currentCategory, title, location, url, company });
            });

            return jobDetailsArray;
        }, baseUrl);

        return jobDetails;
    } catch (error) {
        console.log('Error scraping job details:', error);
        return [];
    }
}

module.exports = f2poolscraper;


// async function main() {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     await page.goto('https://www.f2pool.com/joinus');
//     const baseUrl = 'https://www.f2pool.com';
//     const jobDetails = await f2poolscraper(page, baseUrl);
//     console.log(jobDetails);

//     await browser.close();
// }

// main().catch(console.error);
