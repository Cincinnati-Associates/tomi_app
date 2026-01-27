import { generateText } from "ai";
import { getAIModel } from "@/lib/ai-provider";

export async function GET() {
  try {
    // Fetch Bankrate mortgage rates page
    const response = await fetch(
      'https://www.bankrate.com/mortgages/mortgage-rates/',
      {
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Bankrate fetch error: ${response.status}`);
    }

    const html = await response.text();

    // Try to extract the weekly national average directly from HTML first
    // The rate is in an element with id "brPreRateTrendsVisualV2-rate-trends-national-average"
    const nationalAvgMatch = html.match(/id="brPreRateTrendsVisualV2-rate-trends-national-average"[^>]*>\s*(\d+\.?\d*)%/);

    if (nationalAvgMatch) {
      const rate = parseFloat(nationalAvgMatch[1]);
      return Response.json({
        rate: rate,
        source: "Bankrate",
        date: "weekly average",
      });
    }

    // Fallback: try regex for "Weekly national average" followed by a percentage
    const weeklyAvgMatch = html.match(/Weekly national average[^0-9]*(\d+\.?\d*)%/i);

    if (weeklyAvgMatch) {
      const rate = parseFloat(weeklyAvgMatch[1]);
      return Response.json({
        rate: rate,
        source: "Bankrate",
        date: "weekly average",
      });
    }

    // Last resort: use Gemini to extract from HTML
    const { text } = await generateText({
      model: getAIModel(),
      prompt: `Extract the "Weekly national average" 30-year fixed mortgage rate from this Bankrate webpage HTML.

IMPORTANT: Look for the section labeled "Weekly national average" - NOT individual lender rates. The weekly national average should be around 6-7% and is displayed in a summary/trends section.

Return ONLY a JSON object with this exact format, no other text or markdown:
{"rate": <number as decimal like 6.19>}

HTML content:
${html.substring(0, 30000)}`,
      maxTokens: 50,
      temperature: 0,
    });

    // Parse the JSON response - handle potential markdown code blocks
    let jsonText = text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    }

    const data = JSON.parse(jsonText);

    return Response.json({
      rate: data.rate,
      source: "Bankrate",
      date: "weekly average",
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching mortgage rates:', error);
    return Response.json(
      { error: 'Failed to fetch mortgage rates', message: errorMessage },
      { status: 500 }
    );
  }
}
