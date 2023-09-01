async function scrapeCryptoJobsList(page, baseURL) {
  const websiteJobs = await page.evaluate(async (baseURL) => {
    const jobs = [];

    // Select all the job listing elements
    const jobElements = document.querySelectorAll(
      "li.JobPreviewInline_JobPreviewInline__uAIxU"
    ); // Adjust the selector to match your job elements

    // Loop through each job element and extract the desired data
    for (const jobElement of jobElements) {
      // Extract job title and href directly from the <a> element
      const titleElement = jobElement.querySelector(
        "a.JobPreviewInline_jobTitle__WYzmv"
      );
      const title = titleElement.textContent.trim();
      const companyElement = jobElement.querySelector(
        "a.JobPreviewInline_companyName__5ffOt"
      );
      const company = companyElement.textContent.trim();
      const locationElement = jobElement.querySelector(
        "span.JobPreviewInline_jobLocation__dV9Hp"
      );
      const location = locationElement.textContent.trim();
      const relativeHref = titleElement.getAttribute("href");

      // Create a job object with title and full URL properties
      const job = {
        company,
        location,
        title,
        href: baseURL + relativeHref, // Combine relative href with the base URL
      };

      // Add the extracted job data to the jobs array
      jobs.push(job);
    }

    return jobs;
  }, baseURL);

  return websiteJobs;
}

module.exports = scrapeCryptoJobsList;
