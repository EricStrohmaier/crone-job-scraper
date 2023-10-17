async function scrapeTramell(page, baseUrl) {
  const jobDetails = [];

  const jobContainers = await page.$$(
    'div[class^="flex w-full flex-col items-center gap-12"]'
  );

  for (const container of jobContainers) {
    const titleElement = await container.$(
      'div[class^="flex w-full flex-col items-center gap-12"] a div span'
    );
    const title = titleElement
      ? await titleElement.evaluate((element) => element.textContent.trim())
      : "";

    const locationElement = await container.$(".font-book > span");
    const location = locationElement
      ? await locationElement.evaluate((element) => element.textContent.trim())
      : "";

    const urlElement = await container.$("a");
    const url = urlElement
      ? baseUrl +
        (await urlElement.evaluate((element) => element.getAttribute("href")))
      : "";

      const companyMatch = url.match(/\/portfolio_jobs\/([a-zA-Z-]+)\//);
      const companyName = companyMatch
        ? companyMatch[1].split("-")[0].charAt(0).toUpperCase() + companyMatch[1].split("-")[0].slice(1)
        : "";
      

    jobDetails.push({
      title,
      url,
      location,
      type: "",
      company: companyName,
      tags: [],
      salary: "",
      category: "",
      applyUrl: url,
    });
  }

  return jobDetails;
}

module.exports = scrapeTramell;
