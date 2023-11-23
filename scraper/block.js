
async function scrapeBlock(page) {
  await page.waitForSelector('div.JobList_row__ZvTrC'); // Wait for job listings to load

  const jobDetails = await page.evaluate(() => {
    const jobElements = Array.from(document.querySelectorAll('div.JobList_row__ZvTrC'));

    const jobDetailsArray = jobElements.map((jobElement) => {
      const titleElement = jobElement.querySelector('div.JobList_titleColumn__3oZrC');
      const title = titleElement ? titleElement.textContent.trim() : 'Title not found';

      const companyElement = jobElement.querySelector('.JobList_secondaryColumnSm__Ac1BT');
      const company = companyElement ? companyElement.textContent.trim() : 'Company not found';

      const typeElement = jobElement.querySelector('.JobList_typeOfEmploymentBase__LfMmp');
      const type = typeElement ? typeElement.textContent.trim() : 'Type not found';

      const locationElements = Array.from(jobElement.querySelectorAll('.JobList_location__xqp3R'));
      const locationInput = locationElements.map((location) => location.textContent);

      const location = locationInput.join(' ').replace(/[\[\]"]+/g, '');

      const linkElement = jobElement.querySelector('a.JobList_link__yOMBM');
      const url = linkElement ? linkElement.getAttribute('href') : 'Link not found';
      const tags = [];
      return { title, company, type, location, url, tags };
    });

    return jobDetailsArray;
  });

    return jobDetails;
}

module.exports = scrapeBlock;