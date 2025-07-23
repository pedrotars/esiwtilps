// Temporary debug file to check environment variables
console.log('=== ENVIRONMENT DEBUG ===');
console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('=== END DEBUG ===');

export const debugEnv = () => {
  return {
    url: process.env.REACT_APP_SUPABASE_URL,
    key: process.env.REACT_APP_SUPABASE_ANON_KEY
  };
};