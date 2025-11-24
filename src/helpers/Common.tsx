import type { HistoricalData, SimulationData } from "../components/types";

export const ParseCSV = (content: string): any[] => {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(';');
  return lines.slice(1).map(line => {
    const values = line.split(';');
    const obj: any = {};
    headers.forEach((header, idx) => {
      const value = values[idx]?.trim();
      obj[header.trim()] = value;
    });
    return obj;
  });
};

export function formatNum(
  value?: number | null,
  decimals = 0,
  currency: string | null = ''
): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '-';

  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  const withApostrophes = formatted.replace(/\u202F|\u00A0|\s/g, "'");

  return currency ? `${withApostrophes} ${currency}` : withApostrophes;
}

export function changeNaN(n: number, defaultValue: number = 0): number {
  return Number.isFinite(n) ? n : defaultValue;
};

export function getAge0(data: HistoricalData[]): HistoricalData {
  for (let i = 0; i < data.length; i++) {
    if (data[i].age == 0) {
      return data[i];
    }
  }
  return createHistoricalData();
}

export function createHistoricalData(): HistoricalData {
  return {
          year: NaN,
          masseSalarialeBrut: NaN,
          masseSalarialePubliqueBrut: NaN,
          pmss: NaN,
          pmssNet: NaN,
          inflation: NaN,
          ageRetraite: NaN,
          dureeCotisation: NaN,
          esperanceVie: NaN,
          txCnavPlafond: NaN,
          txCnavSalaire: NaN,
          s11: NaN,
          s12: NaN,
          s13: NaN,
          s14: NaN,
          s15: NaN,
          salMoyNetAnTc: NaN,

          salMensRefEnSalMoy: 0,

          moisCotises: 0,
          moisPensionnes: 0,
          salMoyNetMens: 0,
          isHisto: true,
          ratioBrutNet: 0,
          masseSalarialeBrutPrive: NaN,
          totalCnavPlafondEnSalMoy: NaN,
          totalCnavHorsPlafondEnSalMoy: NaN,
          croissanceMasseSalarialePriveBrut: NaN,
          croissanceMasseSalarialePriveBrutCumule: NaN,
          totalCnavPlafondEnSalMoyCroissMasSal: NaN,
          totalCnavHorsPlafondEnSalMoyCroissMasSal: NaN,
          inflationMoinsCroissanceSalMoy: NaN,
          pensionMensEnSalMoy:NaN,
          pensionEnSalMoy:NaN,
          age:NaN,
          dureeVieEnRetraite:NaN,
    t1: createSimulationData(),
    t2: createSimulationData(),
    t3: createSimulationData(),
    t4: createSimulationData(),
    sumtotalCnavPlafondEnSalMoy:0,
    sumtotalCnavHorsPlafondEnSalMoy:0,
    sumtotalCnavPlafondEnSalMoyCroissMasSal:0,
    sumtotalCnavHorsPlafondEnSalMoyCroissMasSal:0,
    sumpensionMensEnSalMoy:0,
  };
}


export function createSimulationData(): SimulationData {
  return {
    isCotised: false,
    isRetired: false,
    pensionEnSalMoy: NaN,
    totalCnavPlafondEnSalMoy: NaN,
    totalCnavHorsPlafondEnSalMoy: NaN,
    totalCnavPlafondEnSalMoyCroissMasSal: NaN,
    totalCnavHorsPlafondEnSalMoyCroissMasSal: NaN,
  };
}

