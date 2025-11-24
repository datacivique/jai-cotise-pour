import { salaireMensMoyBrut2021, salaireMensMoyNet2021, salaireMensNetMin, type HistoricalData, type SalaryDistributionEqtp, type SalaryInfo } from "../components/types";

// Obtient les infos de contribution des hauts revenus
export function GetSalaryInfo(distribution: SalaryDistributionEqtp[], data: HistoricalData[]): SalaryInfo {
  var result = {
    ratioBrutNet: 0,
    effectifSalarieTotalPrive: 0,
    salaireMoyTotalPrive: 0,
    effectifSalarie: 0,
    centileOverPmss: 0,
    masseSalMaxPmss: 0,
    masseSalOverPmss:0,
    partMasseSalMaxPmss: 0,
    partMasseSalOverPmss:0,
  };
  
  var i2021=0;
  for (let i = 0; i < data.length; i++) {
    var d = data[i];
    if (d.year == 2021) {
      i2021 = i;
    }
  }
  const data2021 = data[i2021];
  result.ratioBrutNet = salaireMensMoyNet2021 / salaireMensMoyBrut2021;

  // Défini le salaire moyen de ref et total effectif
  var masseSalPrivBrut = 0;
  var sumSalaireBrutAnEnMdsMaxPmss = 0;
  var sumSalaireBrutAnEnMdsOverPmss = 0;
  var sumSalaireNetMens = 0;
  for (let i = 0; i < distribution.length; i++) {
    result.effectifSalarie += distribution[i].effectif;
    if (distribution[i].max != undefined) {
      if (distribution[i].min == 0) {
        distribution[i].moyen = (salaireMensNetMin+(distribution[i].max??0))/2;
      } else {
        distribution[i].moyen = (distribution[i].min+(distribution[i].max??0))/2;
      }
    } else {
      distribution[i].moyen = ((salaireMensMoyNet2021*result.effectifSalarie)-(sumSalaireNetMens))/distribution[i].effectif;
    }
    masseSalPrivBrut += distribution[i].moyen*distribution[i].effectif*12/1000000000/result.ratioBrutNet;
    sumSalaireNetMens += distribution[i].effectif*distribution[i].moyen;

    var salRef = Math.min(distribution[i].moyen, data2021.pmssNet);
    distribution[i].masseBrutAnMaxPmss = salRef*distribution[i].effectif*12/1000000000/result.ratioBrutNet;
    sumSalaireBrutAnEnMdsMaxPmss += distribution[i].masseBrutAnMaxPmss;

    if (distribution[i].moyen > data2021.pmssNet) {
      distribution[i].masseBrutAnOverPmss = (distribution[i].moyen-data2021.pmssNet)*distribution[i].effectif*12/1000000000/result.ratioBrutNet;
      sumSalaireBrutAnEnMdsOverPmss += distribution[i].masseBrutAnOverPmss;
    }
  }

  // Calcul les centiles, salaire moyen prime incluses et ratios
  var sumEffectif = 0;
  for (let i = 0; i < distribution.length; i++) {
    sumEffectif += distribution[i].effectif;
    distribution[i].centile = sumEffectif / result.effectifSalarie * 100;

    if (distribution[i].moyen > data2021.pmssNet) {
      if (result.centileOverPmss == 0) {
        result.centileOverPmss = distribution[i].centile;
      }
    }
  }
  
  var masseSalPrivTotal = data2021.masseSalarialeBrut-data2021.masseSalarialePubliqueBrut;
  var effectifMenages = (data2021.s14 + data2021.s15)*1000;
  result.effectifSalarieTotalPrive = sumEffectif + effectifMenages;
  result.salaireMoyTotalPrive = (masseSalPrivTotal*1000000000*result.ratioBrutNet/12)/result.effectifSalarieTotalPrive;
  result.masseSalOverPmss = sumSalaireBrutAnEnMdsOverPmss;
  result.masseSalMaxPmss = sumSalaireBrutAnEnMdsMaxPmss;
  result.partMasseSalOverPmss = sumSalaireBrutAnEnMdsOverPmss/masseSalPrivTotal;
  result.partMasseSalMaxPmss = 1-result.partMasseSalOverPmss;
  
  return result;
}