async function scrapeBitrefill(page) {
    const jobDetails = [];
  
    await page.waitForSelector("#jobs_list_container");
  
    // Extract job items
    const jobItems = await page.evaluate(() => {
      const items = Array.from(
        document.querySelectorAll("#jobs_list_container li")
      );
      const jobList = [];
  
      items.forEach((item) => {
        const link = item.querySelector("a");
        const title = link
          .querySelector(".text-block-base-link")
          .getAttribute("title");
        const href = link.getAttribute("href");
        const tags = Array.from(item.querySelectorAll(".text-md span"))
          .map((tag) => tag.textContent.trim())
          .filter((tag) => tag !== "·"); // Filter out the dots
  
        jobList.push({
          title,
          url: href,
          tags,
          company: "Bitrefill",
          location: "",
          type: "",
          salary: "",
          category: "",
          applyUrl: href,
        });
      });
  
      return jobList;
    });
  
    jobDetails.push(...jobItems);
  
    return jobDetails;
  }
  
  module.exports = scrapeBitrefill;
  