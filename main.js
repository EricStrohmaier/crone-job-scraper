const PORT = process.env.PORT || 8000;
const express = require('express');
const puppeteer = require('puppeteer');
const { CronJob } = require('cron'); // Import the node-cron package
const bitcoinerjobsScraper = require('./scraper/bitcoinerjobsScraper');
const scrapeCryptoJobsList = require('./scraper/cryptoJobsListScraper');

const app = express();

const websites = [
    {
        name: 'Bitcoinerjobs',
        address: 'https://bitcoinerjobs.com/',
        base: ''
    },
    {
        name: 'CryptoJobsList',
        address: 'https://cryptojobslist.com/bitcoin',
        base: 'https://cryptojobslist.com'
    }
    // Add more job sources if needed
];

const jobData = {}; // Store job listings by category
async function scrapeJobData(website) {
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        await page.goto(website.address);

        let websiteJobs = [];

     
            websiteJobs = await bitcoinerjobsScraper(page);
     
            websiteJobs = await scrapeCryptoJobsList(page, website.base);
        
        
        // You can continue adding more conditions for other websites

        jobData[website.name] = websiteJobs;

        await browser.close();
    } catch (error) {
        console.error('Error scraping job data:', error);
    }
}

async function scrapeAllJobs() {
   for (const website of websites) {
       await scrapeJobData(website);
   }
       
}
// scrapeAllJobs();

 // Define the cron schedule

  scrapeAllJobs();
const fetchJobData = new CronJob('* * * * *', async () => {
    console.log('Running every minute job data scrape...');
    await scrapeAllJobs();
    console.log('Every minute job data scrape completed.');
});
fetchJobData.start();




app.get('/', (req, res) => {
    res.json('Welcome to my Bitcoin Job API');
});

app.get('/new', (req, res) => {
    res.json(jobData);
});

app.get('/new/:newJobDataId', (req, res) => {
    const newJobDataId = req.params.newJobDataId;

    if (jobData[newJobDataId]) {
        res.json(jobData[newJobDataId]);
    } else {
        res.status(404).json({ error: 'Job source not found' });
    }
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
