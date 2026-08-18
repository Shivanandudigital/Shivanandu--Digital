export const ORIGIN_PINCODE = "742405";

export function cardUnitPrice(quantity: number) {
  if (quantity >= 7) return 40;
  if (quantity >= 4) return 50;
  return 70;
}

export function cardSubtotal(quantity: number) {
  return quantity * cardUnitPrice(quantity);
}

// PVC cards weigh about 5g each. The 15g allowance covers the secure envelope.
export function estimatedShipmentWeight(quantity: number) {
  return Math.min(200, 15 + quantity * 5);
}

export function speedPostCharge(destinationPincode: string, quantity: number) {
  if (!/^[1-9]\d{5}$/.test(destinationPincode)) return 0;
  const weight = estimatedShipmentWeight(quantity);
  let base: number;

  if (destinationPincode === ORIGIN_PINCODE) {
    base = weight <= 50 ? 15 : 25;
  } else {
    const firstDigit = Number(destinationPincode[0]);
    const nearbyEast = firstDigit === 7 || firstDigit === 8;
    if (weight <= 50) base = 35;
    else base = nearbyEast ? 40 : 70;
  }

  return Math.ceil(base * 1.18);
}

export function calculatePvcTotal(quantity: number, deliveryMethod: string, pincode: string) {
  const subtotal = cardSubtotal(quantity);
  const deliveryCharge = deliveryMethod === "home_delivery" ? speedPostCharge(pincode, quantity) : 0;
  return { quantity, unitPrice: cardUnitPrice(quantity), subtotal, deliveryCharge, total: subtotal + deliveryCharge };
}
