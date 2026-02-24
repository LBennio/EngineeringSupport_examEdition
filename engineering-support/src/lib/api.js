
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const DEFAULT_TIMEOUT_MS = 12000;

async function safeParseJsonResponse(httpResponse) {
  try {
    const parsedBody = await httpResponse.json();
    return { parsedBody, parseErrorOccurred: false };
  } catch {
    return { parsedBody: null, parseErrorOccurred: true };
  }
}


function extractErrorMessageFromResponseBody(responseBody) {
  if (!responseBody || typeof responseBody !== "object") {
    return "Errore dal server.";
  }

  const candidates = [
    responseBody.message,
    responseBody.error?.message,
    responseBody.error,
    responseBody.details?.message
  ];

  const firstValidMessage = candidates.find(
    (value) => typeof value === "string" && value.trim() !== ""
  );

  return firstValidMessage ? firstValidMessage.trim() : "Errore dal server.";
}


export async function apiRequest(apiPath, requestOptions = {}) {
  if (!API_BASE_URL) {
    return {
      ok: false,
      data: null,
      error: {
        message: "NEXT_PUBLIC_API_BASE_URL non configurato.",
        status: 0,
        type: "config"
      }
    };
  }

  const requestUrl = `${API_BASE_URL}${apiPath}`;

  const timeoutMs =
    typeof requestOptions.timeoutMs === "number" ? requestOptions.timeoutMs : DEFAULT_TIMEOUT_MS;

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

  try {
    const httpResponse = await fetch(requestUrl, {
      credentials: "include",
      signal: abortController.signal,
      headers: {
        "Content-Type": "application/json",
        ...(requestOptions.headers || {})
      },
      ...requestOptions
    });

    const responseContentType = httpResponse.headers.get("content-type") || "";
    const isJsonResponse = responseContentType.includes("application/json");

    const isNoContentResponse = httpResponse.status === 204;

    let responseBody = null;
    let jsonParseFailed = false;

    if (!isNoContentResponse && isJsonResponse) {
      const { parsedBody, parseErrorOccurred } = await safeParseJsonResponse(httpResponse);
      responseBody = parsedBody;
      jsonParseFailed = parseErrorOccurred;
    }

    if (!httpResponse.ok) {
      const errorMessage = jsonParseFailed
        ? "Errore dal server: risposta JSON non valida."
        : extractErrorMessageFromResponseBody(responseBody);

      return {
        ok: false,
        data: null,
        error: {
          message: errorMessage,
          status: httpResponse.status,
          type: "http"
        }
      };
    }

    if (isJsonResponse && jsonParseFailed) {
      return {
        ok: false,
        data: null,
        error: {
          message: "Risposta del server non interpretabile (JSON non valido).",
          status: httpResponse.status,
          type: "parse"
        }
      };
    }

    return { ok: true, data: responseBody, error: null };
  } catch (unknownFetchError) {
    if (unknownFetchError?.name === "AbortError") {
      return {
        ok: false,
        data: null,
        error: {
          message: `Timeout: nessuna risposta dal backend entro ${timeoutMs}ms.`,
          status: 0,
          type: "timeout"
        }
      };
    }

    return {
      ok: false,
      data: null,
      error: {
        message: "Network error: backend non raggiungibile o CORS non configurato.",
        status: 0,
        type: "network"
      }
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
