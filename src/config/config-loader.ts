export const configLoader = () => {
  return {
    apiKey: process.env.API_KEY,
    redis: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
    }
  };
};
