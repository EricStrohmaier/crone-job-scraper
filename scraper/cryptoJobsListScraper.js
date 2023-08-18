async function scrapeCryptoJobsList(page, baseURL) {
    const websiteJobs = await page.evaluate(async (baseURL) => {
        const jobs = [];

        // Select all the job listing elements
        const jobElements = document.querySelectorAll('li.JobPreviewInline_JobPreviewInline__uAIxU');

        // Loop through each job element and extract the desired data
        for (const jobElement of jobElements) {
            const titleElement = jobElement.querySelector('a.JobPreviewInline_jobTitle__WYzmv');
            const companyElement = jobElement.querySelector('a.JobPreviewInline_companyName__5ffOt');
            const locationElement = jobElement.querySelector('span.JobPreviewInline_jobLocation__dV9Hp');
            const relativeHref = titleElement.getAttribute('href');

            if ( titleElement && companyElement && locationElement && relativeHref ) {
                // Extract the job data
                const job = {
                    title: titleElement.textContent.trim(),
                    company: companyElement.textContent.trim(),
                    location: locationElement.textContent.trim(),
                    url: baseURL + relativeHref
                };
    
                // Add the extracted job data to the jobs array
                jobs.push(job);
            } else {
                console.log('Missing job data');
            }
           
        }

        return jobs;
    }, baseURL);

    return websiteJobs;
}

module.exports = scrapeCryptoJobsList;
