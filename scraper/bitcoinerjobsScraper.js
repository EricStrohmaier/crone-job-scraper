async function scrapeBitcoinerjobs(page, baseUrl) {
  await page.waitForSelector("ul.jobs");

  const jobLinks = await page.evaluate(() => {
    // Extract the URLs of all job listings
    const links = [];
    const jobElements = document.querySelectorAll("ul.jobs li");

    for (const jobElement of jobElements) {
      const relativeUrl = jobElement.querySelector("a").getAttribute("href");
      const fullUrl = new URL(relativeUrl, window.location.href).href;
      links.push(fullUrl);
    }

    return links;
  });

  const websiteJobs = [];

  for (const jobLink of jobLinks) {
    await page.goto(jobLink); // Navigate to the job's page

    // Wait for the relevant content to load
    await page.waitForSelector(".job-box");

    const jobDetails = await page.evaluate(async (baseUrl) => {
      let title = "";
      let company = "";

      const titleElement = document.querySelector(".title");
      if (titleElement) {
        title = titleElement.textContent.trim();
      }

      const companyElement = document.querySelector(".company a");
      if (companyElement) {
        company = companyElement.textContent.trim();
      }
      const url = new URL(window.location.href).href;

      const applyButton = document.querySelector(".buttons a");
      const constructApplyUrl = applyButton
        ? applyButton.getAttribute("href")
        : null;
      let applyUrl; // Declare the variable in the outer scope

      if (constructApplyUrl === null) {
        const url = window.location.href; // Or some other default URL
        applyUrl = url;
      } else if (constructApplyUrl.startsWith("mailto")) {
        // It's a mailto link, do something here or simply return
        applyUrl = constructApplyUrl;
      } else {
        // It's not a mailto link, construct the URL with baseUrl
        applyUrl = baseUrl + constructApplyUrl;
      }

      const locationElement = document.querySelector(".location");
      const location = locationElement
        ? locationElement.textContent.trim()
        : "";

      // const descriptionElement = document.querySelector(".description");
      // const description = descriptionElement
      //   ? descriptionElement.textContent.trim()
      //   : "";

      const remoteElement = document.querySelector(".location .remote");
      const remote = remoteElement ? remoteElement.textContent.trim() : "";

      const typeElement = document.querySelector(".type");
      const type = typeElement ? typeElement.textContent.trim() : "";

      const salaryElement = document.querySelector(".salary");
      const salary = salaryElement ? salaryElement.textContent.trim() : "";

      const categoryElement = document.querySelector(".category a");
      const category = categoryElement
        ? categoryElement.textContent.trim()
        : "";

      const tagsElements = document.querySelectorAll(".tags a.tag");
      const tags = tagsElements
        ? Array.from(tagsElements).map((tag) => tag.textContent.trim())
        : [];

      return {
        url,
        applyUrl,
        title,
        company,
        location,
        type,
        category,
        salary,
        tags,
      };
    }, baseUrl);

    websiteJobs.push(jobDetails);
  }

  return websiteJobs;
}

module.exports = scrapeBitcoinerjobs;