import { salaireMensMoy2021,  type HistoricalData, type SalaryDistributionEqtp, type SimulationData, type SimulationParams, type SalaryInfo, salaireMensNetMin } from "./types";

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

export function createSimulationData(): SimulationData {
  return {
    isCotised: false,
    isRetired: false,
    pensionEnPmss: NaN,
    totalCnavPlafondEnPmss: NaN,
    totalCnavHorsPlafondEnPmss: NaN,
    totalCnavPlafondEnPmssCroissMasSal: NaN,
    totalCnavHorsPlafondEnPmssCroissMasSal: NaN,
  };
}

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

          isHisto: true,
          ratioBrutNet: 0,
          dureeRetraiteCotise: 0,
          masseSalarialeBrutPrive: NaN,
          totalTauxCnavPlafond: NaN,
          totalTauxCnavHorsPlafond: NaN,
          totalCnavPlafondEnPmss: NaN,
          totalCnavHorsPlafondEnPmss: NaN,
          croissanceMasseSalarialePriveBrut: NaN,
          croissanceMasseSalarialePriveBrutCumule: NaN,
          totalCnavPlafondEnPmssCroissMasSal: NaN,
          totalCnavHorsPlafondEnPmssCroissMasSal: NaN,
          croissanceMasseSalarialeMoyenneSurPeriode: NaN,
          inflationMoinsCroissancePmss: NaN,
          pensionMensEnPmss:NaN,
          pensionEnPmss:NaN,
          age:NaN,
          dureeVieEnRetraite:NaN,
    t1: createSimulationData(),
    t2: createSimulationData(),
    t3: createSimulationData(),
    t4: createSimulationData(),
    sumtotalCnavPlafondEnPmss:0,
    sumtotalCnavHorsPlafondEnPmss:0,
    sumtotalCnavPlafondEnPmssCroissMasSal:0,
    sumtotalCnavHorsPlafondEnPmssCroissMasSal:0,
    sumpensionMensEnPmss:0,
  };
}

