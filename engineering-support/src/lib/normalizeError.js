
export function normalizeErrorToMessage(unknownError, fallbackMessage = "Operazione fallita.") {
  if (typeof unknownError === "string" && unknownError.trim() !== "") {
    return unknownError.trim();
  }

  if (unknownError instanceof Error) {
    if (unknownError.message && unknownError.message.trim() !== "") {
      return unknownError.message.trim();
    }
    return fallbackMessage;
  }

  if (unknownError && typeof unknownError === "object") {
    const possibleMessage =
      unknownError?.error?.message ||
      unknownError?.message ||
      unknownError?.details?.message;

    if (typeof possibleMessage === "string" && possibleMessage.trim() !== "") {
      return possibleMessage.trim();
    }
  }

  return fallbackMessage;
}
