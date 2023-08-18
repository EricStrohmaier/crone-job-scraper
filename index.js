const puppeteer = require('puppeteer');
const { CronJob } = require('cron'); // Import the node-cron package
const { createClient } = require('@supabase/supabase-js');
const bitcoinerjobsScraper = require('./scraper/bitcoinerjobsScraper');
const scrapeCryptoJobsList = require('./scraper/cryptoJobsListScraper');
const scrapePompcryptojobs = require('./scraper/pomcryptojobs');

require('dotenv').config();

 const supabaseUrl = 'https://hnfpcsanqackenyhtoep.supabase.co';
 const supabaseKey = process.env.PUPLIC_SUPABASE_KEY;
 const supabase = createClient(supabaseUrl, supabaseKey);

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
    },
    {
        name: "Pompcryptojobs",
        address: "https://pompcryptojobs.com/jobs/?q=bitcoin",
        base: ""
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

         if (website.name === 'Bitcoinerjobs') {
             websiteJobs = await bitcoinerjobsScraper(page);
         } else if (website.name === 'CryptoJobsList') {
             websiteJobs = await scrapeCryptoJobsList(page, website.base);
         } else 
        if (website.name === 'Pompcryptojobs') {
            websiteJobs = await scrapePompcryptojobs(page);
        }

        jobData[website.name] = websiteJobs;

         for (const job of websiteJobs) {
             const { data: existingData } = await supabase
                 .from(website.name) // Use the website's name as the table name
                 .select('*')
                 .eq('title', job.title) // Check if the title already exists
                 .single();

             if (!existingData) {
                 // Insert the job only if it doesn't exist
                 const { data, error } = await supabase
                     .from(website.name)
                     .insert([
                         {
                             title: job.title,
                             url: job.url,
                             company: job.company,
                             location: job.location,
                         }
                     ]);
             }
         }

        await browser.close();
    } catch (error) {
        console.error('Error scraping job data:', error);
    }
}


async function scraperjobs() {
    for (const website of websites) {
        await scrapeJobData(website);
    }
    
    console.log(jobData);
}

//    ('0 */8 * * * ')    //every 8 hours
console.log("Scraperjobs starting...");
 const fetchJobData = new CronJob('0 15 * * *', async () => {
     console.log('It is 3PM the job data scraper has started ...');
     await scraperjobs();
     console.log('The job data scraper has completed.');
 });
 fetchJobData.start();
 
 
 //scraperjobs(); // Call the function to initiate scraping

 module.exports = {
     scraperjobs // Export the function for external use
 };
