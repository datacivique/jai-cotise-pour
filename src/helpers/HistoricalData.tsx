import { txSalMensToPmss, type HistoricalData, type SalaryInfo, type SimulationParams } from "../components/types";
import { changeNaN } from "./Common";

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

  var maxI = data.length - 1;  

  // var pib1= 0;
  // var pib2= 0;
  // var sal1= 0;
  // var sal2= 0;
  var txCotisMoy = 0;
  var txPensMoy = 0;
  
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
    newData.masseSalarialePubliqueBrut = d0.masseSalarialePubliqueBrut * (1 + (param.ProjectionMasseSalarialeGrowth / 100));
    newData.esperanceVie = d0.esperanceVie + (param.ProjectionLifeExpectancyGrowth / 12);
    newData.salMoyNetMens = d0.salMoyNetMens * (1 + (param.ProjectionSalMoyGrowth / 100));
    newData.pmss = d0.pmss * (1 + (param.ProjectionSalMoyGrowth / 100) + txSalMensToPmss);
    newData.pmssNet = d0.pmssNet * (1 + (param.ProjectionSalMoyGrowth / 100) + txSalMensToPmss);
    data.push(newData);
  }

  var iSimulation = NaN;
  var esperanceVie = 0;
  step = "récupération des taux";
  // Retraite les données nécessaires aux calculs
  for (let i = 1; i < data.length; i++) {
    var d = data[i];
    var d0 = data[i - 1];

    d.croissanceMasseSalarialePriveBrut = (((d.masseSalarialeBrutPrive/d.salMoyNetMens)/(d0.masseSalarialeBrutPrive/d0.salMoyNetMens))-1) * 100;
    d.croissanceMasseSalarialePriveBrutCumule = 1;
    d.inflationMoinsCroissanceSalMoy = 1;
    d.pensionMensEnSalMoy = 0;
    d.salMensRefEnSalMoy = 0;

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
    d.moisCotises = 0;
    d.moisPensionnes = 0;
    d.sumpensionMensEnSalMoy = 0;
    d.sumtotalCnavHorsPlafondEnSalMoy = 0;
    d.sumtotalCnavHorsPlafondEnSalMoyCroissMasSal = 0;
    d.sumtotalCnavPlafondEnSalMoy = 0;
    d.sumtotalCnavPlafondEnSalMoyCroissMasSal = 0;
  };

  // console.log("esperanceVie", esperanceVie, param.retirementAge + data[iSimulation].dureeVieEnRetraite)
  esperanceVie = param.retirementAge + data[iSimulation].dureeVieEnRetraite;
  var ageRetraite = param.retirementAge;
  var ageTravail = param.retirementAge - (param.cotisationDuration/4);

  step = "calcul des cotisations et pensions";
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
      // if (pib1 == 0) { pib1 = d.masseSalarialeBrutPrive; sal1 = d.salMoyNetMens;}
      // if (sal1 == 0 || sal2 == 0) console.log("test")
      d.croissanceMasseSalarialePriveBrutCumule = d0.croissanceMasseSalarialePriveBrutCumule*(1+(d.croissanceMasseSalarialePriveBrut / 100));
      if (data[iSimulation].year == 1999 || data[iSimulation].year == 2000) {
      }
        // console.log(d.masseSalarialeBrutPrive,d.salMoyNetMens,d0.masseSalarialeBrutPrive, d0.salMoyNetMens,  ((d.masseSalarialeBrutPrive/d.salMoyNetMens)/(d0.masseSalarialeBrutPrive/d0.salMoyNetMens)-1) * 100)
      if (d.t1.isCotised) {
        d.salMensRefEnSalMoy += .25;
        d.moisCotises += 3;
      }
      if (d.t2.isCotised) {
        d.salMensRefEnSalMoy += .25;
        d.moisCotises += 3;
      }
      if (d.t3.isCotised) {
        d.salMensRefEnSalMoy += .25;
        d.moisCotises += 3;
      }
      if (d.t4.isCotised) {
        d.salMensRefEnSalMoy += .25;
        d.moisCotises += 3;
      }

      // TODO: Ajuster poru les salMensRefEnSalMoy > pmss

      d.totalCnavPlafondEnSalMoy = (changeNaN(d.txCnavPlafond) + changeNaN(d.txCnavSalaire)) * d.salMensRefEnSalMoy * d.moisCotises;
      const pmss = salaryInfo.partMasseSalMaxPmss * (changeNaN(d.txCnavPlafond) + changeNaN(d.txCnavSalaire));
      const over = salaryInfo.partMasseSalOverPmss * changeNaN(d.txCnavSalaire);
      const ratio = over / (pmss+over);
      d.totalCnavHorsPlafondEnSalMoy = d.totalCnavPlafondEnSalMoy * ratio;
      d.totalCnavPlafondEnSalMoyCroissMasSal = d.totalCnavPlafondEnSalMoy * d.croissanceMasseSalarialePriveBrutCumule;
      d.totalCnavHorsPlafondEnSalMoyCroissMasSal = d.totalCnavHorsPlafondEnSalMoy * d.croissanceMasseSalarialePriveBrutCumule;

      d.sumtotalCnavPlafondEnSalMoy=(d0.sumtotalCnavPlafondEnSalMoy|0)+d.totalCnavPlafondEnSalMoy;
      d.sumtotalCnavHorsPlafondEnSalMoy=(d0.sumtotalCnavHorsPlafondEnSalMoy|0)+d.totalCnavHorsPlafondEnSalMoy;
      d.sumtotalCnavPlafondEnSalMoyCroissMasSal=(d0.sumtotalCnavPlafondEnSalMoyCroissMasSal|0)+d.totalCnavPlafondEnSalMoyCroissMasSal;
      d.sumtotalCnavHorsPlafondEnSalMoyCroissMasSal=(d0.sumtotalCnavHorsPlafondEnSalMoyCroissMasSal|0)+d.totalCnavHorsPlafondEnSalMoyCroissMasSal; 

      data[iSimulation].sumtotalCnavPlafondEnSalMoy = d.sumtotalCnavPlafondEnSalMoy;
      data[iSimulation].sumtotalCnavHorsPlafondEnSalMoy = d.sumtotalCnavHorsPlafondEnSalMoy;
      data[iSimulation].sumtotalCnavPlafondEnSalMoyCroissMasSal = d.sumtotalCnavPlafondEnSalMoyCroissMasSal;
      data[iSimulation].sumtotalCnavHorsPlafondEnSalMoyCroissMasSal = d.sumtotalCnavHorsPlafondEnSalMoyCroissMasSal;

      txCotisMoy += (changeNaN(d.txCnavPlafond) + changeNaN(d.txCnavSalaire));
    }

    // Si retraite dans l'année
    if (d.t1.isRetired || d.t4.isRetired) {
      // if (pib2 == 0) { pib2 = d.masseSalarialeBrutPrive; sal2 = d.salMoyNetMens;}
      if (d0.pensionMensEnSalMoy == 0) {
        d.pensionMensEnSalMoy = 50; // la pension mensuelle à taux plein la premiere année est 50% de l'unité
      } else {
        d.inflationMoinsCroissanceSalMoy = (d.inflation/d0.inflation)-(d.salMoyNetMens/d0.salMoyNetMens);
        var ajustInflation = isNaN(param.indexationInflation) ? 0 : param.indexationInflation;
        ajustInflation = d.inflationMoinsCroissanceSalMoy + (ajustInflation/100);
        d.pensionMensEnSalMoy = d0.pensionMensEnSalMoy * (1 + ajustInflation);
      }
      // console.log(d.year, d.pensionMensEnSalMoy, d.inflationMoinsCroissanceSalMoy)
      
      d.sumtotalCnavPlafondEnSalMoy=d0.sumtotalCnavPlafondEnSalMoy;
      d.sumtotalCnavHorsPlafondEnSalMoy=d0.sumtotalCnavHorsPlafondEnSalMoy;
      d.sumtotalCnavPlafondEnSalMoyCroissMasSal=d0.sumtotalCnavPlafondEnSalMoyCroissMasSal;
      d.sumtotalCnavHorsPlafondEnSalMoyCroissMasSal=d0.sumtotalCnavHorsPlafondEnSalMoyCroissMasSal;

      if (d.t1.isRetired) d.moisPensionnes += 3;
      if (d.t2.isRetired) d.moisPensionnes += 3;
      if (d.t3.isRetired) d.moisPensionnes += 3;
      if (d.t4.isRetired) d.moisPensionnes += 3;
      d.pensionEnSalMoy = d.pensionMensEnSalMoy * d.moisPensionnes;

      d.sumpensionMensEnSalMoy=d0.sumpensionMensEnSalMoy+d.pensionEnSalMoy;
      data[iSimulation].sumpensionMensEnSalMoy = d.sumpensionMensEnSalMoy;

      txPensMoy += d.pensionMensEnSalMoy;
      // console.log(d.age, d0.sumpensionMensEnSalMoy, d.pensionEnSalMoy)
    }
  }

  
  data[iSimulation].dureeCotisation = param.cotisationDuration;
  // console.log(pib1, pib2, sal1, sal2)
  // // console.log(data[iSimulation])
  //   console.log(data[iSimulation], data[iSimulation].sumtotalCnavPlafondEnSalMoy+data[iSimulation].sumtotalCnavHorsPlafondEnSalMoy, 
  //     data[iSimulation].sumtotalCnavPlafondEnSalMoyCroissMasSal+data[iSimulation].sumtotalCnavHorsPlafondEnSalMoyCroissMasSal, 
  //     data[iSimulation].sumpensionMensEnSalMoy)
  } catch (err) {
    console.log("Error " + step +".", err);
  }
}
