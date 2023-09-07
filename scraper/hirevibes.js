async function scrapeHirevibes(page, baseUrl) {
  const websiteJobs = await page.evaluate(async (baseUrl) => {
    const jobs = [];
    const jobElements = document.querySelectorAll("div.card.job");

    for (const jobElement of jobElements) {
      const titleElement = jobElement.querySelector("h2.job-title");
      const companyElement = jobElement.querySelector("p.company a");
      const locationElement = jobElement.querySelector("span.location");
      const salaryElement = jobElement.querySelector("h2.is-salary");
      // const tagsElements = jobElement.querySelectorAll("div.segment.has-tooltip strong");

      if (titleElement && companyElement && locationElement) {
        const title = titleElement.textContent.trim();
        const company = companyElement.textContent.trim();
        const location = locationElement.textContent.trim();
        const url = companyElement.getAttribute("href");
        let salary = "";
        // const tags = [];

        if (salaryElement) {
          salary = salaryElement.textContent.trim().replace(/\s+/g, " ");
        }

        // tagsElements.forEach((tagElement) => {
        //   tags.push(tagElement.textContent.trim());
        // });

        jobs.push({
          title,
          url: baseUrl + url,
          company,
          location,
          salary,
          // tags,
        });
      } else {
        console.log("Missing job data for an element");
      }
    }

    return jobs;
  }, baseUrl);

  return websiteJobs;
}

module.exports = scrapeHirevibes;
