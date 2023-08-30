const express = require("express");
const puppeteer = require("puppeteer");
const { CronJob } = require("cron");
const { createClient } = require("@supabase/supabase-js");
const bitcoinerjobsScraper = require("./scraper/bitcoinerjobsScraper");
const scrapeCryptoJobsList = require("./scraper/cryptoJobsListScraper");
const scrapePompcryptojobs = require("./scraper/pomcryptojobs");
const scrapeHirevibes = require("./scraper/hirevibes");
const scrapeNiftyjobs = require("./scraper/niftyjobs");
const scrapeCryptovalley = require("./scraper/cryptovalley");
const scrapeCryptocurrencyjobs = require("./scraper/cryptocurrency");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const supabaseUrl = "https://hnfpcsanqackenyhtoep.supabase.co";
const supabaseKey = process.env.PUPLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const websites = [
  {
    name: "Bitcoinerjobs",
    address: "https://bitcoinerjobs.com/",
    base: "",
  },
  {
    name: "CryptoJobsList",
    address: "https://cryptojobslist.com/bitcoin",
    base: "https://cryptojobslist.com",
  },
  {
    name: "Pompcryptojobs",
    address: "https://pompcryptojobs.com/jobs/?q=bitcoin",
    base: "",
  },
  {
    name: "Hirevibes",
    address: "https://app.hirevibes.com/jobs/bitcoin/--all--",
    base: "https://app.hirevibes.com",
  },
  {
    name: "Niftyjobs",
    address: "https://www.niftyjobs.io/",
    base: "",
  },
  {
    name: "Cryptovalley",
    address: "https://cryptovalley.jobs/",
    base: "https://cryptovalley.jobs/",
  },
  {
    name: "Cryptocurrencyjobs",
    address: "https://cryptocurrencyjobs.co/?query=bitcoin",
    base: "https://cryptocurrencyjobs.co",
  },
];

const jobData = {};

// Define a route to access the scraped job data
app.get("/", (req, res) => {
  res.json(jobData); // Return the jobData object as JSON response
});

async function scrapeJobData(website) {
  try {
    const browser = await puppeteer.launch({
      args: [
        // Required for Docker version of Puppeteer
        "--no-sandbox",
        "--disable-setuid-sandbox",
        // This will write shared memory files into /tmp instead of /dev/shm,
        // because Docker’s default for /dev/shm is 64MB
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();
    await page.goto(website.address);

    let websiteJobs = [];

    if (website.name === "Bitcoinerjobs") {
      websiteJobs = await bitcoinerjobsScraper(page);
    } else if (website.name === "CryptoJobsList") {
      websiteJobs = await scrapeCryptoJobsList(page, website.base);
    } else if (website.name === "Pompcryptojobs") {
      websiteJobs = await scrapePompcryptojobs(page);
    } else if (website.name === "Hirevibes") {
      websiteJobs = await scrapeHirevibes(page, website.base);
    } else if (website.name === "Niftyjobs") {
      websiteJobs = await scrapeNiftyjobs(page);
    } else if (website.name === "Cryptovalley") {
      websiteJobs = await scrapeCryptovalley(page, website.base);
    } else if (website.name === "Cryptocurrencyjobs") {
      websiteJobs = await scrapeCryptocurrencyjobs(page, website.base);
    }

    jobData[website.name] = websiteJobs;

    for (const job of websiteJobs) {
      const { data: existingData } = await supabase
        .from(website.name)

        .select("*")
        .eq("title", job.title)

        .single();

      if (!existingData) {
        // Insert the job only if it doesn't exist
        const { data, error } = await supabase.from(website.name).insert([
          {
            title: job.title,
            url: job.url,
            company: job.company,
            location: job.location,
          },
        ]);
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

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

//    ('0 */8 * * * ')    //every 8 hours
console.log(
  "Scraperjobs starting... Right now the cron job is set to run every 4 hours."
);

const fetchJobData = new CronJob("0 */4 * * *", async () => {
  console.log("It is time for scraping...");
  await scraperjobs();
  console.log("The data scraping has completed.");
});
fetchJobData.start();

// scraperjobs(); // Call the function to initiate scraping

module.exports = app;
