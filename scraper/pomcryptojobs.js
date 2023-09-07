async function scrapePompcryptojobs(page) {
  await page.waitForSelector("article");

  const jobLinks = await page.evaluate(() => {
    const links = [];
    const jobElements = document.querySelectorAll("article");

    for (const jobElement of jobElements) {
      const relativeUrl = jobElement.querySelector("a").getAttribute("href");
      const fullUrl = new URL(relativeUrl, window.location.href).href;
      links.push(fullUrl);
    }
    return links;
  });

  const websiteJobs = [];
  for (const jobLink of jobLinks) {
    await page.goto(jobLink);
    const jobDetails = await page.evaluate(() => {
      const titleElement = document.querySelector("h1.details-header__title");
      const companyElement = document.querySelector(
        ".listing-item__info--item-company"
      );
      const locationElement = document.querySelector(
        ".listing-item__info--item-location"
      );
      const jobTypeElements = document.querySelectorAll(".job-type__value");
      const descriptionElement = document.querySelector(
        ".details-body__content"
      );

      const title = titleElement ? titleElement.textContent.trim() : "";
      const company = companyElement ? companyElement.textContent.trim() : "";
      const location = locationElement
        ? locationElement.textContent.trim()
        : "";
      const url = window.location.href;
      const type = Array.from(jobTypeElements).map((element) =>
        element.textContent.trim()
      );
      const description = descriptionElement
        ? descriptionElement.textContent.trim().replace(/\s+/g, " ")
        : "";

      return {
        title,
        company,
        url,
        location,
        type,
        description,
      };
    });
    websiteJobs.push(jobDetails);
  }

  return websiteJobs;
}

module.exports = scrapePompcryptojobs;
