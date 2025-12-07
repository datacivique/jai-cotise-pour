import React, { useEffect } from 'react';
import { txTcToEqtp, type HistoricalData, type ProfilType, type SalaryDistributionEqtp } from './types';
import { createHistoricalData, ParseCSV } from '../helpers/Common';
// import { createHistoricalData, ParseCSV } from './Helpers';

interface DataLoaderProps {
  onDataLoaded: (data: {
    historicalData: HistoricalData[];
    salaryDistributionEqtp: SalaryDistributionEqtp[];
    profilsBase: ProfilType[];
    dataByYear: Map<number, HistoricalData>;
  }) => void;
}

const DataLoader: React.FC<DataLoaderProps> = ({ onDataLoaded }) => {
  useEffect(() => {
    const loadData = async () => {
      try {
        const base = import.meta.env.BASE_URL;
        const [
          masseSalarialeContent,
          depensesPubliquesContent,
          cnavContent,
          departRetraiteContent,
          distribSalairesContent,
          inflationContent,
          plafondContent,
          esperanceVieContent,
          emploiEqtpContent,
          salaireMoyenContent,
          profilsContent,
        ] = await Promise.all([
          fetch(base + '1.107-PartageDeLaValeurAjoutéeBruteAPrixCourants.txt').then(r => r.text()),
          fetch(base + '3.201-DépensesEtRecettesDesAdministrationsPubliques(S13).txt').then(r => r.text()),
          fetch(base + 'TotalCotisationVieillesseVeuvage.txt').then(r => r.text()),
          fetch(base + 'DepartRetraite.txt').then(r => r.text()),
          fetch(base + 'DistribEffectifSalairesMensNetsEQTP2021.txt').then(r => r.text()),
          fetch(base + 'Inflation.txt').then(r => r.text()),
          fetch(base + 'Plafond.txt').then(r => r.text()),
          fetch(base + 'EsperanceVie.txt').then(r => r.text()),
          fetch(base + '1.109-EmploiIntérieurTotalParSecteurInstitutionnelEnNombreEQTP.txt').then(r => r.text()),
          fetch(base + 'TC01-EvolutionDuSalaireNetAnnuelMoyen.txt').then(r => r.text()),
          fetch(base + 'profils.txt').then(r => r.text()),
        ]);

        // Parser les données
        const masseSalariale = ParseCSV(masseSalarialeContent);
        const depensesPubliques = ParseCSV(depensesPubliquesContent);
        const cnav = ParseCSV(cnavContent);
        const departRetraite = ParseCSV(departRetraiteContent);
        const inflation = ParseCSV(inflationContent);
        const plafond = ParseCSV(plafondContent);
        const esperanceVie = ParseCSV(esperanceVieContent);
        const distribEqtp = ParseCSV(distribSalairesContent);
        const emploiEqtp = ParseCSV(emploiEqtpContent);
        const salaireMoyen = ParseCSV(salaireMoyenContent);
        const profilsRows = ParseCSV(profilsContent);

        const dataByYear = new Map<number, HistoricalData>();

        masseSalariale.forEach((row: any) => {
          const year = parseInt(row['Année']);
          if (!isNaN(year)) {
            var data = createHistoricalData();
            data.year = year;
            data.isHisto = true;
            data.masseSalarialeBrut = parseFloat(row['D11 Salaires et traitements bruts']?.replace(',', '.'));
            dataByYear.set(year, data);
          }
        });

        depensesPubliques.forEach((row: any) => {
          const year = parseInt(row['Année']);
          if (!isNaN(year) && dataByYear.has(year)) {
            const data = dataByYear.get(year)!;
            data.isHisto = true;
            data.masseSalarialePubliqueBrut = parseFloat(row['Salaires et traitements bruts']?.replace(',', '.'));
          }
        });

        cnav.forEach((row: any) => {
          const year = parseInt(row['Année']);
          if (!isNaN(year) && dataByYear.has(year)) {
            const data = dataByYear.get(year)!;
            data.isHisto = true;
            data.txCnavPlafond = parseFloat(row['Plafonne']?.replace(',', '.'));
            data.txCnavSalaire = parseFloat(row['TotaliteSalaire']?.replace(',', '.'));
          }
        });

        departRetraite.forEach((row: any) => {
          const year = parseInt(row['Année']);
          if (!isNaN(year) && dataByYear.has(year)) {
            const data = dataByYear.get(year)!;
            data.isHisto = true;
            data.ageRetraite = parseFloat(row['Age de départ']?.replace(',', '.'));
            data.dureeCotisation = parseFloat(row['Durée de cotisation (trimestres)']?.replace(',', '.'));
          }
        });

        inflation.forEach((row: any) => {
          const year = parseInt(row['Année']);
          if (!isNaN(year) && dataByYear.has(year)) {
            const data = dataByYear.get(year)!;
            data.isHisto = true;
            data.inflation = parseFloat(row['Indice base 100 en 1951']?.replace(',', '.'));
          }
        });

        plafond.forEach((row: any) => {
          const year = parseInt(row['Année']);
          if (!isNaN(year) && dataByYear.has(year)) {
            const data = dataByYear.get(year)!;
            data.isHisto = true;
            data.pmss = parseFloat(row['Plafond mensuel brut (en euros)']?.replace(',', '.'));
            data.pmssNet = parseFloat(row['Plafond mensuel net de prélèvements (en euros)']?.replace(',', '.'));
          }
        });

        esperanceVie.forEach((row: any) => {
          const year = parseInt(row['Année']);
          if (!isNaN(year) && dataByYear.has(year)) {
            const data = dataByYear.get(year)!;
            data.isHisto = true;
            data.esperanceVie = parseFloat(row['Esperance de vie moyenne']?.replace(',', '.'));
          }
        });

        emploiEqtp.forEach((row: any) => {
          const year = parseInt(row['Année']);
          if (!isNaN(year) && dataByYear.has(year)) {
            const data = dataByYear.get(year)!;
            data.isHisto = true;
            data.s11 = parseFloat(row['S11-Sociétésnonfinancières']?.replace(',', '.'));
            data.s12 = parseFloat(row['S12-Sociétésfinancières']?.replace(',', '.'));
            data.s13 = parseFloat(row['S13-Administrationspubliques']?.replace(',', '.'));
            data.s14 = parseFloat(row['S14-Ménages']?.replace(',', '.'));
            data.s15 = parseFloat(row['S15-Institutionssansbutlucratifauservicesdesménages']?.replace(',', '.'));
          }
        });

        salaireMoyen.forEach((row: any) => {
          const year = parseInt(row['Année']);
          if (!isNaN(year) && dataByYear.has(year)) {
            const data = dataByYear.get(year)!;
            data.isHisto = true;
            data.salMoyNetAnTc = parseFloat(row['Salaire en euros']?.replace(',', '.'));
            data.salMoyNetMens = data.salMoyNetAnTc*(1+txTcToEqtp)/12;
          }
        });
        
        // Construction des 4 profils
        const profilsBase: ProfilType[] = [
          { name: 'Ouvrier', salaires: [] },
          { name: 'Employe de bureau', salaires: [] },
          { name: 'Cadre', salaires: [] },
          { name: 'Profession Intermediaire', salaires: [] },
        ];
        profilsRows.forEach((row: any) => {
        profilsBase[0].salaires.push({
          annee: parseFloat(row['pctAvancement']),
          cotisation: 0,
          salaire: parseFloat(row['ouvrier']),
          commentaire: row['eventOuvrier'] ?? '',
          pension: 0,
          cotise: 0,
          finance: 0,
          ponctionne: 0,
        });
        profilsBase[1].salaires.push({
          annee: parseFloat(row['pctAvancement']),
          cotisation: 0,
          salaire: parseFloat(row['employe']),
          commentaire: row['eventEmploye'] ?? '',
          pension: 0,
          cotise: 0,
          finance: 0,
          ponctionne: 0,
        });
        profilsBase[2].salaires.push({
          annee: parseFloat(row['pctAvancement']),
          cotisation: 0,
          salaire: parseFloat(row['cadre']),
          commentaire: row['eventCadre'] ?? '',
          pension: 0,
          cotise: 0,
          finance: 0,
          ponctionne: 0,
        });
        profilsBase[3].salaires.push({
          annee: parseFloat(row['pctAvancement']),
          cotisation: 0,
          salaire: parseFloat(row['profIntermediaire']),
          commentaire: row['eventProfIntermediaire'] ?? '',
          pension: 0,
          cotise: 0,
          finance: 0,
          ponctionne: 0,
        });
      });

        // Créer le tableau final trié
        const historicalData = Array.from(dataByYear.values()).sort((a, b) => a.year - b.year);

        const salaryDistributionEqtp = distribEqtp.map((row: any) => ({
          min: parseInt(row['De']),
          max: row['A'] ? parseInt(row['A']) : null,
          effectif: parseInt(row['Effectif']),
          moyen: 0,
          centile: 0,
          masseBrutAnMaxPmss: 0,
          masseBrutAnOverPmss: 0,
        }));

        // Appeler le callback avec les données
        onDataLoaded({ historicalData, salaryDistributionEqtp, profilsBase, dataByYear });

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    loadData();
  }, []);

  return null; // pas d'affichage
};

export default DataLoader;
