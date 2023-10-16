const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://www.migodi.com/jobs'); // Replace with the actual URL

  // Wait for the sections with the class "elementor-toggle-item" to be available
  await page.waitForSelector('.elementor-toggle-item');

  // Get the number of sections
  const sections = await page.$$('.elementor-toggle-item');

  for (let i = 0; i < sections.length; i++) {
    // Extract the title of the current section
    const title = await sections[i].$eval('a.elementor-toggle-title', (element) => element.textContent);

    // Extract the first two paragraphs of the current section
    const paragraphs = await sections[i].$$eval('p', (elements) => {
      return elements.slice(0, 2).map((element) => element.textContent);
    });

    // Log the title and paragraphs of the current section
    console.log(`Title of Section ${i + 1}: ${title}`);
    console.log(`Paragraphs of Section ${i + 1}:`, paragraphs);
  }

  // Close the browser
  await browser.close();
})();
