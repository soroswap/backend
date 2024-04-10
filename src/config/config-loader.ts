export const configLoader = () => {
  return {
    apiKey: process.env.API_KEY,
    backendURL: process.env.BACKEND_URL,
    redis: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
    }
  };
};
