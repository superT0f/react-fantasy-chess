const config = {
  apiUrl: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:4242'
    : './api',
  fetchOptions: {
    credentials: 'include' as RequestCredentials,
    headers: {
      'Content-Type': 'application/json',
    }
  }
};

export default config;