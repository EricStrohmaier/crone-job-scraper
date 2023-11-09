async function scrapeThndr(page, baseUrl) {
    const jobDetails = [];

    await page.waitForSelector(".w-dyn-list");

    // Extract job items
    const jobItems = await page.evaluate(baseUrl => { // Pass baseUrl as an argument
        const items = Array.from(document.querySelectorAll(".w-dyn-item"));
        const jobList = [];

        items.forEach((item) => {
            const link = item.querySelector("a");
            const titleElement = link.querySelector("h3");
            const title = titleElement ? titleElement.textContent : '';

            if (title.trim() === '') {
                return; // Skip entries with empty titles
            }

            const typeElement = item.querySelector(".job-meta .text-block-27");
            const locationElement = item.querySelector(".job-meta .text-block-28");

            const type = typeElement ? typeElement.textContent : '';
            const location = locationElement ? locationElement.textContent : '';

            const href = link.getAttribute("href");

            jobList.push({
                title,
                url: baseUrl + href, // Combine with baseUrl
                tags: [],
                company: "THNDR",
                location,
                type,
                salary: "",
                category: "",
                applyUrl: href,
            });
        });

        return jobList;
    }, baseUrl); // Pass baseUrl as an argument here

    jobDetails.push(...jobItems);

    return jobDetails;
}

module.exports = scrapeThndr;
