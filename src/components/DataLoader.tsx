import React, { useEffect } from 'react';
import { type HistoricalData, type SalaryDistributionEqtp } from './types';
import { createHistoricalData, ParseCSV } from './Helpers';

interface DataLoaderProps {
  onDataLoaded: (data: {
    historicalData: HistoricalData[];
    salaryDistributionEqtp: SalaryDistributionEqtp[];
    dataByYear: Map<number, HistoricalData>;
  }) => void;
}

const DataLoader: React.FC<DataLoaderProps> = ({ onDataLoaded }) => {
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          masseSalarialeContent,
          depensesPubliquesContent,
          cnavContent,
          departRetraiteContent,
          distribSalairesContent,
          inflationContent,
          plafondContent,
          esperanceVieContent,
        ] = await Promise.all([
          fetch('/1.107-PartageDeLaValeurAjoutéeBruteAPrixCourants.txt').then(r => r.text()),
          fetch('/3.201-DépensesEtRecettesDesAdministrationsPubliques(S13).txt').then(r => r.text()),
          fetch('/TotalCotisationVieillesseVeuvage.txt').then(r => r.text()),
          fetch('/DepartRetraite.txt').then(r => r.text()),
          fetch('/DistribEffectifSalairesMensNetsEQTP2021.txt').then(r => r.text()),
          fetch('/Inflation.txt').then(r => r.text()),
          fetch('/Plafond.txt').then(r => r.text()),
          fetch('/EsperanceVie.txt').then(r => r.text()),
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

        // Créer le tableau final trié
        const historicalData = Array.from(dataByYear.values()).sort((a, b) => a.year - b.year);

        const salaryDistributionEqtp = distribEqtp.map((row: any) => ({
          min: parseInt(row['De']),
          max: row['A'] ? parseInt(row['A']) : null,
          effectif: parseInt(row['Effectif']),
          moyen: 0,
          moyenPrime: 0,
          centile: 0,
          masseBrutAnPmssMaxed: 0,
          masseBrutAnOverPmss: 0,
        }));

        // Appeler le callback avec les données
        onDataLoaded({ historicalData, salaryDistributionEqtp, dataByYear });

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    loadData();
  }, []);

  return null; // pas d'affichage
};

export default DataLoader;
