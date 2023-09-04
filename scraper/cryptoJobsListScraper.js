async function scrapeCryptoJobsList(page, baseUrl) {
  // Get the list of job links
  const jobLinks = await page.evaluate(() => {
    const links = [];
    const jobElements = document.querySelectorAll(
      "li.JobPreviewInline_JobPreviewInline__uAIxU"
    );

    for (const jobElement of jobElements) {
      const relativeUrl = jobElement.querySelector("a").getAttribute("href");
      const fullUrl = new URL(relativeUrl, window.location.href).href;
      links.push(fullUrl);
    }

    return links;
  });

  const websiteJobs = [];

  for (const jobLink of jobLinks) {
    // Navigate to each job's page
    await page.goto(jobLink);

    // Wait for the relevant content to load
    await page.waitForSelector(".job-box");

    // Extract job details on the job's page
    const jobDetails = await page.evaluate(async (baseUrl) => {
      const title = document
        .querySelector("span.JobPreviewInline_jobTitle__WYzmv")
        .textContent.trim();
      const company = document
        .querySelector("a.JobPreviewInline_companyName__5ffOt")
        .textContent.trim();
      const location = document
        .querySelector("span.JobPreviewInline_jobLocation__dV9Hp")
        .textContent.trim();
      const url = window.location.href; // Use the current page's URL

      return {
        title,
        url,
        company,
        location,
      };
    }, baseUrl);

    websiteJobs.push(jobDetails);
  }

  return websiteJobs;
}

module.exports = scrapeCryptoJobsList;
