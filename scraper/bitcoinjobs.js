async function scrapeBitcoinjobs(page) {
  const jobItems = await page.evaluate(() => {
    const items = [];
    const jobCards = document.querySelectorAll('.job-card');

    jobCards.forEach((card) => {
      const jobItem = {};
      const jobName = card.querySelector('.job-name');
      const jobCompany = card.querySelector('.job-company');
      const locationText = card.querySelector('.categories-text');

      // Directly use the href attribute of the card, which is an anchor tag
      const jobLink = card.getAttribute('href');
      const baseUrl = 'https://bitcoinjobs.com'
      jobItem.title = jobName.textContent.trim();
      jobItem.company = jobCompany.textContent.trim();
      jobItem.location = locationText.textContent.trim();
      jobItem.url = baseUrl + jobLink;  // Concatenate baseUrl with jobLink

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
