// GitHub Gists integration for statistics synchronization

const GIST_ID = import.meta.env.VITE_GIST_ID || '124059bda44f6f615ecd48d1fcef1338';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';

export async function loadStatsFromGist(): Promise<any> {
  try {
    if (!GITHUB_TOKEN) {
      console.warn('GitHub token not configured, using localStorage only');
      return null;
    }
    
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      console.error('Failed to load from Gist:', response.status);
      return null;
    }

    const gist = await response.json();
    const fileContent = gist.files['amalgama-stats.json']?.content;
    
    if (fileContent) {
      return JSON.parse(fileContent);
    }
    return null;
  } catch (error) {
    console.error('Error loading stats from Gist:', error);
    return null;
  }
}

export async function saveStatsToGist(stats: any): Promise<boolean> {
  try {
    if (!GITHUB_TOKEN) {
      console.warn('GitHub token not configured, stats saved to localStorage only');
      return false;
    }
    
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: {
          'amalgama-stats.json': {
            content: JSON.stringify(stats, null, 2),
          },
        },
      }),
    });

    if (!response.ok) {
      console.error('Failed to save to Gist:', response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving stats to Gist:', error);
    return false;
  }
}

// Sync stats with Gist (load from cloud, merge with local, save back)
export async function syncStatsWithGist(): Promise<any> {
  try {
    // Load from Gist
    const cloudStats = await loadStatsFromGist();
    
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
    
    // Save to Gist
    await saveStatsToGist(merged);
    
    return merged;
  } catch (error) {
    console.error('Error syncing stats:', error);
    return null;
  }
}
