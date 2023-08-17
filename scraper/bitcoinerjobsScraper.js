const { createClient } = require('@supabase/supabase-js')

require('dotenv').config();


async function scrapeBitcoinerjobs(page) {


const supabaseUrl = 'https://hnfpcsanqackenyhtoep.supabase.co'
const supabaseKey = process.env.PUPLIC_SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

    const websiteJobs = await page.evaluate(() => {
        const jobs = [];
        const jobElements = document.querySelectorAll('ul.jobs li');
        jobElements.forEach(async (jobElement) => {
            const title = jobElement.querySelector('.position').textContent.trim();
            const relativeUrl = jobElement.querySelector('a').getAttribute('href');
            const fullUrl = new URL(relativeUrl, window.location.href).href; // Use window.location.href to get the base URL
            const company = jobElement.querySelector('.company').textContent.trim();
            const location = jobElement.querySelector('.location .city').textContent.trim();
            const involvement = jobElement.querySelector('.involvement').textContent.trim();
            const timeago = jobElement.querySelector('.timeago').textContent.trim();

            if(jobs.length > 0){

            const { data, error } = await supabase
            .from('Bitcoinerjobs')
            .insert([{ "title": title, "url": fullUrl, company: company, location: location, involvement: involvement, timeago: timeago }])
        console.log(data);
        }
          
            jobs.push({
                title,
                url: fullUrl,
                company,
                location,
                involvement,
                timeago,
            });
        });
        
        return jobs;
    });

    return websiteJobs;
}

module.exports = scrapeBitcoinerjobs;
