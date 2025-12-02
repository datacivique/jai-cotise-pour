import type { HistoricalData, ProfilType } from "../components/types";
import { createHistoricalData } from "./Common";

export const GetProfils = (profilsBase: ProfilType[], historicalData: HistoricalData[]): ProfilType[] => {
  // profilsBase contient 4 profils, chacun avec salaires = [{ salaire, commentaire }]
  // mais utilises ton fichier avec : pctAvancement, salaire, commentaire

  const age0 = historicalData.find(d => d.age === 0)||createHistoricalData();
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

        salRef[pIndex] += interpolatedSalaire;
        if (year == duree) {
            salRef[pIndex] = .55 * salRef[pIndex] / duree;
        }

        result[pIndex].salaires.push({
            annee: year,
            cotisation: 0,
            salaire: interpolatedSalaire,
            commentaire,
            pension: (year == duree ? salRef[pIndex] : 0),
            cotise: (year == duree ? 1 : 0),
            finance: 0,
            ponctionne: 0,
        });
        });
    }
  }
  return result;
};
