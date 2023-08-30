async function scrapeCryptocurrencyjobs(page, baseUrl) {
  await page.waitForSelector("li.ais-Hits-item", { timeout: 60000 }); // Increase timeout to 60

  const websiteJobs = await page.evaluate(async (baseUrl) => {
    const jobs = [];

    const jobElements = document.querySelectorAll("li.ais-Hits-item");

    for (const jobElement of jobElements) {
      const titleElement = jobElement.querySelector("h2 a");
      const companyElement = jobElement.querySelector("h3 a");
      const locationElement = jobElement.querySelector("ul li.inline");
      const urlElement = titleElement;

      if (titleElement && companyElement && locationElement && urlElement) {
        const title = titleElement.textContent.trim();
        const company = companyElement.textContent.trim();
        const location = locationElement.textContent.trim();
        const url = new URL(urlElement.getAttribute("href"), baseUrl).href;

        jobs.push({
          title,
          url,
          company,
          location,
        });
      }
    }

    return jobs;
  }, baseUrl);

  return websiteJobs;
}

module.exports = scrapeCryptocurrencyjobs;
