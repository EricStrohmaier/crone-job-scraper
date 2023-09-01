async function scrapeCryptoJobsList(page, baseUrl) {
  await page.waitForSelector("li");
  const websiteJobs = await page.evaluate(async (baseUrl) => {
    const jobs = [];

    const jobElements = document.querySelectorAll(
      "li.JobPreviewInline_JobPreviewInline__uAIxU"
    );

    for (const jobElement of jobElements) {
      const title = jobElement
        .querySelector("span.JobPreviewInline_jobTitle__WYzmvno-underline")
        .textContent.trim();
      const company = jobElement
        .querySelector("a.JobPreviewInline_companyName__5ffOt")
        .textContent.trim();
      const location = jobElement
        .querySelector("span.JobPreviewInline_jobLocation__dV9Hp")
        .textContent.trim();

      const url = jobElement.querySelector("a").getAttribute("href");

      jobs.push({
        title,
        url: baseUrl + url,
        company,
        location,
      });
    }

    return jobs;
  }, baseUrl);

  return websiteJobs;
}

module.exports = scrapeCryptoJobsList;
