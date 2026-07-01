export function generateBaseSKU(description: string): string {
  const descUpper = description.toUpperCase();
  
  // 1. Identify Product Type (Prefix)
  let prefix = 'GEN';
  if (descUpper.includes('CAP')) prefix = 'PC';
  else if (descUpper.includes('DISC') || descUpper.includes('SEPARATOR')) prefix = 'SD';
  else if (descUpper.includes('BUSH')) prefix = 'NB';
  else if (descUpper.includes('WASHER')) prefix = 'TW';
  
  // 2. Extract Dimensions (Core)
  const dimRegex = /(OD\s*\d+|ID\s*\d+|DIA\s*\d+|M\s*\d+)/gi;
  const matches = descUpper.match(dimRegex) || [];
  const dimensions = matches.map(m => m.replace(/\s+/g, '')).join('-');
  
  // 3. Handle Modifiers (Suffix)
  let suffix = '';
  if (descUpper.includes('UPPER')) suffix = '-UP';
  if (descUpper.includes('BOTTOM')) suffix = '-BT';
  
  // Assemble & Uniqueness
  const parts = [prefix];
  if (dimensions) parts.push(dimensions);
  
  let baseSku = parts.join('-');
  if (suffix) baseSku += suffix;
  
  return baseSku;
}

export class SKURegistry {
  private seenSkus: Record<string, number> = {};

  registerExisting(sku: string) {
    // Expected format: PC-OD200-ID50-UP-V2 or PC-OD200-ID50-UP
    const match = sku.match(/^(.*?)(?:-V(\d+))?$/);
    if (match) {
      const base = match[1];
      const version = match[2] ? parseInt(match[2], 10) : 0;
      if (!this.seenSkus[base] || version > this.seenSkus[base]) {
        this.seenSkus[base] = version;
      }
    }
  }

  generateUniqueSKU(description: string): string {
    const baseSku = generateBaseSKU(description);
    
    if (this.seenSkus[baseSku] !== undefined) {
      this.seenSkus[baseSku]++;
      return `${baseSku}-V${this.seenSkus[baseSku]}`;
    } else {
      this.seenSkus[baseSku] = 0; // 0 means it exists without a -V suffix
      return baseSku;
    }
  }
}
