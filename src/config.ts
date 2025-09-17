const config = {
  apiUrl: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:4242/api.php'
    : './api/api.php'
};

export default config;