const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const Sentry = require("@sentry/node");
const { ProfilingIntegration } = require("@sentry/profiling-node");
const CronJob = require("cron").CronJob;
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
const scrape21Energy = require("./scraper/21energy");
const scrapeCoinTelegraph = require("./scraper/cointelegraph");
const scrapeCoinkite = require("./scraper/coinkite");


const app = express();
require("dotenv").config();
app.use(cors());
const port = 4001;

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});
let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require('puppeteer-extra')
  console.log("hello aws?!");

} else {
  puppeteer = require('puppeteer-extra')
  console.log("no aws");
}

const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())


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
  let options = {headless: 'new'};
  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  }
    browser = await puppeteer.launch(options);
}


async function scrapeJobData(website, browser) {
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
      // case "DreamStartupJob":
      //   websiteJobs = await scrapeDreamStartupJob(page);
      //   break;
      case "f2pool":
        websiteJobs = await f2poolscraper(page, website.base);
        break;
      case "Exodus":
        websiteJobs = await scrapeExodus(page, website.base);
        break;
      case "Custodia Bank":
        websiteJobs = await scrapeCustodiaBank(page);
        break;
      case "21energy":
        websiteJobs = await scrape21Energy(page);
        break;
      case "Cointelegraph":
        websiteJobs = await scrapeCoinTelegraph(page, website.base);
        break;
      case "Coinkite":
        websiteJobs = await scrapeCoinkite(page);
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
            experience: job?.experience,
            goals: job?.goals,
            youWill: job?.youWill,
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
    await scrapeJobData(website, browser);
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
  setInterval(callUrl, 14 * 60 * 1000);

});
app.get("/", (req, res) => {

  res.json('Hello world',jobData); // Return the jobData object as JSON response
});

 async function callUrl() {
  try {
    const response = await axios.get('https://crone-job-scraper-1.onrender.com');
    console.log('URL called successfully:', response.data);
  } catch (error) {
    console.error('Error calling URL:', error);
  }
}
