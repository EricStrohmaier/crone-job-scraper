async function scrapeCryptovalley(page, baseUrl) {
  await page.waitForSelector("ul");

  const websiteJobs = await page.evaluate(async (baseUrl) => {
    const jobs = [];

    const jobElements = document.querySelectorAll("ul.jobs li");

    for (const jobElement of jobElements) {
      const title = jobElement.querySelector(".position").textContent.trim();
      const relativeUrl = jobElement.querySelector("a").getAttribute("href");
      const fullUrl = new URL(relativeUrl, window.location.href).href;
      const company = jobElement.querySelector(".company").textContent.trim();
      const location = jobElement
        .querySelector(".location .city")
        .textContent.trim();

      jobs.push({
        title,
        url: fullUrl,
        company,
        location,
      });
    }

    return jobs;
  }, baseUrl);

  return websiteJobs;
}

module.exports = scrapeCryptovalley;
