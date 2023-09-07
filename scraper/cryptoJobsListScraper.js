async function scrapeCryptoJobsList(page) {
  // Get the list of job links
  await page.waitForSelector("ul");

  const jobLinks = await page.evaluate(() => {
    const links = [];
    const jobElements = document.querySelectorAll("li.JobInline_job__W8MWi");

    for (const jobElement of jobElements) {
      const relativeUrl = jobElement.querySelector("a").getAttribute("href");
      const fullUrl = new URL(relativeUrl, window.location.href).href;
      const title = jobElement
        .querySelector("span.JobInline_jobTitle__WWhIDno-underline")
        .textContent.trim();
      const company = jobElement
        .querySelector("a.JobInline_companyName__89Bqd")
        .textContent.trim();
      const tags = Array.from(
        jobElement.querySelectorAll("a.JobInline_jobLocation__RRLul")
      ).map((tag) => tag.textContent.trim());

      links.push({
        url: fullUrl,
        title,
        company,
        tags,
      });
    }

    return links;
  });

  const websiteJobs = [];

  for (const jobLink of jobLinks) {
    try {
      // Navigate to each job's page
      await page.goto(jobLink.url);

      // Wait for the relevant content to load
      await page.waitForSelector(".JobView_description__tW863");

      // Extract job description on the job's page
      let description = await page.evaluate(() => {
        const descriptionElement = document.querySelector(
          ".JobView_description__tW863"
        );
        return descriptionElement ? descriptionElement.textContent.trim() : "";
      });

      // Remove extra spaces and newlines from the description
      description = description.replace(/\s+/g, " ").trim();

      // Add title, company, tags, and description to the job details
      const jobDetails = {
        ...jobLink,
        description,
      };

      websiteJobs.push(jobDetails);
    } catch (error) {
      console.error(`Error scraping job listing: ${error}`);
    }
  }

  return websiteJobs;
}

module.exports = scrapeCryptoJobsList;
