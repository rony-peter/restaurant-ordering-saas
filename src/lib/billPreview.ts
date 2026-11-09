// Same maths as the server (billing.calculator.ts), for the sample bill on the settings page.
// Money is in whole paise, so there are no floating point surprises.

export interface PreviewSettings {
  gstRate: number;
  serviceChargeEnabled: boolean;
  serviceChargePercent: number;
}

export interface PreviewBill {
  foodPaise: number;
  serviceChargePaise: number;
  gstBasePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  totalTaxPaise: number;
  roundOffPaise: number;
  grandTotalPaise: number;
}

export function previewBill(foodPaise: number, s: PreviewSettings): PreviewBill {
  const serviceChargePaise = s.serviceChargeEnabled
    ? Math.round((foodPaise * s.serviceChargePercent) / 100)
    : 0;

  // GST is charged on the food plus the service charge
  const gstBasePaise = foodPaise + serviceChargePaise;
  const totalTaxPaise = s.gstRate > 0 ? Math.round((gstBasePaise * s.gstRate) / 100) : 0;
  const cgstPaise = Math.round(totalTaxPaise / 2);
  const sgstPaise = totalTaxPaise - cgstPaise;

  const raw = foodPaise + serviceChargePaise + totalTaxPaise;
  const grandTotalPaise = Math.round(raw / 100) * 100; // rounded to the nearest rupee
  return {
    foodPaise,
    serviceChargePaise,
    gstBasePaise,
    cgstPaise,
    sgstPaise,
    totalTaxPaise,
    roundOffPaise: grandTotalPaise - raw,
    grandTotalPaise,
  };
}

export const rupees = (paise: number) =>
  `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;