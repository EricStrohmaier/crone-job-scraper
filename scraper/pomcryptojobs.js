async function scrapePompcryptojobs(page) {
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
      const title = document
        .querySelector("h1.details-header__title")
        .textContent.trim();
      const company = document
        .querySelector(".listing-item__info--item-company")
        .textContent.trim();
      const location = document
        .querySelector(".listing-item__info--item-location")
        .textContent.trim();
      const url = window.location.href;
      const jobTypeElements = document.querySelectorAll(".job-type__value");
      const type = Array.from(jobTypeElements).map((element) =>
        element.textContent.trim()
      );
      const description = document
        .querySelector(".details-body__content")
        .textContent.trim()
        .replace(/\s+/g, " ");

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
