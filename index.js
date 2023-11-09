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
const scrapeCashApp = require("./scraper/cashapp");
const scrapeBitMex = require("./scraper/BitMex");
const scrapebraiins = require("./scraper/braiins");
const scrapeRiotplatforms = require("./scraper/riotplatforms");
const scrapeBitcoinjobs = require("./scraper/bitcoinjobs");
const e = require("express");
const scrapeBlock = require("./scraper/block");
const scrapeStrike = require("./scraper/strike");

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
  // {
  //   name: "Xverse",
  //   address: "https://wellfound.com/company/xverse/jobs",
  // },
  {
    name: "Thndr",
    address: "https://www.thndr.games/careers",
    base: "https://www.thndr.games",
  },
  {
    name: "CashApp",
    address: "https://cash.app/careers",
  },
  {
    name: "BitMex",
    address: "https://boards.greenhouse.io/bitmex",
    base: "https://boards.greenhouse.io",
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
    name: "Strike",
    address:
      "https://boards.greenhouse.io/embed/job_board?for=strike&b=https%3A%2F%2Fstrike.me%2Fcareers%2F",
  },
];

const jobData = {};

app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// Define a route to access the scraped job data
app.get("/", (req, res) => {
  res.json(jobData); // Return the jobData object as JSON response
});

process.setMaxListeners(15); // Increase the limit to an appropriate number

async function  scrapeJobData(website) {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
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
    } else if (website.name === "Cryptocurrencyjobs") {
      websiteJobs = await scrapeCryptocurrencyjobs(page, website.base);
      console.log("CryptoJobsList jobs:", websiteJobs.length);
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
    }
    // if (website.name === "CashApp") {
    //   websiteJobs = await scrapeCashApp(page);
    //   console.log("CashApp jobs:", websiteJobs.length);
    // } else
    else if (website.name === "Braiins") {
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
    }
    // if (website.name === "Strike") {
    //   websiteJobs = await scrapeStrike(page);
    //   console.log("Strike jobs:", websiteJobs.length );
    // }
    // else if (website.name === "BitMex") {
    //   websiteJobs = await scrapeBitMex(page, website.base);
    //   console.log("BitMex jobs:", websiteJobs.length);
    //   console.log("BitMex jobs:", websiteJobs);
    // }

    // if (website.name === "Xverse") {
    //   websiteJobs = await scrapeXverse(page, website.base);
    //   console.log("Xverse jobs:", websiteJobs.length);
    //   console.log("Xverse jobs:", websiteJobs);
    // }

    // TODO: just checking jobs from last month ?? DB might become to big to go through each time haha
    else jobData[website.name] = websiteJobs;

    for (const job of websiteJobs) {
      const { data: existingData } = await supabase
        .from(website.name)
        .select("title, url")
        .eq("title", job.title)
        .eq("url", job.url);

      //console.log("existingData", existingData);

      if (existingData.length === 0) {
        console.log("job inserting ", job.title);
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
            applyURL: job.applyUrl,
          },
        ]);
        // console.log("Jobs inserted:", job.title , job.url);

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

const fetchJobData = new CronJob("0 */4 * * *", async () => {
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
