async function scrapeHirevibes(page, baseUrl) {
  console.log("Scraping job  Hirevibes links...");
  const jobLinks = await page.evaluate(async (baseUrl) => {
    const links = [];
    const jobElements = document.querySelectorAll("div.card.job");

    for (const jobElement of jobElements) {
      const relativeUrl = jobElement
        .querySelector("div.media-left a")
        .getAttribute("href");

      if (relativeUrl) {
        const fullUrl = new URL(relativeUrl, window.location.href).href;
        links.push(fullUrl);
      }
    }
    return links;
  });

  const websiteJobs = [];

  for (const link of jobLinks) {
    console.log(`Navigating to ${link}...`);
    await page.goto(link);

    const jobInfo = await page.evaluate(async () => {
      await page.waitForSelector("p.title.is-4");

      const titleElement = document.querySelector("p.title.is-4");
      const typeElement = document.querySelector("p.break-text");
      const companyElement = document.querySelector("strong.content-title");
      const locationElement = document.querySelector("span.content-subtitle");
      const descriptionElement = document.querySelector(
        "div.toastui-editor-contents"
      );

      const title = titleElement ? titleElement.textContent.trim() : "";
      const type = typeElement ? typeElement.textContent.trim() : "";
      const company = companyElement ? companyElement.textContent.trim() : "";
      const location = locationElement
        ? locationElement.textContent.trim()
        : "";
      const description = descriptionElement
        ? descriptionElement.textContent.trim().replace(/\s+/g, " ")
        : "";

      return {
        title,
        company,
        type,
        location,
        description,
      };
    });
    websiteJobs.push(jobInfo);

    console.log(`Scraped job data from ${link}.`);
  }

  console.log("Scraping completed.");

  return websiteJobs;
}

module.exports = scrapeHirevibes;
