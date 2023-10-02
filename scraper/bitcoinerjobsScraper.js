const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://hnfpcsanqackenyhtoep.supabase.co";
const supabaseKey = process.env.PUPLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function scrapeBitcoinerjobs(page, baseUrl) {
  await page.waitForSelector("ul.jobs");

  // //check if jobLink already exist in db
  const { data: existingJobs } = await supabase
    .from("Bitcoinerjobs")
    .select("*");

  const jobLinksArray = [];

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
  //check here if already exist in db? if yes, skip

  const websiteJobs = [];

  jobLinksArray.push(jobLinks);

  for (const jobLink of jobLinks) {
    if (jobLink) {
      const jobLinkExists = existingJobs.some((job) => job.url === jobLink);
      console.log("joblinkexist? : ", jobLinkExists);
      console.log(
        "joblinkexist? data flow : ",
        existingJobs.some((job) => job.url)
      );
      if (jobLinkExists) {
        continue;
      }
    }

    await page.goto(jobLink); // Navigate to the job's page

    // Wait for the relevant content to load
    await page.waitForSelector(".job-box");

    const jobDetails = await page.evaluate(async (baseUrl) => {
      const title = document.querySelector(".title").textContent.trim();
      const company = document.querySelector(".company a").textContent.trim();

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
