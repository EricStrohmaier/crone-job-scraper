
async function scrapeBTCSuisse(page) {
  const jobDetails = [];

  // Extract job details
  const jobList = await page.$("#jobList");

  if (jobList) {
    const jobItems = await jobList.$$(".row-table");

    for (const jobItem of jobItems) {
      const jobTitle = await jobItem.$eval("h3 a", (element) => element.textContent);
      const relativeUrl = await jobItem.$eval("h3 a", (element) => element.getAttribute("href"));
      const fullUrl = new URL(relativeUrl, page.url()).href;
      const location = await jobItem.$eval(".cell-table:nth-child(2)", (element) =>
        element.textContent.trim()
      );
      const employmentType = await jobItem.$eval(".cell-table:nth-child(3)", (element) =>
        element.textContent.trim()
      );

      jobDetails.push({
        title: jobTitle,
        url: fullUrl,
        location,
        type: employmentType,
        company: "Bitcoin Suisse",
        tags: [],
        salary: "",
        category: "",
        applyUrl: fullUrl,

      });
    }
  }

  return jobDetails;
}

module.exports = scrapeBTCSuisse;
