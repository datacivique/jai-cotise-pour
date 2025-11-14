export type SimulationParams = {
  // Simulation
  birthYear: number;
  retirementAge: number;
  cotisationDuration: number;
  lifeExpectancy: number;
  indexationInflation: number;
  keepParams: boolean;
  // Projection
  ProjectionMasseSalarialeGrowth: number;
  ProjectionInflation: number;
  ProjectionPmssGrowth: number;
  ProjectionLifeExpectancyGrowth: number;
}

export type ImportantDate = {
  year: number;
  label: string;
  color: string;
  textColor: string;
  showLine: boolean;
  showUp: boolean;
}

export type HistoricalData = {
  // source
  year: number;
  masseSalarialeBrut: number;
  masseSalarialePubliqueBrut: number;
  pmss: number;
  pmssNet: number;
  inflation: number;
  ageRetraite: number;
  dureeCotisation: number;
  esperanceVie: number;
  txCnavPlafond: number;
  txCnavSalaire: number;

  // calcul
  dureeRetraiteCotise: number;
  ratioBrutNet: number;
  masseSalarialeBrutPrive: number;
  isHisto: boolean;
  totalTauxCnavPlafond: number;
  totalTauxCnavHorsPlafond: number;
  totalCnavPlafondEnPmss: number;
  totalCnavHorsPlafondEnPmss: number;
  croissanceMasseSalarialePriveBrut: number;
  croissanceMasseSalarialePriveBrutCumule: number;
  totalCnavPlafondEnPmssCroissMasSal: number;
  totalCnavHorsPlafondEnPmssCroissMasSal: number;
  age:number;
  croissanceMasseSalarialeMoyenneSurPeriode:number;
  inflationMoinsCroissancePmss:number;
  pensionMensEnPmss:number;
  pensionEnPmss:number;
  dureeVieEnRetraite:number;
  t1:SimulationData;
  t2:SimulationData;
  t3:SimulationData;
  t4:SimulationData;

  sumtotalCnavPlafondEnPmss:number;
  sumtotalCnavHorsPlafondEnPmss:number;
  sumtotalCnavPlafondEnPmssCroissMasSal:number;
  sumtotalCnavHorsPlafondEnPmssCroissMasSal:number;
  sumpensionMensEnPmss:number;
}

export type SimulationData = {
  isCotised:boolean;
  isRetired:boolean;
  pensionEnPmss:number;
  totalCnavPlafondEnPmss: number;
  totalCnavHorsPlafondEnPmss: number;
  totalCnavPlafondEnPmssCroissMasSal: number;
  totalCnavHorsPlafondEnPmssCroissMasSal: number;
}

export type SalaryDistributionEqtp = {
  min: number;
  max: number | null;
  effectif: number;
  moyen: number;
  moyenPrime: number;
  centile: number;
  masseBrutAnPmssMaxed: number,
  masseBrutAnOverPmss: number;
}

export type SalaryInfo = {
  ratioBrutNet: number;
  effectifSalarie: number;
  salaireMensMoyPrime: number;
  centileOverPmss: number;
  partMasseSalOverPmss: number;
  partMasseSalOverPmssIgnored: number;
}

export const salaireMensMoy2021: number = 2524;
// export const ratioBrutNet: number = .78;
export const salaireMensNetMin: number = 1000;
export const partMasseSalTop10_2021: number = 28.56;
