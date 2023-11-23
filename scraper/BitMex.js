// const puppeteer = require('puppeteer');

// (async function scrapeBitMex() {
//   const baseUrl = 'https://boards.greenhouse.io/bitmex'; // Replace with the actual base URL

//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   // Navigate to the BitMEX jobs page
//   await page.goto(baseUrl);

//   const sections = await page.$$("section.level-0");
//   const jobDetails = [];

//   for (const section of sections) {
//     const categoryName = await section.$eval("h3", (element) =>
//       element.textContent.trim()
//     );

//     const jobLinks = await section.$$('a[data-mapped="true"]');
//     const jobLocations = await section.$$("span.location");

//     for (let i = 0; i < jobLinks.length; i++) {
//       const jobTitle = await jobLinks[i].evaluate((element) =>
//         element.textContent.trim()
//       );
//       const jobUrl = await jobLinks[i].evaluate((element) =>
//         element.getAttribute("href")
//       );
//       const jobLocation = await jobLocations[i].evaluate((element) =>
//         element.textContent.trim()
//       );

//       try {
//         await page.goto(baseUrl + jobUrl);

//         const pageContent = await page.evaluate(
//           () => document.body.textContent
//         );

//         if (
//           pageContent.includes("bitcoin") ||
//           pageContent.includes("Bitcoin")
//         ) {
//           jobDetails.push({
//             category: categoryName,
//             title: jobTitle,
//             url: baseUrl + jobUrl,
//             location: jobLocation,
//             type: "",
//             company: "BitMEX",
//             tags: [],
//             salary: "",
//             applyUrl: "",
//           });
//         }

//         await page.close(); // Go back to the job listings page
//       } catch (error) {
//         console.error("Error scraping job data:", error);
//       }
//     }
//   }

//   console.log(jobDetails);

//   // Close the browser when done
//   await browser.close();
// })();