// Calcul le profil de contribution/prestation
export const UpdateHistoricalData = (data: HistoricalData[], param: SimulationParams, salaryInfo: SalaryInfo) => {

  var step = "initialisation calcul";
  try {

  // Supprime les projections de l'ancienne simulation
  for (let i = data.length - 1; i >= 0; i--) {
    data[i].masseSalarialeBrutPrive = data[i].masseSalarialeBrut - data[i].masseSalarialePubliqueBrut;
    if (!data[i].isHisto) {
      data.splice(i, 1);
    }
  }

  var iSimulation = NaN;
  var maxI = data.length - 1;  
  
  step = "calcul des projections";
  // Recréer les nouvelles projections
  for (let i = data[maxI].year + 1; i < data[maxI].year + 100; i++)
  {
    var d0 = data[data.length - 1];

    const newData = structuredClone(data[maxI]);
    newData.year = i;
    newData.isHisto = false;
    newData.inflation = d0.inflation * (1 + (param.ProjectionInflation / 100));
    newData.masseSalarialeBrut = d0.masseSalarialeBrut * (1 + (param.ProjectionMasseSalarialeGrowth / 100));
    newData.masseSalarialeBrutPrive = d0.masseSalarialeBrutPrive * (1 + (param.ProjectionMasseSalarialeGrowth / 100));
    newData.esperanceVie = d0.esperanceVie + (param.ProjectionLifeExpectancyGrowth / 12);
    newData.pmss = d0.pmss * (1 + (param.ProjectionPmssGrowth / 100));
    newData.pmssNet = d0.pmssNet * (1 + (param.ProjectionPmssGrowth / 100));
    data.push(newData);
  }

  var esperanceVie = 0;
  step = "récupération des taux";
  // Retraite les données nécessaires aux calculs
  for (let i = 1; i < data.length; i++) {
    var d = data[i];
    var d0 = data[i - 1];
    d.totalTauxCnavPlafond = changeNaN(d.txCnavPlafond);
    d.totalTauxCnavHorsPlafond = changeNaN(d.txCnavSalaire);
    d.croissanceMasseSalarialePriveBrut = ((d.masseSalarialeBrutPrive/d.pmss)/(d0.masseSalarialeBrutPrive/d0.pmss)-1) * 100;
    d.croissanceMasseSalarialePriveBrutCumule = 1;
    d.inflationMoinsCroissancePmss = 1;
    d.pensionMensEnPmss = 0;

    // On présume que l'espérance de vie à une année donnée est en réalité la durée de vie moyenne d'une personne née il y a cette espérance de vie (ce qui colle avec la pyramide des ages)
    d.age = d.year - param.birthYear;
    if (d.age == 0) { iSimulation = i; d.dureeVieEnRetraite = NaN;}
    esperanceVie = param.lifeExpectancy > 0 ? param.lifeExpectancy : d.esperanceVie;
    if (d.age > esperanceVie && isNaN(data[iSimulation].dureeVieEnRetraite)) 
    {
      data[iSimulation].dureeVieEnRetraite = d.age - param.retirementAge; 
    }

    d.t1.isCotised = false;
    d.t2.isCotised = false;
    d.t3.isCotised = false;
    d.t4.isCotised = false;
    d.t1.isRetired = false;
    d.t2.isRetired = false;
    d.t3.isRetired = false;
    d.t4.isRetired = false;
    d.sumpensionMensEnPmss = 0;
    d.sumtotalCnavHorsPlafondEnPmss = 0;
    d.sumtotalCnavHorsPlafondEnPmssCroissMasSal = 0;
    d.sumtotalCnavPlafondEnPmss = 0;
    d.sumtotalCnavPlafondEnPmssCroissMasSal = 0;
  };

  esperanceVie = param.retirementAge + data[iSimulation].dureeVieEnRetraite;
  var ageRetraite = param.retirementAge;
  var ageTravail = param.retirementAge - (param.cotisationDuration/4);

  step = "calcul des cotisations et pensions";
  var croissanceMasseSalarialeMoyenneSurPeriode = 0;
  for (let i = 1; i < data.length; i++) {
    var d = data[i];
    var d0 = data[i - 1];

    if (d.age >= Math.floor(esperanceVie)) {
      if (esperanceVie > d.age) {
        if (esperanceVie - d.age <= 0.25) {
          d.t1.isRetired = true;
        }
        if (esperanceVie - d.age <= 0.5) {
          d.t2.isRetired = true;
        }
        if (esperanceVie - d.age <= 0.75) {
          d.t3.isRetired = true;
        }
        if (esperanceVie - d.age <= 1) {
          d.t4.isRetired = true;
        }
      }
    }
    else if (d.age >= Math.floor(ageRetraite)) {
      if (d.age + 1 - ageRetraite >= 1) {
        d.t1.isRetired = true;
        d.t2.isRetired = true;
        d.t3.isRetired = true;
        d.t4.isRetired = true;
      }  else if (d.age + 1 - ageRetraite >= 0.75) {
        d.t1.isCotised = true;
        d.t2.isRetired = true;
        d.t3.isRetired = true;
        d.t4.isRetired = true;
      }  else if (d.age + 1 - ageRetraite >= 0.5) {
        d.t1.isCotised = true;
        d.t2.isCotised = true;
        d.t3.isRetired = true;
        d.t4.isRetired = true;
      } else if (d.age + 1 - ageRetraite >= 0.25) {
        d.t1.isCotised = true;
        d.t2.isCotised = true;
        d.t3.isCotised = true;
        d.t4.isRetired = true;
      }
    }
    else if (d.age >= Math.floor(ageTravail)) {
      if (d.age + 1 - ageTravail >= 0.25) {
        d.t4.isCotised = true;
      }
      if (d.age + 1 - ageTravail >= 0.5) {
        d.t3.isCotised = true;
      }
      if (d.age + 1 - ageTravail >= 0.75) {
        d.t2.isCotised = true;
      }
      if (d.age + 1 - ageTravail >= 1) {
        d.t1.isCotised = true;
      }
    }
    
    // Si travail dans l'année
    if (d.t1.isCotised || d.t4.isCotised) {
      d.croissanceMasseSalarialePriveBrutCumule = d0.croissanceMasseSalarialePriveBrutCumule*(1+(d.croissanceMasseSalarialePriveBrut / 100));
      var moisCotises = 0;
      if (d.t1.isCotised) moisCotises += 3;
      if (d.t2.isCotised) moisCotises += 3;
      if (d.t3.isCotised) moisCotises += 3;
      if (d.t4.isCotised) moisCotises += 3;

      // Calcul de la contribution des salaires > pmss par rapport a la contribution plafonnée
      var masseSalPriv = d.masseSalarialeBrut - d.masseSalarialePubliqueBrut;
      var totalCotisationMasSalPlaf = salaryInfo.partMasseSalOverPmssIgnored * masseSalPriv * d.txCnavPlafond;
      var totalCotisationMasSalDeplaf = salaryInfo.partMasseSalOverPmss * masseSalPriv * d.txCnavSalaire;
      var ratioContributionHautsSalaires = totalCotisationMasSalDeplaf / (totalCotisationMasSalDeplaf+totalCotisationMasSalPlaf);

      d.totalCnavPlafondEnPmss = d.totalTauxCnavPlafond * moisCotises;
      d.totalCnavHorsPlafondEnPmss = d.totalCnavPlafondEnPmss * ratioContributionHautsSalaires;
      d.totalCnavPlafondEnPmssCroissMasSal = d.totalCnavPlafondEnPmss * d.croissanceMasseSalarialePriveBrutCumule;
      d.totalCnavHorsPlafondEnPmssCroissMasSal = d.totalCnavHorsPlafondEnPmss * d.croissanceMasseSalarialePriveBrutCumule;
      croissanceMasseSalarialeMoyenneSurPeriode += d.croissanceMasseSalarialePriveBrut;

      d.sumtotalCnavPlafondEnPmss=(d0.sumtotalCnavPlafondEnPmss|0)+d.totalCnavPlafondEnPmss;
      d.sumtotalCnavHorsPlafondEnPmss=(d0.sumtotalCnavHorsPlafondEnPmss|0)+d.totalCnavHorsPlafondEnPmss;
      d.sumtotalCnavPlafondEnPmssCroissMasSal=(d0.sumtotalCnavPlafondEnPmssCroissMasSal|0)+d.totalCnavPlafondEnPmssCroissMasSal;
      d.sumtotalCnavHorsPlafondEnPmssCroissMasSal=(d0.sumtotalCnavHorsPlafondEnPmssCroissMasSal|0)+d.totalCnavHorsPlafondEnPmssCroissMasSal;
      data[iSimulation].sumtotalCnavPlafondEnPmss = d.sumtotalCnavPlafondEnPmss;
      data[iSimulation].sumtotalCnavHorsPlafondEnPmss = d.sumtotalCnavHorsPlafondEnPmss;
      data[iSimulation].sumtotalCnavPlafondEnPmssCroissMasSal = d.sumtotalCnavPlafondEnPmssCroissMasSal;
      data[iSimulation].sumtotalCnavHorsPlafondEnPmssCroissMasSal = d.sumtotalCnavHorsPlafondEnPmssCroissMasSal;
    }

    // Si retraite dans l'année
    if (d.t1.isRetired || d.t4.isRetired) {
      if (d0.pensionMensEnPmss == 0) {
        d.pensionMensEnPmss = 50; // la pension mensuelle à taux plein la premiere année est 50% du pmss
      } else {
        d.inflationMoinsCroissancePmss = (d.inflation/d0.inflation)-(d.pmss/d0.pmss);
        var ajustInflation = isNaN(param.indexationInflation) ? 0 : param.indexationInflation;
        ajustInflation = d.inflationMoinsCroissancePmss + (ajustInflation/100);
        d.pensionMensEnPmss = d0.pensionMensEnPmss * (1 + ajustInflation);
      }
      
      d.sumtotalCnavPlafondEnPmss=d0.sumtotalCnavPlafondEnPmss;
      d.sumtotalCnavHorsPlafondEnPmss=d0.sumtotalCnavHorsPlafondEnPmss;
      d.sumtotalCnavPlafondEnPmssCroissMasSal=d0.sumtotalCnavPlafondEnPmssCroissMasSal;
      d.sumtotalCnavHorsPlafondEnPmssCroissMasSal=d0.sumtotalCnavHorsPlafondEnPmssCroissMasSal;

      var moisRetraite = 0;
      if (d.t1.isRetired) moisRetraite += 3;
      if (d.t2.isRetired) moisRetraite += 3;
      if (d.t3.isRetired) moisRetraite += 3;
      if (d.t4.isRetired) moisRetraite += 3;
      d.pensionEnPmss = d.pensionMensEnPmss * moisRetraite;

      d.sumpensionMensEnPmss=d0.sumpensionMensEnPmss+d.pensionEnPmss;
      data[iSimulation].sumpensionMensEnPmss = d.sumpensionMensEnPmss;

      var demo = d.sumtotalCnavHorsPlafondEnPmssCroissMasSal+d.sumtotalCnavPlafondEnPmssCroissMasSal-(d.sumtotalCnavPlafondEnPmss+d.sumtotalCnavHorsPlafondEnPmss);
      var sumCotise = demo+d.sumtotalCnavPlafondEnPmss+d.sumtotalCnavHorsPlafondEnPmss;
      if (d.sumpensionMensEnPmss > sumCotise && data[iSimulation].dureeRetraiteCotise == 0) {
        data[iSimulation].dureeRetraiteCotise = d.age - data[iSimulation].ageRetraite;
      }
    }
  }
  data[iSimulation].croissanceMasseSalarialeMoyenneSurPeriode = croissanceMasseSalarialeMoyenneSurPeriode / (param.cotisationDuration / 4);
  } catch (err) {
    console.log("Error " + step +".", err);
  }
}

