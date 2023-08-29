async function scrapeHirevibes(page, baseUrl) {
    const websiteJobs = await page.evaluate(async (baseUrl) => {
        const jobs = [];
        const jobElements = document.querySelectorAll('div.column');

        for (const jobElement of jobElements) {
            const titleElement = jobElement.querySelector('h2.job-title');
            const companyElement = jobElement.querySelector('p.company a');
            const locationElement = jobElement.querySelector('span.location');

            if (titleElement && companyElement && locationElement) {
                const title = titleElement.textContent.trim();
                const company = companyElement.textContent.trim();
                const location = locationElement.textContent.trim();
                const url = companyElement.getAttribute('href');

                jobs.push({
                    title,
                    url: baseUrl + url,
                    company,
                    location
                });
            } else {
                console.log('Missing job data for an element');
            }
        }

        return jobs;
    }, baseUrl);

    return websiteJobs;
}

module.exports = scrapeHirevibes;
