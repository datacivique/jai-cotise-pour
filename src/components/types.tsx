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
  ProjectionSalMoyGrowth: number;
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
  s11: number;
  s12: number;
  s13: number;
  s14: number;
  s15: number;
  salMoyNetAnTc: number;

  // Simu
  salMensRefEnSalMoy: number;

  // calcul
  moisCotises: number;
  moisPensionnes: number;
  salMoyNetMens: number;
  ratioBrutNet: number;
  masseSalarialeBrutPrive: number;
  isHisto: boolean;
  totalCnavPlafondEnSalMoy: number;
  totalCnavHorsPlafondEnSalMoy: number;
  croissanceMasseSalarialePriveBrut: number;
  croissanceMasseSalarialePriveBrutCumule: number;
  totalCnavPlafondEnSalMoyCroissMasSal: number;
  totalCnavHorsPlafondEnSalMoyCroissMasSal: number;
  age:number;
  inflationMoinsCroissanceSalMoy:number;
  pensionMensEnSalMoy:number;
  pensionEnSalMoy:number;
  dureeVieEnRetraite:number;
  t1:SimulationData;
  t2:SimulationData;
  t3:SimulationData;
  t4:SimulationData;

  sumtotalCnavPlafondEnSalMoy:number;
  sumtotalCnavHorsPlafondEnSalMoy:number;
  sumtotalCnavPlafondEnSalMoyCroissMasSal:number;
  sumtotalCnavHorsPlafondEnSalMoyCroissMasSal:number;
  sumpensionMensEnSalMoy:number;
}

export type SimulationData = {
  isCotised:boolean;
  isRetired:boolean;
  pensionEnSalMoy:number;
  totalCnavPlafondEnSalMoy: number;
  totalCnavHorsPlafondEnSalMoy: number;
  totalCnavPlafondEnSalMoyCroissMasSal: number;
  totalCnavHorsPlafondEnSalMoyCroissMasSal: number;
}

export type SalaryDistributionEqtp = {
  min: number;
  max: number | null;
  effectif: number;
  moyen: number;
  centile: number;
  masseBrutAnMaxPmss: number,
  masseBrutAnOverPmss: number,
}

export type SalaryInfo = {
  ratioBrutNet: number;
  effectifSalarieTotalPrive: number;
  salaireMoyTotalPrive: number;
  effectifSalarie: number;
  centileOverPmss: number;
  masseSalMaxPmss: number;
  masseSalOverPmss: number;
  partMasseSalMaxPmss: number;
  partMasseSalOverPmss: number;
}

export type SalaireEntry = {
  // annee: number;
  // salaire?: number;
  // cotisation?: number;
  // pension?: number;
  // finance?: number;
  // ponctionne?: number;
  // cotise?: number;
  // commentaire?: string;
  annee: number;
  salaire: number;
  cotisation: number;
  commentaire: string;
  pension: number;
  cotise: number;
  finance: number;
  ponctionne: number;
}
// interface ProfilType {
//   salaires: SalaireEntry[];
// }
export type ProfilType = {
  name: string;
  salaires: SalaireEntry[];
}

export const salaireMensMoyBrut2021: number = 3321;
export const salaireMensMoyNet2021: number = 2524;
export const salaireMensNetMin: number = 1000;
export const partMasseSalTop10_2021: number = 28.56;
export const txSalMensToPmss: number = 0.0011;
export const txTcToEqtp: number = 0.00982942821823;

export const projectionBaseSalMoy: number = 1.5;
export const projectionBaseInflation: number = 1.6;
export const projectionBasePib: number = 3;