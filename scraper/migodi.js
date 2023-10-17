const { job } = require("cron");

async function scrapeMigodi(page, baseUrl) {
    const jobDetails = [];
  
    await page.waitForSelector('.elementor-toggle-item');
  
    // Get the sections
    const sections = await page.$$('.elementor-toggle-item');
  
    const jobList = [];
  
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
  
      // Extract the title of the current section
      const title = await section.$eval('a.elementor-toggle-title', (element) => element.textContent);
  
      // Extract the first two paragraphs of the current section
      const paragraphs = await section.$$eval('p', (elements) => {
        return elements.slice(0, 2).map((element) => element.textContent);
      });
  
      // Push section details to the job list
      jobList.push({
        title,
        url: baseUrl,
        location: paragraphs[0],
        category: paragraphs[1],
        company: "Migodi",
        tags: [],
        salary: "",
        type: "",
        applyUrl: baseUrl,


      });
  
   }
  //pushing the job details to the job list
   jobDetails.push(...jobList);

    return jobDetails;
  }
  
  module.exports = scrapeMigodi;