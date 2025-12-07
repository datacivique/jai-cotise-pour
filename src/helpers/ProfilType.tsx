import { pensionBrutToNet, salaireMensMoyBrut2021, salaireMensMoyNet2021, type HistoricalData, type ProfilType, type SalaireEntry } from "../components/types";
import { createHistoricalData } from "./Common";

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

  var dureeCotise = Math.round(age0.dureeVieEnRetraite * age0.sumtotalCnavPlafondEnSalMoy / age0.sumpensionMensEnSalMoy);
  var dureeFinance = Math.round(age0.dureeVieEnRetraite * (age0.sumtotalCnavPlafondEnSalMoyCroissMasSal+age0.sumtotalCnavHorsPlafondEnSalMoyCroissMasSal) / age0.sumpensionMensEnSalMoy);
  
    var salRef: number[] = [0, 0, 0, 0];
    var prevComShown: boolean[] = [false, false, false, false];

  const result: ProfilType[] = profilsBase.map(p => ({
    name: p.name,
    salaires: []
  }));

  // nombre de points dans la base (ex: 40 lignes)
  const nBase = profilsBase[0].salaires.length;

    // Trouver en base les deux points autour
    // baseLst = tableau des pctAvancement, sur PROFIL 0 (ils sont identiques pour tous)
    const basePctList = profilsBase[0].salaires.map((_, idx) =>
      (idx + 1) / nBase
    );

  for (let year = 1; year <= duree+age0.dureeVieEnRetraite; year++) {

    // Add retraite
    if (year > duree) {

        profilsBase.forEach((profil, pIndex) => {
            
        var sal = salRef[pIndex] * (1 - ((year-duree)*.005));

        var ret = historicalData[iTravail0+year];
        sal = salRef[pIndex] * (1 + ((ret.pensionMensEnSalMoy/100)-.5));
        // if (profil.name == "Ouvrier") console.log(year, salRef[pIndex], ret.pensionMensEnSalMoy/100, sal);

            if (year - duree > dureeFinance) {
                result[pIndex].salaires.push({
                    annee: year,
                    cotisation: 0,
                    salaire: 0,
                    commentaire:(profil== undefined ? "1" : ""),
                    pension: sal,
                    cotise: 0,
                    finance: 0,
                    ponctionne: 1,
                    net: sal*pensionBrutToNet,
                });
            } else if (year - duree == dureeFinance) {
                result[pIndex].salaires.push({
                    annee: year,
                    cotisation: 0,
                    salaire: 0,
                    commentaire:"",
                    pension: sal,
                    cotise: 0,
                    finance: 1,
                    ponctionne: 1,
                    net: sal*pensionBrutToNet,
                });
            } else if (year - duree > dureeCotise) {
                result[pIndex].salaires.push({
                    annee: year,
                    cotisation: 0,
                    salaire: 0,
                    commentaire:"",
                    pension: sal,
                    cotise: 0,
                    finance: 1,
                    ponctionne: 0,
                    net: sal*pensionBrutToNet,
                });
            } else if (year - duree == dureeCotise) {
                result[pIndex].salaires.push({
                    annee: year,
                    cotisation: 0,
                    salaire: 0,
                    commentaire:"",
                    pension: sal,
                    cotise: 1,
                    finance: 1,
                    ponctionne: 0,
                    net: sal*pensionBrutToNet,
                });
            } else  {
                result[pIndex].salaires.push({
                    annee: year,
                    cotisation: 0,
                    salaire: 0,
                    commentaire:"",
                    pension: sal,
                    cotise: 1,
                    finance: 0,
                    ponctionne: 0,
                    net: sal*pensionBrutToNet,
                });
            }
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

        // salRef[pIndex] += interpolatedSalaire;
        // if (year == duree) {
        //     salRef[pIndex] = .55 * salRef[pIndex] / duree;
        // }

        var taf = historicalData[iTravail0+year];
        var pension = 0;
        if (year == duree) {
            salRef[pIndex] = GetSalRef(result[pIndex].salaires) / 2;
            pension = (taf.pensionEnSalMoy/600) * salRef[pIndex] * .5 / (taf.pensionMensEnSalMoy/100);

            if (taf.pensionEnSalMoy != 600) {
                commentaire = commentaire + " (année incomplète)";
            }

            // if (profil.name == "Ouvrier") console.log(year, interpolatedSalaire, salRef[pIndex], pension, (year == duree ? 1 : 0));
        }

        var cotisationT1 = Math.min(interpolatedSalaire*taf.salMensRefEnSalMoy, taf.salMensRefEnSalMoy) * taf.txCnavPlafond / 100;
        var cotisationT2 = (interpolatedSalaire*taf.salMensRefEnSalMoy * taf.txCnavSalaire / 100)|0;
        var cotisation = cotisationT1+cotisationT2;
        if (cotisation == 0) {
            cotisation = result[pIndex].salaires[result[pIndex].salaires.length-1].cotisation;
        }

        var ratioBrutToNet = salaireMensMoyNet2021/salaireMensMoyBrut2021;
        var net = (interpolatedSalaire*ratioBrutToNet*taf.salMensRefEnSalMoy)+(pension*pensionBrutToNet);
        // if (profil.name == "Cadre") console.log(year, interpolatedSalaire, net, taf);

        result[pIndex].salaires.push({
            annee: year,
            cotisation: cotisation,
            salaire: interpolatedSalaire,
            commentaire,
            pension: pension,
            // pension: (year == duree ? salRef[pIndex] : 0),
            cotise: (year == duree ? 1 : 0),
            finance: 0,
            ponctionne: 0,
            net: net,
        });
        });
    }
  }
  return result;
};
