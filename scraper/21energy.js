const puppeteer = require('puppeteer');

 async function scrape21Energy(page) {
    await page.waitForSelector('.collapsible-content-box .collapsible-content-block');

    const jobDetails = await page.evaluate(() => {
        const blocks = document.querySelectorAll('.collapsible-content-box .collapsible-content-block');
        const jobs = [];

        blocks.forEach(block => {
            const title = block.querySelector('.collapsible-content-block__heading')?.textContent.trim();
            const descriptionElements = block.querySelectorAll('.collapsible-content-block__description p');
            let description = '';
            let goals = [];
            let youHave = [];
            let youWill = [];
            let applicationLink = '';

            descriptionElements.forEach((element, index) => {
                if (element.querySelector('a')) {
                    applicationLink = element.querySelector('a').href;
                } else if (element.textContent.startsWith('Goals:')) {
                    goals = Array.from(element.nextElementSibling.querySelectorAll('li')).map(li => li.textContent.trim());
                } else if (element.textContent.startsWith('You Have:')) {
                    youHave = Array.from(element.nextElementSibling.querySelectorAll('li')).map(li => li.textContent.trim());
                } else if (element.textContent.startsWith('You Will:')) {
                    youWill = Array.from(element.nextElementSibling.querySelectorAll('li')).map(li => li.textContent.trim());
                } else if (!element.textContent.startsWith('Goals:') && !element.textContent.startsWith('You Have:') && !element.textContent.startsWith('You Will:')) {
                    description += `${element.textContent.trim()}\n\n`;
                }
            });

            jobs.push({
                title,
                description: description.trim(),
                goals,
                experience: youHave,
                youWill,
                applyUrl: applicationLink,
                company: '21 Energy',
                url: 'https://21energy.com/pages/careers#jobs'
            });
        });

        return jobs;
    });

    return jobDetails;
}
module.exports = scrape21Energy;

// (async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto('https://21energy.com/pages/careers#jobs', { waitUntil: 'networkidle0' });

//     const jobOpenings = await scrape21Energy(page);
//     console.log(jobOpenings);

//     await browser.close();
// })();
