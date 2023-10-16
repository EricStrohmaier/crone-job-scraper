async function scrapeBitfinex(page, baseUrl) {
  const jobDetails = [];

  const jobLinks = await page.$$eval(".job-title a", (elements) =>
    elements.map((element) => element.getAttribute("href"))
  );

  for (const link of jobLinks) {
    await page.goto(baseUrl + link);
    const pageContent = await page.evaluate(() => document.body.textContent);

    if (pageContent.includes("bitcoin") || pageContent.includes("Bitcoin")) {
      //   console.log(`'bitcoin' found on ${link}`);

      await page.waitForSelector(".info-container");

      // Use page.evaluate to extract the title and li text content
      const jobInfo = await page.evaluate(() => {
        const title = document.querySelector(".info h2").textContent;
        const liText = document.querySelector(".info li").textContent;
        return { title, liText };
      });
      //push to array and return
      // console.log("jobLItext", jobInfo.liText);

      jobDetails.push({
        title: jobInfo.title,
        url: baseUrl + link,
        location: "",
        type: "",
        company: "Bitfinex",
        tags: [],
        salary: "",
        category: jobInfo.liText,
        applyUrl: baseUrl + link,
      });
    } else {
    //   console.log(`'bitcoin' not found on ${link}`);
    }
    await page.goBack();
  }
  return jobDetails;
}

module.exports = scrapeBitfinex;
