async function scrapeCryptoJobsList(page) {
  // Get the list of job links
  await page.waitForSelector("ul");

  const jobLinks = await page.evaluate(() => {
    const links = [];
    const jobElements = document.querySelectorAll("li.JobInline_job__n_Spc");

    for (const jobElement of jobElements) {
      const relativeUrl = jobElement.querySelector("a").getAttribute("href");
      const fullUrl = new URL(relativeUrl, window.location.href).href;
      const title = jobElement
        .querySelector("span.JobInline_jobTitle__PAbC0no-underline")
        .textContent.trim();
      const company = jobElement
        .querySelector("a.JobInline_companyName__Qv2jW")
        .textContent.trim();
      const tags = Array.from(
        jobElement.querySelectorAll("a.JobInline_jobLocation__w8f2C")
      ).map((tag) => tag.textContent.trim());
      const applyUrl = {};

      links.push({
        url: fullUrl,
        title,
        company,
        tags,
        applyUrl,
        location: "",
        type: "",
        category: "",
        salary: "",
      });
    }

    return links;
  });

  return jobLinks;
}

module.exports = scrapeCryptoJobsList;
