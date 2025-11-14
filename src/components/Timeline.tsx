import React from 'react';
import type { SimulationParams, ImportantDate, HistoricalData } from './types';
import { formatNum, getAge0 } from './Helpers';

const Timeline: React.FC<{
  params: SimulationParams;
  importantDates: ImportantDate[];
  historicalData: HistoricalData[];
}> = ({ params, importantDates, historicalData }) => {
  const { birthYear, lifeExpectancy } = params;

  const year0 = 1944;

  // Timeline start/end sur multiples de 5
  const timelineStart = (Math.floor((birthYear - 5) / 5) * 5) + 5;
  const timelineEnd = (Math.ceil((birthYear + lifeExpectancy + 5) / 5) * 5) - 1;
  const timelineRange = timelineEnd - timelineStart;

  // Timeline linéaire année par année
  const allYears = [];
  for (let year = timelineStart; year <= timelineEnd; year++) {
    allYears.push(year);
  }

  // Fonction pour positionner en % sur la timeline
  const getPositionPercent = (year: number) => ((year - timelineStart) / timelineRange) * 100;

  // Trouver la valeur max globale pour une échelle commune (en PMSS)
  const allValues = historicalData.flatMap(d => [
    (d.sumtotalCnavPlafondEnPmss || 0) + 
    (d.sumtotalCnavHorsPlafondEnPmss || 0) + 
    (d.sumtotalCnavPlafondEnPmssCroissMasSal || 0) + 
    (d.sumtotalCnavHorsPlafondEnPmssCroissMasSal || 0),
    d.sumpensionMensEnPmss || 0
  ]);
  const maxValue = Math.max(...allValues);
  
  // Pixels par unité de PMSS
  const pixelsPerPmss = 150 / maxValue;

  const age0 = getAge0(historicalData);

            const propTravail = (age0.ageRetraite - (age0.dureeCotisation/4)) / age0.esperanceVie;
            const perso = age0.sumtotalCnavPlafondEnPmss;
            const riche = age0.sumtotalCnavHorsPlafondEnPmss;
            const demo = age0.sumtotalCnavHorsPlafondEnPmssCroissMasSal+age0.sumtotalCnavPlafondEnPmssCroissMasSal-(age0.sumtotalCnavPlafondEnPmss+age0.sumtotalCnavHorsPlafondEnPmss);
            const next = age0.sumpensionMensEnPmss-(perso+riche+demo);
            const transfert = riche+next;
            const dureeCotisee = age0.dureeRetraiteCotise;
            const dureeNonCotisee = age0.dureeVieEnRetraite - age0.dureeRetraiteCotise;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Soutenabilité du régime général dans le temps</h2>
      </div>
      <div className="px-6 py-6">
        <div className="relative" style={{ height: '400px' }}>
          {/* Ligne horizontale principale */}
          <div className="absolute left-0 right-0 h-1 bg-gray-300" style={{ top: '50%' }} />

          {/* Histogrammes */}
          {allYears.map((year) => {
            const currentData = historicalData[year - year0];
            if (!currentData) return null;
            
            // Calculer les hauteurs des barres
            const cotisPlafond = currentData.sumtotalCnavPlafondEnPmss || 0;
            const cotisHorsPlafond = currentData.sumtotalCnavHorsPlafondEnPmss || 0;
            const cotisDemographie = (currentData.sumtotalCnavPlafondEnPmssCroissMasSal || 0) + 
                                     (currentData.sumtotalCnavHorsPlafondEnPmssCroissMasSal || 0) - 
                                     cotisPlafond;
            const pension = currentData.sumpensionMensEnPmss || 0;
            // console.log(year,cotisPlafond,cotisHorsPlafond)
            
            const isRetired = currentData.t1.isRetired || currentData.t4.isRetired;
            
            // Normaliser les hauteurs avec la même échelle
            const heightPlafond = cotisPlafond * pixelsPerPmss;
            const heightHorsPlafond = cotisHorsPlafond * pixelsPerPmss;
            const heightDemographie = cotisDemographie * pixelsPerPmss;
            const heightPension = pension * pixelsPerPmss;
            
            const totalCotisHeight = heightPlafond + heightHorsPlafond + heightDemographie;
            const age = currentData.age;
            
            // Les cotisations descendent quand il y a des pensions
            // Si pensions < cotisations : descente de heightPension
            // Si pensions >= cotisations : descente jusqu'à 0 (axe)
            const cotisBottomOffset = isRetired ? Math.min(heightPension, totalCotisHeight) : 0;
            
            // Partie rouge : uniquement si pensions > cotisations
            const redHeight = isRetired ? Math.max(0, heightPension - totalCotisHeight) : 0;

            function getTitle(title:string, cotis:number, pension:number): string {
              var signe = cotis>pension ? ">" : "<";
              if (pension>0) {
                return `${title}: ${formatNum(cotis,0,"PMSS")} ${signe} Pensions perçues: ${formatNum(pension,0,"PMSS")}`;
              } else {
                return `${title}: ${formatNum(cotis,0,"PMSS")}`;
              }
            }
            
            return (
              <div
                key={`bar-${year}`}
                className="absolute"
                style={{
                  left: `${2.3 + getPositionPercent(year)}%`,
                  bottom: '50%',
                  transform: 'translateX(-50%)',
                  width: '4px',
                }}
              >
                {/* Barre des cotisations - elle descend quand il y a des pensions */}
                {totalCotisHeight > 0 && age > 0 && (
                  <div 
                    className="absolute w-full"
                    style={{ 
                      bottom: `-${cotisBottomOffset}px`,
                      height: `${totalCotisHeight}px` 
                    }}
                  >
                    {/* Démographie (en haut) */}
                    {heightDemographie > 0 && (
                      <div 
                        className="w-full bg-purple-400"
                        style={{ height: `${heightDemographie}px` }}
                        title={`(${year}) Croissance économique: ${formatNum(cotisDemographie,2,"PMSS")}`}
                      />
                    )}
                    {/* Solidarité intra (au milieu) */}
                    {heightHorsPlafond > 0 && (
                      <div 
                        className="w-full bg-orange-400"
                        style={{ height: `${heightHorsPlafond}px` }}
                        title={`(${year}) Contribution hauts revenus: ${formatNum(cotisHorsPlafond,2,"PMSS")}`}
                      />
                    )}
                    {/* Cotisations plafond (en bas) */}
                    {heightPlafond > 0 && (
                      <div 
                        className="w-full bg-blue-500"
                        style={{ height: `${heightPlafond}px` }}
                        title={`(${year}) ${getTitle("Cotisations plafond", cotisPlafond, pension)}`}
                      />
                    )}
                  </div>
                )}
                
                {/* Barre rouge - solidarité inter-générationnelle (pensions > cotisations) */}
                {redHeight > 0 && (
                  <div 
                    className="absolute w-full bg-red-500"
                    style={{ 
                      bottom: `-${heightPension}px`,
                      height: `${redHeight}px` 
                    }}
                    title={`(${year}) Solidarité inter-générationnelle: ${((heightPension - totalCotisHeight) / pixelsPerPmss).toFixed(2)} PMSS`}
                  />
                )}
              </div>
            );
          })}

          {/* Timeline */}
          {allYears.map((year) => {
            const date = importantDates.find((d) => Math.floor(d.year) === year);

            // Affiche trait important si c'est une date importante
            const importantLine = date ? (
              <div>
                {date.showLine && (
                <div className={`w-1 h-12 ${date.color}`} style={{ marginTop: '-14px', position: 'absolute' }} />
                )}
                <div className="text-xs text-gray-500 whitespace-nowrap text-center" 
                  style={{ marginTop: date.showUp ? '-44px' : '44px', marginLeft: '-48px', width: '96px', position: 'absolute' }}>
                  {date.label}
                </div>
              </div>
            ) : null;

            // Affiche une graduation seulement tous les 5 ans
            const graduationLine = year % 5 === 0 ? (
              <div className="w-0.5 h-4 bg-gray-400" style={{ marginTop: '-8px', position: 'absolute' }} />
            ) : null;

            // Label année seulement tous les 5 ans
            const label = year % 5 === 0 ? (
              <div
                className="text-xs text-gray-600 text-center"
                style={{ marginTop: '13px', marginLeft: '-16px', width: '32px', position: 'absolute' }}
              >
                {year}
              </div>
            ) : null;

            return (
              <div
                key={year}
                className="absolute"
                style={{
                  left: `${2 + getPositionPercent(year)}%`,
                  top: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                {graduationLine}
                {label}
                {importantLine}
              </div>
            );
          })}
        </div>

        {/* Légende */}
        <div className="mt-16 mb-6 flex flex-wrap gap-4 text-sm justify-center">
          Contributions :
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500"></div>
            <span className="text-blue-800 italic">Personelle ({formatNum(perso*100/age0.sumpensionMensEnPmss, 2, "%")})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-400"></div>
            <span className="text-purple-600 italic">Croissance économique ({formatNum(demo*100/age0.sumpensionMensEnPmss, 2, "%")})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-400"></div>
            <span className="text-orange-800 italic">Hauts revenus ({formatNum(riche*100/age0.sumpensionMensEnPmss, 2, "%")})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500"></div>
            <span className="text-red-800 italic">Génération suivante ({formatNum(next*100/age0.sumpensionMensEnPmss, 2, "%")})</span>
          </div>
        </div>
        
          {allYears.map((year) => {
            const currentData = historicalData[year - year0];
            if (!currentData) return null;

            return (
              <div  key={`summary-${year}`}>
                {currentData.age == 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-green-800">Temps de travail dans la vie</div>
            <div className="font-semibold text-green-600 text-center" style={{marginTop: "5px"}}>{(100*propTravail).toFixed(2)}%</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-blue-800">Durée de retraite financée</div>
            <div className="font-semibold text-blue-600 text-center" style={{marginTop: "5px"}}>{(dureeCotisee).toFixed(2)} ans</div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="text-orange-800">Durée de retraite non financée</div>
            <div className="font-semibold text-orange-600 text-center" style={{marginTop: "5px"}}>{(dureeNonCotisee).toFixed(2)} ans</div>
          </div>
          {/* <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-purple-800">Contribution personnelle</div>
            <div className="font-semibold text-purple-600 text-center" style={{marginTop: "5px"}}>{(100*perso/age0.sumpensionMensEnPmss).toFixed(2)}%</div>
          </div> */}
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-red-800">Transfert de niveau de vie</div>
            <div className="font-semibold text-red-600 text-center" style={{marginTop: "5px"}}>{(100*transfert/age0.sumpensionMensEnPmss).toFixed(2)}%</div>
          </div>
        </div>
                )}
              </div>
            );
          })}

      </div>
    </div>
  );
};

export default Timeline;