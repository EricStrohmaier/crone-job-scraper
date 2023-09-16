async function scrapeLinkedInjobs(page) {
  await page.waitForSelector("ul");

  const jobLinks = await page.evaluate(() => {
    // Extract the URLs of all job listings
    const links = [];
    const jobElements = document.querySelectorAll("li");

    for (const jobElement of jobElements) {
      const relativeUrl = jobElement.querySelector("div.base-card a");
      if (relativeUrl) {
        const gotoLink = relativeUrl.getAttribute("href");
        const fullUrl = new URL(gotoLink, window.location.href).href;
        console.log("url", fullUrl);
        links.push(fullUrl);
      }
    }

    return links;
  });

  const websiteJobs = [];
  for (const jobLink of jobLinks) {
    await page.goto(jobLink); // Navigate to the job's page

    // Wait for the relevant content to load
    await page.waitForSelector(".core-section-container");

    const jobDetails = await page.evaluate(() => {
      const titleElement = document.querySelector("h1.topcard__title");
      const companyElement = document.querySelector("a.topcard__org-name-link");
      const applyUrlElement = document.querySelector("a.topcard__apply-button");
      const locationElement = document.querySelector(
        ".topcard__flavor--bullet"
      );
      const typeElement = document.querySelector("span.job-criteria__text");
      const descriptionElement = document.querySelector(
        ".description__text--rich"
      );
      const seniorityElement = document.querySelector(
        "li.description__job-criteria-item:nth-child(1) span.description__job-criteria-text--criteria"
      );
      const employmentTypeElement = document.querySelector(
        "li.description__job-criteria-item:nth-child(2) span.description__job-criteria-text--criteria"
      );
      const jobFunctionElement = document.querySelector(
        "li.description__job-criteria-item:nth-child(3) span.description__job-criteria-text--criteria"
      );
      const industriesElement = document.querySelector(
        "li.description__job-criteria-item:nth-child(4) span.description__job-criteria-text--criteria"
      );

      const title = titleElement ? titleElement.textContent.trim() : "";
      const company = companyElement ? companyElement.textContent.trim() : "";
      const applyUrl = applyUrlElement ? applyUrlElement.href : "";
      const location = locationElement
        ? locationElement.textContent.trim()
        : "";
      const type = typeElement ? typeElement.textContent.trim() : "";
      const description = descriptionElement
        ? descriptionElement.textContent.trim()
        : "";
      const seniority = seniorityElement
        ? seniorityElement.textContent.trim()
        : "";
      const employmentType = employmentTypeElement
        ? employmentTypeElement.textContent.trim()
        : "";
      const jobFunction = jobFunctionElement
        ? jobFunctionElement.textContent.trim()
        : "";
      const industries = industriesElement
        ? industriesElement.textContent.trim()
        : "";

      return {
        title,
        company,
        applyUrl,
        location,
        type,
        description,
        seniority,
        employmentType,
        jobFunction,
        industries,
      };
    });

    websiteJobs.push(jobDetails);
  }

  return websiteJobs;
}

module.exports = scrapeLinkedInjobs;
