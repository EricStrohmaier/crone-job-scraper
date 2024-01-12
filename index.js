const express = require("express");

require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const Sentry = require("@sentry/node");
const { ProfilingIntegration } = require("@sentry/profiling-node");
const CronJob = require("cron").CronJob;
const puppeteer = require("puppeteer");

const scrapeBitcoinerjobs = require("./scraper/bitcoinerjobsScraper");
const scrapeBTCSuisse = require("./scraper/btc-suisse");
const scrapeBitfinex = require("./scraper/bitfinex");
const scrapeBitrefill = require("./scraper/bitrefill");
const scrapeCryptocurrencyjobs = require("./scraper/cryptocurrency");
const scrapeMigodi = require("./scraper/migodi");
const scrapeTramell = require("./scraper/tramell");
const scrapeRiver = require("./scraper/river");
const scrapeBitGo = require("./scraper/bitgo");
const scrapeThndr = require("./scraper/thndr");
const scrapeBitMex = require("./scraper/BitMex");
const scrapebraiins = require("./scraper/braiins");
const scrapeRiotplatforms = require("./scraper/riotplatforms");
const scrapeBitcoinjobs = require("./scraper/bitcoinjobs");
const scrapeBlock = require("./scraper/block");
const scrape21co = require("./scraper/21co");
const scrapeCormint = require("./scraper/recruiting-paylocity");
const scrapeHolepunch = require("./scraper/holepunch");
const scrapeDreamStartupJob = require("./scraper/dreamstartup");
const websites = require('./websites.json');
const f2poolscraper = require("./scraper/f2pool");
const scrapeExodus = require("./scraper/exodus");
const scrapeCustodiaBank = require("./scraper/custodiabank");


const app = express();
const port = 3001;

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
const supabaseServiceKey = process.env.SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const jobData = {};

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

require('events').EventEmitter.defaultMaxListeners = 20;

let browser;

async function initBrowser() {
  browser = await puppeteer.launch({ headless: "new" });
}

async function  scrapeJobData(website, browser) {
  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);

    await page.goto(website.address);

    let websiteJobs = [];

    switch (website.name) {
      case "Bitcoinerjobs":
        websiteJobs = await scrapeBitcoinerjobs(page, website.address);
        break;
      case "Cryptocurrencyjobs":
        websiteJobs = await scrapeCryptocurrencyjobs(page, website.base);
        break;
      case "BTC-Suisse":
        websiteJobs = await scrapeBTCSuisse(page);
        break;
      case "Bitfinex":
        websiteJobs = await scrapeBitfinex(page, website.base);
        break;
      case "Bitrefill":
        websiteJobs = await scrapeBitrefill(page);
        break;
      case "Migodi":
        websiteJobs = await scrapeMigodi(page, website.base);
        break;
      case "Tramell":
        websiteJobs = await scrapeTramell(page, website.base);
        break;
      case "River":
        websiteJobs = await scrapeRiver(page, website.base);
        break;
      case "BitGo":
        websiteJobs = await scrapeBitGo(page, website.base);
        break;
      case "Thndr":
        websiteJobs = await scrapeThndr(page, website.base);
        break;
      case "Braiins":
        websiteJobs = await scrapebraiins(page);
        break;
      case "Riotplatforms":
        websiteJobs = await scrapeRiotplatforms(page, website.base);
        break;
      case "Bitcoinjobs":
        websiteJobs = await scrapeBitcoinjobs(page);
        break;
      case "Block":
        websiteJobs = await scrapeBlock(page);
        break;
      case "BitMex":
        websiteJobs = await scrapeBitMex(page, website.base);
        break;
      case "21.co":
        websiteJobs = await scrape21co(page, website.base);
        break;
      case "Cormint":
        websiteJobs = await scrapeCormint(page, website.base);
        break;
      case "Holepunch":
        websiteJobs = await scrapeHolepunch(page, website.base);
        break;
      case "DreamStartupJob":
        websiteJobs = await scrapeDreamStartupJob(page);
        break;
      case "f2pool":
        websiteJobs = await f2poolscraper(page, website.base);
        break;
      case "Exodus":
        websiteJobs = await scrapeExodus(page, website.base);
        break;
      case "Custodia Bank":
        websiteJobs = await scrapeCustodiaBank(page);
        break;
      default:
        console.log(`No scraper defined for ${website.name}`);
        break;
    }
    
    console.log(`${website.name} jobs:`, websiteJobs.length);
    

    // TODO: just checking jobs from last 30days ?? DB might become to big to go through each time haha
     jobData[website.name] = websiteJobs;

    for (const job of websiteJobs) {
      const { data: existingData } = await supabase
        .from('job_table')
        .select("title, url")
        .eq("title", job.title)
        .eq("url", job.url);


      if (existingData.length === 0) {
        console.log("Job Inserted ", job.title);
        // Insert the job only if it doesn't exist
        const { data, error } = await supabase.from('job_table').insert([
          {
            title: job.title,
            url: job.url,
            company: job.company,
            location: job.location,
            type: job.type,
            tags: job.tags,
            salary: job.salary,
            category: job.category,
            applyURL: job.applyUrl,
            description: job?.description?.replace(/(\r\n|\n|\r)/gm, ""),
            date: job?.date,
          },
        ]);

        if (error) {
          console.error("Error inserting job data:", error);
        }
      }
    }
     await page.close();
  } catch (error) {
    console.error("Error scraping website", website.name, error);
  }
}

async function scraperjobs() {
  await initBrowser()
  for (const website of websites) {
    await scrapeJobData(website,browser);
  }
  await browser.close();

}


const fetchJobData = new CronJob("0 */5 * * *", async () => {
  console.log("It is time for scraping...");
  await scraperjobs();
  console.log("The data scraping has completed.");
});
fetchJobData.start();

scraperjobs();

app.use(Sentry.Handlers.errorHandler());

app.use(function onError(err, req, res, next) {
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
app.get("/", (req, res) => {
  res.json(jobData); // Return the jobData object as JSON response
});
// Handle unhandledRejection more safely
process.on("unhandledRejection", (reason, p) => {
  console.error(reason, "Unhandled Rejection at Promise", p);

  // Add logic to differentiate between transient and permanent errors
  // Example: Restart scraperjobs only if the error is transient
  if (isTransientError(reason)) {
    setTimeout(() => {
      scraperjobs();
    }, 5000);
  }
});

// Function to check if an error is transient (just an example, implement based on your needs)
function isTransientError(reason) {
  // Implement logic to determine if the error is transient
  return true; // Placeholder
}
