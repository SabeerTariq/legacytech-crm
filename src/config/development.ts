// Production configuration - no mock functionality
// All authentication and data operations use real Supabase backend

// Helper function to safely parse JSON responses (kept for potential future use)
export const safeJsonParse = async (response: Response) => {
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error('JSON parsing error:', error);
    return null;
  }
}; 