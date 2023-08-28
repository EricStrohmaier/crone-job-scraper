async function scrapeCryptocurrencyjobs(page, baseUrl) {
  await page.waitForSelector("li.ais-Hits-item");
  await page.screenshot({ path: "cryptoshotload.png" });

  const websiteJobs = await page.evaluate(async (baseUrl) => {
    const jobs = [];

    const jobElements = document.querySelectorAll("li.ais-Hits-item");
    await page.screenshot({ path: "cryptoshotelement.png" });

    for (const jobElement of jobElements) {
      const title = jobElement.querySelector("h2 a").textContent.trim();
      const company = jobElement.querySelector("h3 a").textContent.trim();
      const locationElement = jobElement.querySelector("ul li.inline");
      const location = locationElement
        ? locationElement.textContent.trim()
        : "";

      const url = jobElement.querySelector("h2 a").getAttribute("href");
      await page.screenshot({ path: "cryptoshotpush.png" });

      jobs.push({
        title,
        url: new URL(url, baseUrl).href,
        company,
        location,
      });
    }

    return jobs;
  }, baseUrl);
  await page.screenshot({ path: "cryptoshot.png" });

  return websiteJobs;
}

module.exports = scrapeCryptocurrencyjobs;
