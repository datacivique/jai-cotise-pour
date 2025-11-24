import type { HistoricalData } from "../components/types";

export function calculateTRI(historicalData: HistoricalData[], perso: boolean) {

  // 1) Construire les cash flows dans l’ordre
  const cashFlows: number[] = [];

  historicalData.forEach((data) => {
    const cotisations = perso ? data.totalCnavPlafondEnSalMoy :
      (data.totalCnavPlafondEnSalMoyCroissMasSal + data.totalCnavHorsPlafondEnSalMoyCroissMasSal);
    
    const pension = data.pensionEnSalMoy;

    const addIf = (cond: boolean, amount: number) => {
      if (cond && amount !== 0) cashFlows.push(amount);
    };

    // Cotisations (négatives)
    const cotTr = -(cotisations * 3) / data.moisCotises;
    addIf(data.t1.isCotised, cotTr);
    addIf(data.t2.isCotised, cotTr);
    addIf(data.t3.isCotised, cotTr);
    addIf(data.t4.isCotised, cotTr);

    // Pensions (positives)
    const penTr = (pension * 3) / data.moisPensionnes;
    addIf(data.t1.isRetired, penTr);
    addIf(data.t2.isRetired, penTr);
    addIf(data.t3.isRetired, penTr);
    addIf(data.t4.isRetired, penTr);
  });

  // 2) fonction valeur actuelle nette
  const NPV = (rate: number) => {
    let npv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      npv += cashFlows[t] / Math.pow(1 + rate, t);
    }
    return npv;
  };

  // 3) Bisection — méthode stable
  let low = -0.99;
  let high = 1.0; // 100% par trimestre (déjà énorme)
  let mid = 0;

  for (let i = 0; i < 200; i++) {
    mid = (low + high) / 2;
    const npv = NPV(mid);

    if (Math.abs(npv) < 1e-7) break;

    if (npv > 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

    return Math.pow(1 + mid, 4) - 1; // annualisation effective
}
