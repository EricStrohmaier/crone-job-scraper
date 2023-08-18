
async function scrapePompcryptojobs(page) {
    const websiteJobs = await page.evaluate(async () => {
        const jobs = [];
        const jobElements = document.querySelectorAll('article');

        jobElements.forEach((jobElement) => {
            const titleElement = jobElement.querySelector('.listing-item__title a');
            const companyElement = jobElement.querySelector('.listing-item__info--item-company');
            const locationElement = jobElement.querySelector('.listing-item__info--item-location');
            
            if (titleElement && companyElement && locationElement) {
                const title = titleElement.textContent.trim();
                const company = companyElement.textContent.trim();
                const url = titleElement.href;
                const location = locationElement.textContent.trim();

                jobs.push({
                    title,
                    company,
                    url,
                    location
                });
            }
        });

        return jobs;
    });

    return websiteJobs;
}

module.exports = scrapePompcryptojobs;
