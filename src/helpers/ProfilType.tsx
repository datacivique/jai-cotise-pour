import { pensionBrutToNet, salaireMensMoyBrut2021, salaireMensMoyNet2021, type HistoricalData, type ProfilType, type SalaireEntry } from "../components/types";

// Retourne le salaire moyen des 25 meilleurs années
export const GetSalRef = (salaires: SalaireEntry[]): number => {
  if (!salaires || salaires.length === 0) return 0;

  const top25 = [...salaires]
    .sort((a, b) => b.salaire - a.salaire)   // tri descendant
    .slice(0, 25);                           // on prend les 25 meilleurs

  if (top25.length === 0) return 0;

  const total = top25.reduce((sum, entry) => sum + entry.salaire, 0);
  return total / top25.length;
};

export const GetProfils = (profilsBase: ProfilType[], historicalData: HistoricalData[]): ProfilType[] => {
  // profilsBase contient 4 profils, chacun avec salaires = [{ salaire, commentaire }]
  // mais utilises ton fichier avec : pctAvancement, salaire, commentaire

  var iAge0 = -1;
  var iTravail0 = -1;
  for (let i = 0; i < historicalData.length; i++) {
    if (historicalData[i].age == 0) {
        iAge0 = i;
    } else if (historicalData[i].moisCotises > 0) {
        iTravail0 = i;
        break;
    }
  }
  const age0 = historicalData[iAge0];
  var duree = Math.round(age0.dureeCotisation / 4);
  var croissance = 1-((age0.sumtotalCnavPlafondEnSalMoy+age0.sumtotalCnavHorsPlafondEnSalMoy)/(age0.sumtotalCnavPlafondEnSalMoyCroissMasSal+age0.sumtotalCnavHorsPlafondEnSalMoyCroissMasSal))

    var salRef: number[] = [0, 0, 0, 0];
    var prevComShown: boolean[] = [false, false, false, false];

  const result: ProfilType[] = profilsBase.map(p => ({
    name: p.name,
    salaires: [],
    totalCotisation: 0,
    totalFinance: 0,
    totalPonction: 0,
  }));

  // nombre de points dans la base (ex: 40 lignes)
  const nBase = profilsBase[0].salaires.length;

    // Trouver en base les deux points autour
    // baseLst = tableau des pctAvancement, sur PROFIL 0 (ils sont identiques pour tous)
    const basePctList = profilsBase[0].salaires.map((_, idx) =>
      (idx + 1) / nBase
    );

    var sumCotisation: number[] = [0, 0, 0, 0];
    var sumCroissance: number[] = [1, 1, 1, 1];
    var sumPension: number[] = [0, 0, 0, 0];

  for (let year = 1; year <= duree+age0.dureeVieEnRetraite; year++) {

    // Add retraite
    if (year > duree) {

        profilsBase.forEach((profil, pIndex) => {
            
        var ret = historicalData[iTravail0+year];

        var pension = (salRef[pIndex]/2)*ret.pensionMensEnSalMoy/50

        sumPension[pIndex] += pension;
        
        result[pIndex].salaires.push({
            annee: year,
            cotisation: 0,
            salaire: 0,
            commentaire:(profil== undefined ? "1" : ""),
            pension: pension,
            cotise: 0,
            finance: 0,
            ponctionne: 0,
            net: pension*pensionBrutToNet,
        });
        });
        
    } else {

        const pct = year / duree; // ex : 25/50 = 0.5

        // Trouver index bas et haut
        let low = 0;
        let high = nBase - 1;

        for (let i = 0; i < nBase - 1; i++) {
        if (pct >= basePctList[i] && pct <= basePctList[i + 1]) {
            low = i;
            high = i + 1;
            break;
        }
        }

        // pct "local" pour interpolation
        const pctLow = basePctList[low];
        const pctHigh = basePctList[high];
        const localT = (pct - pctLow) / (pctHigh - pctLow); // entre 0 et 1
        // Pour chaque PROFIL : interpolation salaire + commentaires
        profilsBase.forEach((profil, pIndex) => {
        const sLow = profil.salaires[low];
        const sHigh = profil.salaires[high];

        // interpolation linéaire du salaire
        const interpolatedSalaire =
            sLow.salaire + (sHigh.salaire - sLow.salaire) * localT;
        const mid = (sHigh.salaire + sLow.salaire) / 2;

        // commentaire : si on tombe pile sur un événement
        let commentaire = "";
        //   if (profil.name == "ouvrier") console.log(0, year, prevComShown[pIndex], sLow.commentaire)
        if (prevComShown[pIndex] == true) {
            prevComShown[pIndex] = false;
        }
        else {
            if (sLow.commentaire != "" && (interpolatedSalaire - sLow.salaire < mid || year == 1)) { 
                commentaire = sLow.commentaire;
                prevComShown[pIndex] = true; 
            }
            else if (sHigh.commentaire != "" && (sHigh.annee != 1 && sHigh.salaire - interpolatedSalaire < mid)) { 
                commentaire = sHigh.commentaire;
                prevComShown[pIndex] = true; 
            }
        }
        if (year == duree) commentaire = sHigh.commentaire;

        var taf = historicalData[iTravail0+year];
        var pension = 0;
        if (year == duree) {
            var salReference = GetSalRef(result[pIndex].salaires);
            var ratioPmssSalMoy = taf.pmssNet/taf.salMoyNetMens;
            salRef[pIndex] = Math.min(salReference, ratioPmssSalMoy);

            // Premiere pension
            pension = (taf.pensionEnSalMoy/600) * salRef[pIndex] * .5;

            if (taf.pensionEnSalMoy != 600) {
                commentaire = commentaire + " (année incomplète)";
            }
            //  if (profil.name == "Cadre") console.log(year, salReference,ratioPmssSalMoy);
        }

        var cotisationT1 = Math.min(interpolatedSalaire*taf.salMensRefEnSalMoy, taf.salMensRefEnSalMoy) * taf.txCnavPlafond / 100;
        var cotisationT2 = (interpolatedSalaire*taf.salMensRefEnSalMoy * (taf.txCnavSalaire|0) / 100);
        var cotisation = cotisationT1+cotisationT2;
        if (cotisation == 0) {
            cotisation = result[pIndex].salaires[result[pIndex].salaires.length-1].cotisation;
        }

        if (year > 1) {
            var taf0 = historicalData[iTravail0+year-1];
            var sal0 = result[pIndex].salaires[result[pIndex].salaires.length-1]
            var croissMass = (((taf.masseSalarialeBrutPrive/interpolatedSalaire)/(taf0.masseSalarialeBrutPrive/sal0.salaire))-1) * 100;
        //   if (profil.name == "Cadre") console.log(year, croissMass);
            var cotisCroissMass = (croissMass/100) * (taf.txCnavPlafond / 100);
            sumCroissance[pIndex] = sumCroissance[pIndex] + cotisCroissMass;
        }

        var ratioBrutToNet = salaireMensMoyNet2021/salaireMensMoyBrut2021;
        var net = (interpolatedSalaire*ratioBrutToNet*taf.salMensRefEnSalMoy)+(pension*pensionBrutToNet);
        //  if (profil.name == "Ouvrier") console.log(year, taf, interpolatedSalaire);

        result[pIndex].salaires.push({
            annee: year,
            cotisation: cotisation,
            salaire: interpolatedSalaire,
            commentaire,
            pension: pension,
            cotise: 0,
            finance: 0,
            ponctionne: 0,
            net: net,
        });
        
        sumCotisation[pIndex] += cotisation;
        sumPension[pIndex] += pension;
        });
    }
  }

  for (let i = 0; i < 4; i++) {

    var ratioCotisation = sumCotisation[i]/sumPension[i];
    var ratioFinance = sumCroissance[i]/sumPension[i];
    var ratioPonction = 1-(ratioCotisation+ratioFinance);

    for (let ret = 0; ret < result[i].salaires.length; ret++) {
        if (result[i].salaires[ret].pension == 0) continue;
        
        result[i].salaires[ret].cotise = result[i].salaires[ret].pension*ratioCotisation;
        result[i].salaires[ret].finance = result[i].salaires[ret].pension*ratioFinance;
        result[i].salaires[ret].ponctionne = result[i].salaires[ret].pension*ratioPonction;
    }

    result[i].totalCotisation = sumCotisation[i];
    result[i].totalFinance = sumCroissance[i];
    result[i].totalPonction = sumPension[i]-(sumCotisation[i]+sumCroissance[i]);
  }
//   sumCroissance[0] = sumCotisation[0]*croissance;

//   console.log("profileType: salRef-sumCotisation-sumCroissance-sumPension-croissance-age0", salRef, sumCotisation, sumCroissance, sumPension, croissance, age0, result)
  return result;
};
