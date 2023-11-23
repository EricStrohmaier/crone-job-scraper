const express = require("express");
const puppeteer = require("puppeteer-extra");
const { CronJob } = require("cron");
const { createClient } = require("@supabase/supabase-js");
const bitcoinerjobsScraper = require("./scraper/bitcoinerjobsScraper");
const scrapeCryptoJobsList = require("./scraper/cryptoJobsListScraper");
const scrapePompcryptojobs = require("./scraper/pomcryptojobs");
const scrapeHirevibes = require("./scraper/hirevibes");
const scrapeLinkedInjobs = require("./scraper/linkedIn");
const scrapeCryptovalley = require("./scraper/cryptovalley");
const scrapeCryptocurrencyjobs = require("./scraper/cryptocurrency");

const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const supabaseUrl = 'https://hnfpcsanqackenyhtoep.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const websites = [
  {
    name: "Bitcoinerjobs",
    address: "https://bitcoinerjobs.com",
    base: "",
  },
  {
    name: "CryptoJobsList",
    address: "https://cryptojobslist.com/search?q=bitcoin&location=",
    base: "https://cryptojobslist.com",
  },
  {
    name: "Hirevibes",
    address: "https://app.hirevibes.com/jobs/bitcoin/--all--",
    base: "https://app.hirevibes.com",
  },
  {
    name: "LinkedIn",
    address:
      "https://www.linkedin.com/jobs/search?keywords=Bitcoin&location=United%20States&locationId=&geoId=103644278&f_TPR=r604800",
    base: "",
  },
  {
    name: "Cryptocurrencyjobs",
    address: "https://cryptocurrencyjobs.co/?query=bitcoin",
    base: "https://cryptocurrencyjobs.co",
  },
  // {
  //   name: "Cryptovalley",
  //   address: "https://cryptovalley.jobs/",
  //   base: "https://cryptovalley.jobs/",
  // },
];

const jobData = {};

// // Define a route to access the scraped job data
// app.get("/", (req, res) => {
//   res.json(jobData); // Return the jobData object as JSON response
// });

async function scrapeJobData(website) {
  try {
    const browser = await puppeteer.launch({
      headless: "new", // Run in headless mode
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(60000);

    await page.goto(website.address);

    let websiteJobs = [];

    if (website.name === "Bitcoinerjobs") {
      websiteJobs = await bitcoinerjobsScraper(page, website.address);
      console.log("Bitcoinerjobs jobs:", websiteJobs.length);
      console.log("Bitcoinerjobs jobs:", websiteJobs);
      // console.log("Bitcoinerjobs jobs:", websiteJobs);
    } else if (website.name === "CryptoJobsList") {
      websiteJobs = await scrapeCryptoJobsList(page, website.base);
      console.log("CryptoJobsList jobs:", websiteJobs.length);
      console.log("CryptoJobsList jobs:", websiteJobs);
    } else if (website.name === "Hirevibes") {
      websiteJobs = await scrapeHirevibes(page, website.base);
      console.log("Hirevibes jobs:", websiteJobs.length);
      // console.log("Hirevibes jobs:", websiteJobs);
    } else if (website.name === "LinkedIn") {
      websiteJobs = await scrapeLinkedInjobs(page);
      console.log("LinkedIn jobs:", websiteJobs.length);
      // console.log("LinkedIn jobs:", websiteJobs);
    } else if (website.name === "Cryptocurrencyjobs") {
      websiteJobs = await scrapeCryptocurrencyjobs(page, website.base);
      console.log("Cryptocurrencyjobs jobs:", websiteJobs.length);
      // console.log("Cryptocurrencyjobs jobs:", websiteJobs);
    }

    jobData[website.name] = websiteJobs;

    for (const job of websiteJobs) {
      const { data: existingData } = await supabase
        .from(website.name)

        .select("*")
        .eq("title", job.title)

        .single();
      // console.log("exitsting data ", existingData);
      //add existingdata to array

      if (!existingData) {
        // console.log("job new? ", job.url);
        // Insert the job only if it doesn't exist
        const { data, error } = await supabase.from(website.name).insert([
          {
            title: job.title,
            url: job.url,
            company: job.company,
            location: job.location,
            type: job.type,
            tags: job.tags,
            salary: job.salary,
            category: job.category,
            // postedAt: job.postedAt,
            applyURL: job.applyUrl,
            // description: job.description,
            // remote: job.remote,
          },
        ]);
        console.log("Jobs inserted:", data);

        if (error) {
          console.error("Error inserting job data:", error);
        }
      }
    }

    await browser.close();
  } catch (error) {
    console.error("Error scraping job data:", error);
  }
}

async function scraperjobs() {
  for (const website of websites) {
    await scrapeJobData(website);
  }
}

// app.listen(port, () => {
//   console.log(`App listening on port ${port}`);
// });

//    ('0 */8 * * * ')    //every 8 hours
console.log(
  "Scraperjobs starting... Right now the cron job is set to run every 2 hours."
);

const fetchJobData = new CronJob("0 */2 * * *", async () => {
  console.log("It is time for scraping...");
  await scraperjobs();
  console.log("The data scraping has completed.");
});
fetchJobData.start();

scraperjobs(); // Call the function to initiate scraping

module.exports = app;