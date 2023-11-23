async function scrapeXverse(page) {
    const jobDetails = [];
  
    // Wait for the container that holds the job listings to load.
    await page.waitForSelector('.styles_jobList__5MFDX', { timeout: 30000 });
  
    // Extract job items
    const jobItems = await page.evaluate(() => {
      const items = Array.from(
        document.querySelectorAll('.styles_jobList__5MFDX .styles_component__2UhSH a')
      );
  
      const jobList = [];
  
      items.forEach((item) => {
        const category = item.querySelector('.text-dark-a.font-medium.uppercase').textContent;
        const title = item.querySelector('.styles-jobTitle__01EmE').textContent;
        const url = item.getAttribute('href');
        const location = item.querySelector('.styles_location__EbdfK').textContent;
        const compensation = item.querySelector('.styles_compensation__DUzmb').textContent;
  
        const descriptionItems = Array.from(item.querySelectorAll('.styles_descriptionSnippet__j1vlH li'));
        const description = descriptionItems.map((li) => li.textContent).join('\n');
  
        jobList.push({
          category,
          title,
          url,
          location,
          compensation,
          description,
        });
      });
  
      return jobList;
    });
  
    jobDetails.push(...jobItems);
  
    return jobDetails;
  }
  
  module.exports = scrapeXverse;
  