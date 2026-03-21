import process from "process";

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    console.log("No API Key found.");
    return;
  }

  const versions = ["v1", "v1beta"];
  for (const v of versions) {
    console.log(`\n--- Checking version ${v} ---`);
    const apiUrl = `https://generativelanguage.googleapis.com/${v}/models?key=${apiKey}`;
    try {
      const res = await fetch(apiUrl);
      const json = await res.json();
      if (json.models) {
        console.log(`Models found for ${v}:`, json.models.map(m => m.name.split('/').pop()));
      } else {
        console.log(`No models array found for ${v}:`, JSON.stringify(json));
      }
    } catch (e) {
      console.log(`Failed to list models for ${v}:`, e.message);
    }
  }
}

listModels();
