const puppeteer = require('puppeteer');

 async function scrapeCoinkite(page) {
  await page.waitForSelector('.roles.newroles .role.newdesign');

  const jobDetails = await page.evaluate(() => {
    const jobElements = document.querySelectorAll('.roles.newroles .role.newdesign');
    const jobs = [];

    jobElements.forEach((jobElement) => {
      const status = jobElement.querySelector('.career-status')?.textContent.trim();
      if (status === "OPEN") { // Check if the status is OPEN
      const title = jobElement.querySelector('.career-title')?.textContent.trim();
      const details = jobElement.querySelector('.details');
      const experienceList = details.querySelectorAll('p')[0]?.nextElementSibling.querySelectorAll('li');
      const niceToHaveList = details.querySelectorAll('p')[1]?.nextElementSibling.querySelectorAll('li');
      const descriptionParagraphs = details.querySelectorAll('p');

      let experience = [];
      experienceList.forEach(item => {
        experience.push(item.textContent.trim());
      });

      let niceToHaves = [];
      niceToHaveList.forEach(item => {
        niceToHaves.push(item.textContent.trim());
      });

      let description = '';
      descriptionParagraphs.forEach((para, index) => {
        // Skip experience and nice to haves paragraphs
        if (index > 1 && index < descriptionParagraphs.length - 1) {
          description += para.textContent.trim() + '\n\n';
        }
      });

    //   const applyLink = jobElement.querySelector('.apply.newapply')?.parentNode.previousElementSibling?.href || 'No link available';

      jobs.push({
        status,
        title,
        url: 'https://coinkite.com/careers',
        company: 'Coinkite',
        experience,
        tags: niceToHaves,
        description,
      });
    }
    });

    return jobs;
  });

  return jobDetails;
}
module.exports = scrapeCoinkite;

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://coinkite.com/careers', { waitUntil: 'networkidle0' });

  const jobOpenings = await scrapeCoinkite(page);
  console.log(jobOpenings);

  await browser.close();
})();
