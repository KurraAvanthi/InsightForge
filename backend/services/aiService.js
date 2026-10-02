const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function analyzeCreative(imageUrl) {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing in .env");
  }

  console.log("Sending image to Groq...");

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },

      body: JSON.stringify({
        model: "qwen/qwen3.8-27b",

        temperature: 0.2,

        max_completion_tokens: 1500,

        response_format: {
          type: "json_object",
        },

        messages: [
          {
            role: "system",

            content:
              "You are a marketing creative analysis assistant. Analyze the provided marketing image and return only valid JSON.",
          },

          {
            role: "user",

            content: [
              {
                type: "text",

                text: `
Analyze this marketing creative.

Return JSON using exactly this structure:

{
  "visualElements": {
    "dominantColors": [],
    "composition": "",
    "objects": [],
    "style": ""
  },
  "textAndCTA": {
    "mainText": "",
    "cta": "",
    "textDensity": "",
    "ctaProminence": ""
  },
  "productVisibility": {
    "product": "",
    "prominence": "",
    "placement": ""
  },
  "humanPresence": {
    "present": false,
    "description": ""
  },
  "marketingSummary": "",
  "recommendations": []
}

Focus on:

- dominant colors
- composition
- objects/products
- visual style
- visible text
- CTA
- text density
- CTA prominence
- product visibility
- human presence
- marketing summary
- practical recommendations

Do not invent information that cannot reasonably be observed.
`,
              },

              {
                type: "image_url",

                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Groq API error ${response.status}: ${errorText}`
    );
  }

  const data = await response.json();

  const content =
    data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error(
      "Groq returned an empty analysis response"
    );
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    console.error(
      "Failed to parse Groq JSON:",
      content
    );

    throw new Error(
      "Groq returned invalid JSON"
    );
  }
}

module.exports = {
  analyzeCreative,
};