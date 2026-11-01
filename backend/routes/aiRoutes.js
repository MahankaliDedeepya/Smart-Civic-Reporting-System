
const express = require("express");
const multer = require("multer");

const router = express.Router();

// Store uploaded image in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Please upload an image file."));
    }
  }
});

router.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    // Check uploaded image
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an image."
      });
    }

    // Check API key
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "GEMINI_API_KEY is missing from backend .env"
      });
    }

    // Prompt for Gemini


const prompt = `
Analyse the uploaded photo for a civic or municipal issue.

Use very simple English that an ordinary person can easily understand.

Return only valid JSON with these fields:
{
  "category": "Roads",
  "issueType": "Short and simple issue title",
  "description": "Explain the visible problem in 2 or 3 short sentences using simple words.",
  "severity": "MEDIUM",
  "department": "Responsible municipal department"
}

Choose exactly one category from:
Roads, Drainage, Garbage, Sanitation, Electricity, Water,
Traffic Infrastructure, Public Infrastructure, Other.

Choose exactly one severity:
LOW, MEDIUM, HIGH, CRITICAL.

Description writing rules:
- Use simple and common English words.
- Write only 2 or 3 short sentences.
- Avoid technical, scientific and difficult words.
- Clearly explain what the problem is and where it is visible in the image.
- Explain how it may affect people.
- Do not use complicated phrases.
- Do not invent details that cannot be seen.
- Make the description understandable to everyone.

Example of simple language:
"A large pothole is visible on the road.
It may cause accidents and make travel difficult for people."

Analyse the actual image, not a preset.
If no civic issue is clearly visible, use Other and explain why.
Severity is an estimate based on visible evidence.
`;


    const base64Image = req.file.buffer.toString("base64");

    // Prepare request data
    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: req.file.mimetype,
                data: base64Image
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    let response;
    let result;
    let lastError;

    // Try up to 3 times for temporary errors
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(`Gemini analysis attempt ${attempt + 1}/3`);

        response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey
            },
            body: JSON.stringify(requestBody),
            signal: AbortSignal.timeout(45000)
          }
        );

        result = await response.json();

        // Success or a non-retryable client error
        if (response.ok || response.status < 500) {
          break;
        }

        // Retry temporary server errors
        if (attempt < 2) {
          const delay = 2000 * (2 ** attempt);

          console.log(
            `Gemini returned ${response.status}. Retrying in ${delay / 1000} seconds...`
          );

          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        lastError = error;
        console.error("Gemini request error:", error.message);

        if (attempt < 2) {
          const delay = 2000 * (2 ** attempt);

          console.log(`Retrying in ${delay / 1000} seconds...`);

          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // Handle requests that never received a response
    if (!response) {
      return res.status(502).json({
        message:
          lastError?.name === "TimeoutError"
            ? "Gemini took too long to respond. Please try again."
            : "Could not connect to Gemini. Please try again later."
      });
    }

    // Handle Gemini errors after retries
    if (!response.ok) {
      console.error("Gemini API error:", result);

      return res.status(response.status === 503 ? 503 : 502).json({
        message:
          result?.error?.message ||
          "Gemini analysis failed. Please try again later."
      });
    }

    // Extract Gemini response
    const generatedText = result.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("");

    if (!generatedText) {
      console.error("Gemini returned no text:", result);

      return res.status(502).json({
        message: "Gemini did not return an analysis. Please try again."
      });
    }

    // Convert JSON text to an object
    let analysis;

    try {
      analysis = JSON.parse(generatedText);
    } catch (error) {
      console.error("Invalid Gemini JSON:", generatedText);

      return res.status(502).json({
        message: "Gemini returned an invalid response. Please try again."
      });
    }

    // Validate category and severity
    const categories = [
      "Roads",
      "Drainage",
      "Garbage",
      "Sanitation",
      "Electricity",
      "Water",
      "Traffic Infrastructure",
      "Public Infrastructure",
      "Other"
    ];

    const severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

    if (!categories.includes(analysis.category)) {
      analysis.category = "Other";
    }

    if (!severities.includes(analysis.severity)) {
      analysis.severity = "MEDIUM";
    }

    // Send results to React
    return res.json({
      category: analysis.category,
      issueType: analysis.issueType || "Civic issue detected",
      description: analysis.description || "",
      severity: analysis.severity,
      department:
        analysis.department || "Municipal Grievance Department"
    });

  } catch (error) {
    console.error("AI analysis failed:", error);

    return res.status(500).json({
      message: error.message || "AI analysis failed."
    });
  }
});

module.exports = router;
