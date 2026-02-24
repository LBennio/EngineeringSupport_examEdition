
export function buildServiceError(errorObject, fallbackMessage) {
  const message =
    (errorObject?.message && String(errorObject.message).trim() !== "")
      ? String(errorObject.message).trim()
      : fallbackMessage;

  const serviceError = new Error(message);
  serviceError.status = typeof errorObject?.status === "number" ? errorObject.status : 0;
  serviceError.type = typeof errorObject?.type === "string" ? errorObject.type : "unknown";
  return serviceError;
}
