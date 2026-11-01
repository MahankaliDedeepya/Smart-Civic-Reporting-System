
require("dotenv").config({
  path: require("path").join(__dirname, ".env")
});

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log("Gemini API key not found!");
    return;
  }

  const modelName = "gemini-3.5-flash-lite";

  try {
    console.log("Testing model:", modelName);
    console.log("Sending generation request...");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Reply with: Gemini backend is working."
                }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: 50
          }
        }),
        signal: AbortSignal.timeout(90000)
      }
    );

    const data = await response.json();

    console.log("HTTP STATUS:", response.status);

    if (!response.ok) {
      console.log("GEMINI ERROR:", data);
      return;
    }

    const answer =
      data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("");

    console.log("SUCCESS!");
    console.log("Gemini response:", answer);

  } catch (error) {
    console.log("CONNECTION ERROR:", error.message);
    console.log("ERROR DETAILS:", error.cause || error);
  }
}

testGemini();