// Obtient les infos de contribution des hauts revenus
export function GetSalaryInfo(distribution: SalaryDistributionEqtp[], data: HistoricalData[]): SalaryInfo {
  var result = {
    ratioBrutNet: 0,
    effectifSalarie: 0,
    salaireMensMoyPrime: 0,
    centileOverPmss: 0,
    partMasseSalOverPmss: 0,
    partMasseSalOverPmssIgnored:0,
  };
  
  var i2021=0;
  for (let i = 0; i < data.length; i++) {
    var d = data[i];
    if (d.year == 2021) {
      i2021 = i;
    }
    if (!isNaN(d.pmss)) {
      result.ratioBrutNet = d.pmssNet / d.pmss;
    }
  }
  const data2021 = data[i2021];
  var masseSalPrivBrut = data2021.masseSalarialeBrut-data2021.masseSalarialePubliqueBrut;
  var masseSalPrivNet = masseSalPrivBrut*result.ratioBrutNet;

  // Défini le salaire moyen de ref et total effectif
  var sumSalaireNetMens = 0;
  for (let i = 0; i < distribution.length; i++) {
    result.effectifSalarie += distribution[i].effectif;
    if (distribution[i].max != undefined) {
      if (distribution[i].min == 0) {
        distribution[i].moyen = (salaireMensNetMin+(distribution[i].max??0))/2;
      } else {
        distribution[i].moyen = (distribution[i].min+(distribution[i].max??0))/2;
      }
      sumSalaireNetMens += distribution[i].effectif*distribution[i].moyen;
    } else {
      distribution[i].moyen = ((salaireMensMoy2021*result.effectifSalarie)-(sumSalaireNetMens))/distribution[i].effectif;
    }
  }
  var masseSalPrivNetByAgent = masseSalPrivNet / result.effectifSalarie;
  var sumSalaireNetAnEnMdsMaxPmss = 0;
  var sumSalaireNetAnEnMdsOverPmss = 0;
  var sumEffectif = 0;
  sumSalaireNetMens = 0;

  // Calcul les centiles, salaire moyen prime incluses et ratios
  for (let i = 0; i < distribution.length; i++) {
    sumEffectif += distribution[i].effectif;
    distribution[i].centile = sumEffectif / result.effectifSalarie * 100;
    distribution[i].moyenPrime = distribution[i].moyen + (distribution[i].effectif * masseSalPrivNetByAgent);
    sumSalaireNetMens += distribution[i].effectif*distribution[i].moyenPrime;

    var salRef = Math.min(distribution[i].moyenPrime, data2021.pmssNet);
    distribution[i].masseBrutAnPmssMaxed = salRef*distribution[i].effectif*12/1000000000/result.ratioBrutNet;
    sumSalaireNetAnEnMdsMaxPmss += distribution[i].masseBrutAnPmssMaxed;

    if (distribution[i].moyenPrime > data2021.pmssNet) {
      if (result.centileOverPmss == 0) {
        result.centileOverPmss = distribution[i].centile;
      }
      distribution[i].masseBrutAnOverPmss = distribution[i].moyenPrime*distribution[i].effectif*12/1000000000/result.ratioBrutNet;
      sumSalaireNetAnEnMdsOverPmss += distribution[i].masseBrutAnOverPmss;
    }
  }
  
  result.salaireMensMoyPrime = sumSalaireNetMens / result.effectifSalarie;
  result.partMasseSalOverPmssIgnored = sumSalaireNetAnEnMdsMaxPmss/masseSalPrivBrut;
  result.partMasseSalOverPmss = sumSalaireNetAnEnMdsOverPmss/masseSalPrivBrut;
  
  return result;
}
