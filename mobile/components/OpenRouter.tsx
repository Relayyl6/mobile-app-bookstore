import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultHeaders: {
    "X-Title": "Yemuel Store", // Optional. Site title for rankings on openrouter.ai.
  },
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: "anthropic/claude-opus-4.5",
    messages: [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What is in this image?"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "https://live.staticflickr.com/3851/14825276609_098cac593d_b.jpg"
            }
          }
        ]
      }
    ]
  });

  console.log(completion.choices[0].message);
}

main();