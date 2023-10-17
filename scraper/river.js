async function scrapeRiver(page, baseUrl){
    
    const sections = await page.$$('section.level-0');

    const jobDetails = [];
  
    for (const section of sections) {
      const categoryName = await section.$eval('h3', (element) => element.textContent.trim());
  
      const jobLinks = await section.$$('a[data-mapped="true"]');
      const jobLocations = await section.$$('span.location');
  
      for (let i = 0; i < jobLinks.length; i++) {
        const jobTitle = await jobLinks[i].evaluate((element) => element.textContent.trim());
        const jobUrl = await jobLinks[i].evaluate((element) => element.getAttribute('href'));
        const jobLocation = await jobLocations[i].evaluate((element) => element.textContent.trim());
  
        jobDetails.push({
          category: categoryName,
          title: jobTitle,
          url: baseUrl + jobUrl,
          location: jobLocation,
            type: "",
            company: "BitGo",
            tags: [],
            salary: "",
            applyUrl:"",
        });
      }
    }

    return jobDetails;
  
}

module.exports = scrapeRiver;

 