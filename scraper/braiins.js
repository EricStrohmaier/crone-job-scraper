
async function scrapebraiins(page) {

  const jobDetails = [];

  const jobItems = await page.$$(".braiins-careers-item");

  for (const jobItem of jobItems) {
    const jobTitle = await jobItem.$eval("div", (element) => element.textContent);
    const relativeUrl = await jobItem.$eval("a", (element) => element.getAttribute("href"));
    const fullUrl = new URL(relativeUrl, page.url()).href;

    jobDetails.push({
      title: jobTitle,
      url: fullUrl,
      location: "",
      type: "",
      company: "Braiins",
      tags: [],
      salary: "",
      category: "",
      applyUrl: fullUrl,
    });
  }


  return jobDetails;
}

module.exports = scrapebraiins;
