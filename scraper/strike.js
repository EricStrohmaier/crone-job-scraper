async function scrapeStrike(page) {

  await page.waitForSelector('section.level-0'); // Wait for job openings to load

  const jobDetails = await page.evaluate(() => {
    const jobElements = Array.from(document.querySelectorAll('div.opening'));

    const jobDetailsArray = jobElements.map((jobElement) => {
      const categoryElement = jobElement.previousElementSibling;
      const category = categoryElement ? categoryElement.textContent.trim() : 'Title not found';
      
      const titleElement = jobElement.previousElementSibling;
      const title = titleElement ? titleElement.textContent.trim() : 'Title not found';

      const titleLink = jobElement.querySelector('a[data-mapped="true"]');
      const url = titleLink ? titleLink.getAttribute('href') : 'Link not found';

      const locationElement = jobElement.querySelector('span.location');
      const location = locationElement ? locationElement.textContent.trim() : 'Location not found';

      const tags = location
      const company = 'Strike'
      return { category, location, url, tags, company, title };
    });

    return jobDetailsArray;
  });

  return jobDetails;

}

module.exports = scrapeStrike;