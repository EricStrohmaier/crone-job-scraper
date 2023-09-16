const { Configuration, OpenAIApi } = require("openai");

const GPT_MODEL = "gpt-3.5-turbo-16k";

const apiKey = process.env.OPENAI_API_KEY;

const configuration = new Configuration({
  apiKey: apiKey,
});

const openai = new OpenAIApi(configuration);

export async function setDescriptionInfo(description) {
  const prompt =
    `Summrise a short one sentenc of their Description .Plus extract companys important information. If not avalible, leave blank. Like + {
        salary: string,
            }` + description;

  return getDescriptionData(prompt);
}

export async function getDescriptionData(text) {
  try {
    const response = await openai.createChatCompletion({
      model: GPT_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a data extractor. Respond only with json data",
        },
        { role: "user", content: text },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0.2,
      presence_penalty: 0.2,
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.log(`Failed to generate data.\n\nError: ${error}`);
    return "";
  }
}
