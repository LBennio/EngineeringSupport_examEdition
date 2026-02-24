
export function generateClientId(prefix) {
  const randomPart = Math.random().toString(16).slice(2);
  return `${prefix}-${Date.now()}-${randomPart}`;
}

export function computeNextIncrementalCode(codePrefix, existingItems, codeFieldName = "code") {
  const itemsArray = Array.isArray(existingItems) ? existingItems : [];

  let maxNumber = 0;

  itemsArray.forEach((item) => {
    const rawCode = String(item?.[codeFieldName] || "");
    const match = rawCode.match(new RegExp(`^${codePrefix}-(\\d+)$`));
    if (!match) return;

    const numericValue = Number(match[1]);
    if (Number.isFinite(numericValue) && numericValue > maxNumber) {
      maxNumber = numericValue;
    }
  });

  return `${codePrefix}-${maxNumber + 1}`;
}
