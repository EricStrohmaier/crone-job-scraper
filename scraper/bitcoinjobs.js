async function scrapeBitcoinjobs(page, baseUrl) {
    const jobItems = await page.evaluate(() => {
      const items = [];
      const jobCards = document.querySelectorAll('.job-card');
  
      jobCards.forEach((card) => {
        const jobItem = {};
        const jobName = card.querySelector('.job-name');
        const jobCompany = card.querySelector('.job-company');
        const locationText = card.querySelector('.categories-text');
        const jobLink = card.querySelector('a'); // Assuming the job link is in an anchor tag
  
        jobItem.title = jobName.textContent.trim();
        jobItem.company = jobCompany.textContent.trim();
        jobItem.location = locationText.textContent.trim();
        jobItem.url = jobLink.href;
  
        // Extract all tags by looping through and checking each element with a specific class
        const tags = [];
        const tagElements = card.querySelectorAll('.categories-text');
        tagElements.forEach((tagElement) => {
          tags.push(tagElement.textContent.trim());
        });
  
        // Add the second tag to the 'type' field
        if (tags.length >= 2) {
          jobItem.type = tags[1];
        } else {
          jobItem.type = "";
        }
  
        // Add the last tag to the 'tags' field
        if (tags.length >= 1) {
          jobItem.tags = [tags[tags.length - 1]];
        } else {
          jobItem.tags = [];
        }
  
        items.push(jobItem);
      });
  
      return items;
    });
  
    return jobItems;
  }
  
  module.exports = scrapeBitcoinjobs;
  