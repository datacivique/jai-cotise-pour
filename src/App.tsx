import { useEffect, useState } from 'react';
import ParametersPanel from './components/ParametersPanel';
// import Profil from './components/profil';
import Timeline from './components/Timeline';
import DataPanel from './components/DataPanel';
import { type SalaryInfo, type HistoricalData, type ImportantDate, type SalaryDistributionEqtp, type SimulationParams, projectionBasePib, projectionBaseInflation, projectionBaseSalMoy, type ProfilType } from './components/types';
import DataLoader from './components/DataLoader';
import { GetSalaryInfo } from './helpers/SalaryInfo';
import { UpdateHistoricalData } from './helpers/HistoricalData';
import { GetProfils } from './helpers/ProfilType';
import ProfilChart from './components/ProfileChart';

const RetirementSimulation = () => {
  const [params, setParams] = useState<SimulationParams>({
  // Simulation
    birthYear: 1953,
    retirementAge: 61.25,
    cotisationDuration: 165,
    lifeExpectancy: 85,
    indexationInflation: 0,
    keepParams: false,
  // Projection
    ProjectionMasseSalarialeGrowth: projectionBasePib,
    ProjectionInflation: projectionBaseInflation,
    ProjectionSalMoyGrowth: projectionBaseSalMoy,
    ProjectionLifeExpectancyGrowth: 2,
  });

  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [salaryDistributionEqtp, setSalaryDistributionEqtp] = useState<SalaryDistributionEqtp[]>([]);
  const [dataByYear, setDataByYear] = useState<Map<number, HistoricalData>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [salaryInfo, setSalaryInfo] = useState<SalaryInfo>({
    ratioBrutNet: 0,
    effectifSalarieTotalPrive: 0,
    salaireMoyTotalPrive: 0,
    effectifSalarie: 0,
    centileOverPmss: 0,
    masseSalMaxPmss: 0,
    masseSalOverPmss:0,
    partMasseSalMaxPmss: 0,
    partMasseSalOverPmss: 0,
  });
  const [profilsBase, setprofilsBase] = useState<ProfilType[]>([]);
  const [profils, setprofils] = useState<ProfilType[]>([]);
  const [profilId, setProfilId] = useState<number | null>(null);

  useEffect(() => {
     const urlParams = new URLSearchParams(window.location.search);
     const profilParam = urlParams.get('profil');
     
     if (profilParam !== null) {
       const id = parseInt(profilParam, 10);
       if (!isNaN(id)) {
         setProfilId(id);
       }
     }
   }, []);
  
  const workStartYear = params.birthYear + params.retirementAge - (params.cotisationDuration/4);
  const retirementYear = params.birthYear + params.retirementAge;
  const lifeExpectancyYear = params.birthYear + params.lifeExpectancy;
  const importantDates: ImportantDate[] = [
    { year: params.birthYear, label: 'Naissance', color: 'bg-green-600', textColor: 'text-green-600', showLine: true, showUp: false, },
    { year: Math.round(workStartYear), label: 'Début travail', color: 'bg-blue-600', textColor: 'text-blue-600', showLine: false, showUp: false, },
    { year: retirementYear, label: 'Retraite', color: 'bg-orange-600', textColor: 'text-orange-600', showLine: false, showUp: false, },
    { year: lifeExpectancyYear, label: 'Espérance de vie', color: 'bg-gray-600', textColor: 'text-gray-600', showLine: false, showUp: true, },
  ];

  const handleDataLoaded = (data: {
    historicalData: HistoricalData[];
    salaryDistributionEqtp: SalaryDistributionEqtp[];
    profilsBase: ProfilType[];
    dataByYear: Map<number, HistoricalData>;
  }) => {
    var salaryInfo = GetSalaryInfo(data.salaryDistributionEqtp, data.historicalData);
    setSalaryInfo(salaryInfo);
    UpdateHistoricalData(data.historicalData, params, salaryInfo);
    setHistoricalData(data.historicalData);
    setSalaryDistributionEqtp(data.salaryDistributionEqtp);
    setDataByYear(data.dataByYear);
    setIsLoading(false);
    setprofilsBase(data.profilsBase);
    setprofils(GetProfils(data.profilsBase, data.historicalData));
  };

  const handleParamsChange = (newParams: Partial<SimulationParams>) => {
    if (newParams.birthYear != undefined)
    {
      var c = dataByYear.get(newParams.birthYear);
      if (c == undefined) return;
      var p = {
        // Simulation
        birthYear: newParams.birthYear,
        retirementAge: c.ageRetraite,
        cotisationDuration: c.dureeCotisation,
        lifeExpectancy: 0,
        keepParams: params.keepParams,
        //Projection
        ProjectionInflation: params.ProjectionInflation,
        ProjectionLifeExpectancyGrowth: params.ProjectionLifeExpectancyGrowth,
        ProjectionMasseSalarialeGrowth: params.ProjectionMasseSalarialeGrowth,
        ProjectionSalMoyGrowth: params.ProjectionSalMoyGrowth,
      } as SimulationParams;
      if (params.keepParams) {
        p.retirementAge = params.retirementAge;
        p.cotisationDuration = params.cotisationDuration;
        p.indexationInflation = params.indexationInflation;
      }
      UpdateHistoricalData(historicalData, p, salaryInfo);
      p.lifeExpectancy = c.dureeVieEnRetraite + p.retirementAge;
      setParams(p);
      setprofils(GetProfils(profilsBase, historicalData));
    }
    else
    {
      const updatedParams = { ...params, ...newParams };
      UpdateHistoricalData(historicalData, updatedParams, salaryInfo);
      setParams(updatedParams);
      setprofils(GetProfils(profilsBase, historicalData));
    }
  };

  const GetProfil = (id:number) => {
    // console.log(profils, id, profils[id])
    if (profils[id] != undefined) {
      return profils[id];
    }
    return {
      name: "string",
      salaires: [],
  totalCotisation: 0,
  totalFinance: 0,
  totalPonction: 0,
    }
  }

  return (
    <div className="w-full min-w-4xl max-w-6xl mx-auto p-6 space-y-6 bg-gray-50 min-h-screen">

        {profilId !== null && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border-l-4 border-red-500 shadow-sm">
            <h3 className="text-2xl font-extrabold text-gray-900 mb-4">
              ⚡ Retraites : ce que personne ne vous a jamais vraiment expliqué
            </h3>

            {/* Punchline centrale */}
            <div className="bg-white rounded-md p-4 border-l-4 border-red-600 shadow mb-5">
              <p className="text-lg font-semibold text-red-800 leading-snug">
                Cotiser 10 à 15 % de son salaire pendant 44, voir 40 ans…  
                pour toucher 50 % des 25 meilleures années.
              </p>
              <p className="text-red-700 text-sm mt-2 font-medium">
                Une promesse intenable mathématiquement pendant 70 ans.  
                L’écart ? Il n’a jamais disparu. Il a simplement été envoyé à la génération suivante.
              </p>
            </div>

            {/* Explication courte mais explosive */}
              <p className="text-gray-800 font-semibold">
              Ici, on compare les <b>efforts contributifs</b> réels de chaque génération — cotisations, croissance économique, dynamique démographique — 
              avec ce qu’elle reçoit réellement de la <b>C</b>aisse <b>N</b>ationale d'<b>A</b>ssurance <b>V</b>ieillesse (le régime général).
              <br />🎯 Objectif : voir ce qui a été effectivement financé… et ce qui a été reporté sur la génération suivante
            </p>
          </div>
        )} 
        
        {profilId == null && (
<div className="bg-yellow-50 rounded-lg p-5 border-l-4 border-yellow-500">
  <h3 className="text-lg font-semibold text-gray-900 mb-2">🔍 La régime général ? Qui paie, et combien...</h3>
  <p className="text-gray-700 leading-relaxed mb-3">
    Cette application propose d'explorer la <strong>soutenabilité de la Caisse Nationale d'Assurance Vieillesse</strong> en comparant, 
    sur l'ensemble d'une vie, les <strong>cotisations versées</strong> et les 
    <strong> pensions perçues</strong>, exprimées en parts du 
    <strong> salaire moyen</strong>.
  </p>

  <div className="mt-4 bg-white rounded-md p-3 border-l-2 border-yellow-600">
    <p className="text-gray-800 font-semibold">
      🎯 Objectif : mieux percevoir les ordres de grandeur pour comprendre les enjeux de soutenabilité et de justice.
    </p>
  </div>
</div>
        )}



      <DataLoader onDataLoaded={handleDataLoaded} />

      <ParametersPanel params={params} onParamsChange={handleParamsChange} />
        {profilId !== null && (
          <ProfilChart profilType={GetProfil(profilId)} />
        )}
        {profilId == null && (
          <Timeline params={params} importantDates={importantDates} historicalData={historicalData} />
        )}
      <DataPanel
        historicalData={historicalData}
        salaryDistributionEqtp={salaryDistributionEqtp}
        isLoading={isLoading}
        salaryInfo={salaryInfo}
      />
    </div>
  );
};

export default RetirementSimulation;
