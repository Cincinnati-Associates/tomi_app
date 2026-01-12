export async function GET() {
  try {
    // Fetch current mortgage rates from Freddie Mac CSV
    const response = await fetch('https://www.freddiemac.com/pmms/docs/PMMS_history.csv', {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Freddie Mac API error: ${response.status}`);
    }

    const csvText = await response.text();

    // Parse CSV - skip header row, get most recent entry (last row)
    const lines = csvText.trim().split('\n');
    const lastLine = lines[lines.length - 1];
    const values = lastLine.split(',');

    // CSV format: date,pmms30,pmms30p,pmms15,pmms15p,pmms51,pmms51p,pmms51m,pmms51spread
    const date = values[0]; // e.g., "1/16/2025"
    const rate = parseFloat(values[1]); // e.g., "6.85"
    const points = parseFloat(values[2]); // e.g., "0.6"

    return Response.json({
      rate: rate,
      source: "Freddie Mac",
      date: date,
      points: points
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
