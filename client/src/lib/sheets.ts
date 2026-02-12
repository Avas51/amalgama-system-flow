// Google Sheets integration for statistics synchronization

const SHEET_ID = import.meta.env.VITE_SHEET_ID || '1b5Y3dPxU3w2ICyd-v3hdT16_X0h2z5gPr_6n0EDMx1U';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

interface SheetStats {
  date: string;
  mode: string;
  completionPercent: number;
}

export async function loadStatsFromSheets(): Promise<SheetStats[] | null> {
  try {
    if (!API_KEY) {
      console.warn('Google API key not configured');
      return null;
    }

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Stats!A:D?key=${API_KEY}`
    );

    if (!response.ok) {
      console.error('Failed to load from Sheets:', response.status);
      return null;
    }

    const data = await response.json();
    const rows = data.values || [];

    // Skip header row and parse data
    const stats: SheetStats[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length >= 4) {
        stats.push({
          date: row[0],
          mode: row[1],
          completionPercent: parseInt(row[2]) || 0,
        });
      }
    }

    return stats;
  } catch (error) {
    console.error('Error loading stats from Sheets:', error);
    return null;
  }
}

export async function saveStatsToSheets(stats: any[]): Promise<boolean> {
  try {
    if (!API_KEY) {
      console.warn('Google API key not configured');
      return false;
    }

    // Prepare data for Sheets
    const values = [['Date', 'Mode', 'Completion %', 'Timestamp']];
    
    for (const stat of stats) {
      if (stat && stat.date && stat.mode) {
        values.push([
          stat.date,
          stat.mode,
          stat.completionPercent || 0,
          new Date().toISOString(),
        ]);
      }
    }

    // Use batchUpdate to write data
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}:batchUpdate?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              updateRange: {
                range: 'Stats!A1',
                values: values,
              },
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error('Failed to save to Sheets:', response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving stats to Sheets:', error);
    return false;
  }
}

// Sync stats with Sheets (load from cloud, merge with local, save back)
export async function syncStatsWithSheets(): Promise<any> {
  try {
    // Load from Sheets
    const cloudStats = await loadStatsFromSheets();

    // Load from localStorage
    const localStats = localStorage.getItem('amalgama-stats');
    let localArray = [];
    if (localStats) {
      try {
        localArray = JSON.parse(localStats);
      } catch (e) {
        console.error('Failed to parse local stats:', e);
      }
    }

    // Merge: cloud stats + local stats (local takes precedence for today)
    let merged = cloudStats || [];
    if (localArray.length > 0) {
      const today = new Date().toISOString().split('T')[0];

      // Remove today's entries from merged (we'll use local versions)
      merged = merged.filter((s: any) => s.date !== today);

      // Add local entries
      merged = [...merged, ...localArray.filter((s: any) => s.date === today)];
    }

    // Save merged stats back to localStorage
    localStorage.setItem('amalgama-stats', JSON.stringify(merged));

    // Save to Sheets
    await saveStatsToSheets(merged);

    return merged;
  } catch (error) {
    console.error('Error syncing stats:', error);
    return null;
  }
}
