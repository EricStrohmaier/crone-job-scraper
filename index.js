const express = require("express");

require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const Sentry = require("@sentry/node");
const { ProfilingIntegration } = require("@sentry/profiling-node");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
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
const scrapeXverse = require("./scraper/xverse");
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
puppeteer.use(StealthPlugin());

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
  },
  {
    name: "Tramell",
    address: "https://tvp.fund/jobs/",
    base: "https://tvp.fund",
  },
  {
    name: "River",
    address: "https://boards.greenhouse.io/riverfinancial",
    base: "https://boards.greenhouse.io",
  },
  {
    name: "BitGo",
    address: "https://boards.greenhouse.io/bitgo",
    base: "https://boards.greenhouse.io",
  },
  {
    name: "Thndr",
    address: "https://www.thndr.games/careers",
    base: "https://www.thndr.games",
  },
  {
    name: "Braiins",
    address: "https://braiins.com/careers",
  },
  {
    name: "Riotplatforms",
    address: "https://www.riotplatforms.com/careers",
    base: "https://www.riotplatforms.com",
  },
  {
    name: "Bitcoinjobs",
    address: "https://bitcoinjobs.com/",
    base: "https://bitcoinjobs.com",
  },
  {
    name: "Block",
    address: "https://block.xyz/careers?search=bitcoin",
  },
  {
    name: "BitMex",
    address: "https://boards.greenhouse.io/bitmex",
    base: "https://boards.greenhouse.io",
  },
  {
    name: "21.co",
    address: "https://boards.greenhouse.io/21co",
    base: "https://boards.greenhouse.io",
  },
  {
    name: "Cormint",
    address: "https://recruiting.paylocity.com/recruiting/jobs/All/4f22a546-5450-4906-98bf-d23603e05114/Cormint-Data-Systems-Inc",
    base: "https://recruiting.paylocity.com",
  },
  {
    name: "Holepunch",
    address: "https://holepunch.recruitee.com",
    base: "https://holepunch.recruitee.com",
  },
  {
    name: "DreamStartupJob",
    address: "https://dreamstartupjob.com/jobs/?q=bitcoin&l=&industry=Cryptocurrency",
  },
];

const jobData = {};

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
app.get("/", (req, res) => {
  res.json(jobData); // Return the jobData object as JSON response
});

process.setMaxListeners(15); // Increase the limit to an appropriate number

async function  scrapeJobData(website) {
  let options = {};
  let browser;
  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  }
  try {
    browser = await puppeteer.launch(options);
    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(60000);

    await page.goto(website.address);

    let websiteJobs = [];

    if (website.name === "Bitcoinerjobs") {
      websiteJobs = await scrapeBitcoinerjobs(page, website.address);
      console.log("Bitcoinerjobs jobs:", websiteJobs.length);
    }
    else if (website.name === "Cryptocurrencyjobs") {
      websiteJobs = await scrapeCryptocurrencyjobs(page, website.base);
      console.log("Cryptocurrencyjobs jobs:", websiteJobs.length);
    } else if (website.name === "BTC-Suisse") {
      websiteJobs = await scrapeBTCSuisse(page);
      console.log("BTC-Suisse jobs:", websiteJobs.length);
    } else if (website.name === "Bitfinex") {
      websiteJobs = await scrapeBitfinex(page, website.base);
      console.log("Bitfinex jobs:", websiteJobs.length);
    } else if (website.name === "Bitrefill") {
      websiteJobs = await scrapeBitrefill(page);
      console.log("Bitrefill jobs:", websiteJobs.length);
    } else if (website.name === "Migodi") {
      websiteJobs = await scrapeMigodi(page, website.base);
      console.log("Migodi jobs:", websiteJobs.length);
    } else if (website.name === "Tramell") {
      websiteJobs = await scrapeTramell(page, website.base);
      console.log("Tramell jobs:", websiteJobs.length);
    } else if (website.name === "River") {
      websiteJobs = await scrapeRiver(page, website.base);
      console.log("River jobs:", websiteJobs.length);
    } else if (website.name === "BitGo") {
      websiteJobs = await scrapeBitGo(page, website.base);
      console.log("BitGo jobs:", websiteJobs.length);
    } else if (website.name === "Thndr") {
      websiteJobs = await scrapeThndr(page, website.base);
      console.log("Thndr jobs:", websiteJobs.length);
    } else if (website.name === "Braiins") {
      websiteJobs = await scrapebraiins(page);
      console.log("Braiins jobs:", websiteJobs.length);
    } else if (website.name === "Riotplatforms") {
      websiteJobs = await scrapeRiotplatforms(page, website.base);
      console.log("Riotplatforms jobs:", websiteJobs.length);
    } else if (website.name === "Bitcoinjobs") {
      websiteJobs = await scrapeBitcoinjobs(page, website.base);
      console.log("Bitcoinjobs jobs:", websiteJobs.length);
    } else if (website.name === "Block") {
      websiteJobs = await scrapeBlock(page);
      console.log("Block jobs:", websiteJobs.length);
    } else if (website.name === "BitMex") {
      websiteJobs = await scrapeBitMex(page, website.base);
      console.log("BitMex jobs:", websiteJobs.length);
    } else if (website.name === "21.co") {
      websiteJobs = await scrape21co(page, website.base);
      console.log("21.co jobs:", websiteJobs.length);
    } else if (website.name === "Cormint") {
      websiteJobs = await scrapeCormint(page, website.base);
      console.log("Cormint jobs:", websiteJobs.length);
    } else if (website.name === "Holepunch") {
      websiteJobs = await scrapeHolepunch(page, website.base);
      console.log("Holepunch jobs:", websiteJobs.length);
      console.log(websiteJobs);
    } else if (website.name === "DreamStartupJob") {
      websiteJobs = await scrapeDreamStartupJob(page);
      console.log("DreamStartupJob jobs:", websiteJobs.length);
    }

    // TODO: just checking jobs from last month ?? DB might become to big to go through each time haha
    else jobData[website.name] = websiteJobs;

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

    await browser.close();
  } catch (error) {
    console.error("Error scraping website", website.name, error);
  }
}

async function scraperjobs() {
  for (const website of websites) {
    await scrapeJobData(website);
  }
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
//on error restart the script after 5 seconds
process.on("unhandledRejection", (reason, p) => {
  console.error(reason, "Unhandled Rejection at Promise", p);
  setTimeout(() => {
    scraperjobs();
  }, 5000);
});