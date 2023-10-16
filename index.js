const Sentry = require("@sentry/node");
const { ProfilingIntegration } = require("@sentry/profiling-node");
const express = require("express");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const CronJob = require("cron").CronJob;
const { createClient } = require("@supabase/supabase-js");
const scrapeBitcoinerjobs = require("./scraper/bitcoinerjobsScraper");
const scrapeBTCSuisse = require("./scraper/btc-suisse");
const scrapeBitfinex = require("./scraper/bitfinex");
const scrapeBitrefill = require("./scraper/bitrefill");
const scrapeCryptocurrencyjobs = require("./scraper/cryptocurrency");
const scrapeMigodi = require("./scraper/migodi");

puppeteer.use(StealthPlugin());

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

Sentry.init({
  dsn: "https://317ccb29737a10183da222cb987f5249@o4506060544802816.ingest.sentry.io/4506060547883008",
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({ app }),
    new ProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0,
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

const supabaseUrl = "https://hnfpcsanqackenyhtoep.supabase.co";
const supabaseKey = process.env.PUPLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const websites = [
  {
    name: "Bitcoinerjobs",
    address: "https://bitcoinerjobs.com",
    base: "",
  },
  {
    name: "Cryptocurrencyjobs",
    address: "https://cryptocurrencyjobs.co/?query=bitcoin",
    base: "https://cryptocurrencyjobs.co",
  },
  {
    name: "BTC-Suisse",
    address: "https://bitcoin-suisse.onlyfy.jobs/",
    base: "",
  },
  {
    name: "Bitfinex",
    address: "https://bitfinex.recruitee.com/",
    base: "https://bitfinex.recruitee.com",
  },
  {
    name: "Bitrefill",
    address: "https://careers.bitrefill.com/jobs",
    base: "",
  },
  {
    name: "Migodi",
    address: "https://www.migodi.com/jobs/",
    base: "https://www.migodi.com/jobs/",
  }
];

const jobData = {};

app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// Define a route to access the scraped job data
app.get("/", (req, res) => {
  res.json(jobData); // Return the jobData object as JSON response
});

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
      websiteJobs = await scrapeBitcoinerjobs(page, website.address);
      console.log("Bitcoinerjobs jobs:", websiteJobs.length);
      // console.log("Bitcoinerjobs jobs:", websiteJobs);
    } else if (website.name === "Cryptocurrencyjobs") {
      websiteJobs = await scrapeCryptocurrencyjobs(page, website.base);
      console.log("CryptoJobsList jobs:", websiteJobs.length);
      // console.log("CryptoJobsList jobs:", websiteJobs);
    } else if (website.name === "BTC-Suisse") {
      websiteJobs = await scrapeBTCSuisse(page);
      console.log("BTC-Suisse jobs:", websiteJobs.length);
      //console.log("BTC-Suisse jobs:", websiteJobs);
    } else if (website.name === "Bitfinex") {
      websiteJobs = await scrapeBitfinex(page, website.base);
      console.log("Bitfinex jobs:", websiteJobs.length);
      // console.log("bitfinex jobs:", websiteJobs);
    } else if (website.name === "Bitrefill") {
      websiteJobs = await scrapeBitrefill(page);
      console.log("Bitrefill jobs:", websiteJobs.length);
      // console.log("Bitrefill jobs:", websiteJobs);
    } else if (website.name === "Migodi") {
      websiteJobs = await scrapeMigodi(page, website.base);
      console.log("Migodi jobs:", websiteJobs.length);
      // console.log("Migodi jobs:", websiteJobs);
    }

    jobData[website.name] = websiteJobs;

    for (const job of websiteJobs) {
      const { data: existingData } = await supabase
        .from(website.name)

        .select("*")
        .eq("title", job.title)

        .single();
      // console.log("exitsting data ", existingData);

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

app.use(Sentry.Handlers.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
