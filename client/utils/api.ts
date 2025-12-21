// This selects the production URL if it exists, otherwise it uses localhost
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';