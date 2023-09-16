async function scrapeCryptocurrencyjobs(page, baseUrl) {
  await page.waitForSelector("li.ais-Hits-item", { timeout: 60000 }); // Increase timeout to 60 seconds

  const websiteJobs = await page.evaluate(async (baseUrl) => {
    const jobs = [];

    const jobElements = document.querySelectorAll("li.ais-Hits-item");

    for (const jobElement of jobElements) {
      const titleElement = jobElement.querySelector("h2 a");
      const companyElement = jobElement.querySelector("h3 a");
      const locationElement = jobElement.querySelector("ul li.inline");
      const urlElement = titleElement;

      if (titleElement) {
        const title = titleElement.textContent.trim();
        const company = companyElement ? companyElement.textContent.trim() : "";
        const location = locationElement
          ? locationElement.textContent.trim()
          : "";
        const url = new URL(urlElement.getAttribute("href"), baseUrl).href;

        // Extract additional data
        const additionalDataElement =
          jobElement.querySelector("div.col-start-1");
        if (additionalDataElement) {
          const details = additionalDataElement.textContent.trim();
          const detailsArray = details.split("·").map((item) => item.trim());
          const category = detailsArray[1];
          const type = detailsArray[3];
          const salary = detailsArray[5];
          const tagsElement = jobElement.querySelectorAll("ul li");
          const tags = Array.from(tagsElement).map((tagElement) =>
            tagElement.textContent.trim()
          );
          const applyUrl = {};

          jobs.push({
            title,
            company,
            location,
            url,
            applyUrl,
            category,
            type,
            salary,
            tags,
          });
        } else {
          jobs.push({
            title,
            company,
            location,
            url,
          });
        }
      }
    }

    return jobs;
  }, baseUrl);

  return websiteJobs;
}

module.exports = scrapeCryptocurrencyjobs;
