async function scrapeHirevibes(page) {
  const jobLinks = await page.evaluate(() => {
    const links = [];
    const jobElements = document.querySelectorAll("div.column");

    for (const jobElement of jobElements) {
      const relativeUrl = jobElement
        .querySelector("div a")
        .getAttribute("href");
      const fullUrl = new URL(relativeUrl, window.location.href).href;
      links.push(fullUrl);
    }
    return links;
  });

  const websiteJobs = [];
  for (const jobLink of jobLinks) {
    await page.goto(jobLink);
    const jobDetails = await page.evaluate(() => {
      const title = document.querySelector("p.title.is-4").textContent.trim();
      const type = document
        .querySelector("p.break-text.m-b-8")
        .textContent.trim();
      const company = document
        .querySelector("strong.content-title")
        .textContent.trim();
      const location = document
        .querySelector("span.content-subtitle")
        .textContent.trim();
      const description = document
        .querySelector("div.toastui-editor-contents")
        .textContent.trim()
        .replace(/\s+/g, " ");

      return {
        title,
        company,
        type,
        location,
        description,
      };
    });
    websiteJobs.push(jobDetails);
  }

  return websiteJobs;
}

module.exports = scrapeHirevibes;
