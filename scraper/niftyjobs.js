async function scrapeNiftyjobs(page) {
    await page.waitForSelector('div.chakra-accordion__item');

    const websiteJobs = await page.evaluate(() => {
        const jobs = [];
        const jobElements = document.querySelectorAll('div.chakra-accordion__item');

        for (const jobElement of jobElements) {
            const titleElement = jobElement.querySelector('.css-10q1qp1 .css-1kz8jo9');
            const companyElement = jobElement.querySelector('.css-10q1qp1 .css-e3zsqy');
            const applyLinkElement = jobElement.querySelector('a.chakra-link');
            const dectriptionElement = jobElement.querySelector('.chakra-accordion__panel .css-q4evbo');

            if (titleElement && companyElement && applyLinkElement) {
                const title = titleElement.textContent.trim();
                const company = companyElement.textContent.trim();
                const url = applyLinkElement.href;
                // const description =  dectriptionElement ?  dectriptionElement.textContent.trim() : '';

                jobs.push({
                    title,
                    company,
                    url,
                    // description
                });
            } else {
                console.log('Missing data for an element');
            }
        }

        return jobs;
    });

    await page.screenshot({ path: 'screenshotniftyjob.png' });

    return websiteJobs;
}

module.exports = scrapeNiftyjobs;
