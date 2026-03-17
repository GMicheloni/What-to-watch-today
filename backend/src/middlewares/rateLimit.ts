import rateLimit from "express-rate-limit";

export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    error: "Too many search requests. Please try again later.",
  },
});
