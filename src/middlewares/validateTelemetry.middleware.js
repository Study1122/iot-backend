import Joi from "joi";
import { ApiError } from "../utils/ApiError.js";

// Define the schema for telemetry
const telemetrySchema = Joi.object({
  data: Joi.object({
    temperature: Joi.number().required(),
    humidity: Joi.number().required(),
    voltage: Joi.number().required()
    //pressure: Joi.number().required()
  }).unknown(true).required() //Allow extra telemetry fields 
});

// Middleware function
export const validateTelemetry = (req, res, next) => {
  const { error } = telemetrySchema.validate(req.body);
  if (error) {
    throw new ApiError(400, `Invalid telemetry data: ${error.details[0].message}`);
  }
  next();
};