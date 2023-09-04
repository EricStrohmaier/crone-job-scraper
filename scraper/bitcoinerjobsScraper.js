async function scrapeBitcoinerjobs(page, baseUrl) {
  // page is the main url of the website
  // Wait for the job listings to load
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
      const title = document.querySelector(".title").textContent.trim();
      const company = document.querySelector(".company a").textContent.trim();

      const url = new URL(window.location.href).href;

      const applyButton = document.querySelector(".buttons a");
      const applyUrl = applyButton ? applyButton.getAttribute("href") : null;
      let constructApplyUrl; // Declare the variable in the outer scope

      if (applyUrl === null) {
        const url = window.location.href; // Or some other default URL
        constructApplyUrl = url;
      } else if (applyUrl.startsWith("mailto")) {
        // It's a mailto link, do something here or simply return
        constructApplyUrl = applyUrl;
      } else {
        // It's not a mailto link, construct the URL with baseUrl
        constructApplyUrl = baseUrl + applyUrl;
      }

      const locationElement = document.querySelector(".location");
      const location = locationElement
        ? locationElement.textContent.trim()
        : "";

      const descriptionElement = document.querySelector(".description");
      const description = descriptionElement
        ? descriptionElement.textContent.trim()
        : "";

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

      const postedAtElement = document.querySelector(".posted_at");
      const postedAt = postedAtElement
        ? postedAtElement.textContent.trim()
        : "";

      return {
        url,
        constructApplyUrl,
        title,
        company,
        location,
        remote,
        type,
        category,
        salary,
        tags,
        postedAt,
        description,
      };
    }, baseUrl);

    websiteJobs.push(jobDetails);
  }

  return websiteJobs;
}

module.exports = scrapeBitcoinerjobs;
