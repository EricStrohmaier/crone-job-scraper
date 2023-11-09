async function scrapeRiotplatforms(page, baseUrl) {
  const jobDetails = [];

  const jobItems = await page.$$(".panel.collapse-element");

  for (const jobItem of jobItems) {
    const jobTitle = await jobItem.$eval(
      "h4",
      (element) => element.textContent
    );
    const jobDescription = await jobItem.$eval(
      ".text",
      (element) => element.textContent
    );
    const applyUrl = await jobItem.$eval("a.btn", (element) =>
      element.getAttribute("href")
    );

    jobDetails.push({
      title: jobTitle,
      //   description: jobDescription,
      url: baseUrl + applyUrl,
      company: "Riot",
      tags: [],
      salary: "",
      category: "",
      location: "",
      type: "",
    });
  }

  return jobDetails;
}

module.exports = scrapeRiotplatforms;
