const puppeteer = require("puppeteer");

async function scrapeCustodiaBank(page) {
    const jobDetails = await page.evaluate(() => {
        let jobs = [];
        const postingsGroup = document.querySelectorAll('.postings-group');

        postingsGroup.forEach(group => {
            const category = group.querySelector('.posting-category-title').textContent.trim();
            const postings = group.querySelectorAll('.posting');

            postings.forEach(posting => {
                const title = posting.querySelector('h5[data-qa="posting-name"]').textContent.trim();
                const location = posting.querySelector('.sort-by-location').textContent.trim();
                const type = posting.querySelector('.sort-by-commitment').textContent.trim();
                const url = posting.querySelector('.posting-apply a').href.trim();

                jobs.push({
                    category,
                    company: "Custodia Bank",
                    title,
                    location,
                    type,
                    url
                });
            });
        });

        return jobs;
    });

    return jobDetails;
}
module.exports = scrapeCustodiaBank;

// async function main() {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     const baseUrl = 'https://jobs.lever.co/custodiabank'; // Replace with the actual URL

//     await page.goto(baseUrl, { waitUntil: 'networkidle2' });
//     const jobDetails = await scrapeCustodiaBank(page);
//     console.log(jobDetails);

//     await browser.close();
// }

// main().catch(console.error);
