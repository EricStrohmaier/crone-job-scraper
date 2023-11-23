// const puppeteer = require("puppeteer");

// async function scrapeCashApp() {
//   try {
//     const browser = await puppeteer.launch({ headless: false });

//     const page = await browser.newPage();

//     await page.goto("https://cash.app/careers");

//     await page.waitForSelector('section[data-chapter="careers"]');

//     const data = await page.evaluate(async () => {
//       const categoryElements = document.querySelectorAll("figure[data-team]");
//       const results = [];

//       for (const categoryElement of categoryElements) {
//         const categoryTitle = categoryElement
//           .querySelector("h3")
//           .textContent.trim();
//         const jobElements = categoryElement.querySelectorAll("li[data-job]");

//         for (const jobElement of jobElements) {
//           const title = jobElement.querySelector("h4").textContent.trim();
//           const link = jobElement.querySelector("a").getAttribute("href");
//           const location = jobElement.querySelector("p").textContent.trim();
//           const tags = [];
//           const dataRoles = jobElement.getAttribute("data-role");
//           const dataTypes = jobElement.getAttribute("data-type");

//           if (dataRoles) {
//             tags.push(dataRoles);
//           }
//           if (dataTypes) {
//             tags.push(dataTypes);
//           }

//           try {
//             const jobPage = await browser.newPage(); // Create a new page for each job listing

//             await jobPage.goto(link, { waitUntil: "domcontentloaded" });
//             console.log("go to link", link);
//             // Extract information from the job page
//             const companyDescription =
//               jobPage.evaluate(() =>
//                 document.querySelector("#st-companyDescription p")?.textContent
//               ) || "Company description not found";
//             const jobDescription =
//               jobPage.evaluate(() =>
//                 document.querySelector("#st-jobDescription p")?.textContent
//               ) || "Job description not found";
//             const qualifications =
//               jobPage.evaluate(() =>
//                 document.querySelector("#st-qualifications .wysiwyg")?.textContent
//               ) || "Qualifications not found";

//             console.log(
//               "companyDescription",
//               companyDescription,
//               "jobDescription",
//               jobDescription,
//               "qualifications",
//               qualifications
//             );

//             await jobPage.close(); // Close the job listing page when done
//           } catch (error) {
//             console.error("An error occurred:", error);
//           }

//           results.push({
//             category: categoryTitle,
//             title,
//             url: link,
//             location,
//             tags,
//             company: "CashApp",
//             type: "",
//             salary: "",
//           });
//         }
//       }

//       return results;
//     });

//     console.log("data", );
//     await browser.close();
//   } catch (error) {
//     console.error("An error occurred:", error);
//   }
// }


