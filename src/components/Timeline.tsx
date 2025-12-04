import React from 'react';
import type { SimulationParams, ImportantDate, HistoricalData } from './types';
import { createHistoricalData, formatNum } from '../helpers/Common';
import { calculateTRI } from '../helpers/tri';

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
    (d.sumtotalCnavPlafondEnSalMoy || 0) + 
    (d.sumtotalCnavHorsPlafondEnSalMoy || 0) + 
    (d.sumtotalCnavPlafondEnSalMoyCroissMasSal || 0) + 
    (d.sumtotalCnavHorsPlafondEnSalMoyCroissMasSal || 0),
    d.sumpensionMensEnSalMoy || 0
  ]);
  const maxValue = Math.max(...allValues);
  
  // Pixels par unité de PMSS
  const pixelsPerPmss = 150 / maxValue;

    const age0 = historicalData.find(d => d.age === 0)||createHistoricalData();

            const propTravail = (age0.dureeCotisation/4) / (age0.dureeVieEnRetraite+age0.ageRetraite);
            console.log(age0.ageRetraite,(age0.dureeCotisation/4),age0.esperanceVie, propTravail)
            const perso = age0.sumtotalCnavPlafondEnSalMoy;
            const riche = age0.sumtotalCnavHorsPlafondEnSalMoy;
            const demo = age0.sumtotalCnavPlafondEnSalMoyCroissMasSal+age0.sumtotalCnavHorsPlafondEnSalMoyCroissMasSal-(perso+riche);
            const next = age0.sumpensionMensEnSalMoy-(perso+riche+demo);

            const persoPerc = perso/age0.sumpensionMensEnSalMoy;
            const richePerc = riche/age0.sumpensionMensEnSalMoy;
            const demoPerc = demo/age0.sumpensionMensEnSalMoy;
            const nextPerc = next/age0.sumpensionMensEnSalMoy;

            const dureeCotisee = age0.dureeVieEnRetraite*persoPerc;
            const dureeFinancee = age0.dureeVieEnRetraite*(richePerc+demoPerc+persoPerc);
            const dureeNonFinancee = age0.dureeVieEnRetraite*nextPerc;
// console.log(age0)

const triPerso = calculateTRI(historicalData, true);

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
            const cotisPlafond = currentData.sumtotalCnavPlafondEnSalMoy || 0;
            const cotisHorsPlafond = currentData.sumtotalCnavHorsPlafondEnSalMoy || 0;
            const cotisDemographie = (currentData.sumtotalCnavPlafondEnSalMoyCroissMasSal || 0) + 
                                     (currentData.sumtotalCnavHorsPlafondEnSalMoyCroissMasSal || 0) - 
                                     (cotisPlafond+cotisHorsPlafond);
            const pension = currentData.sumpensionMensEnSalMoy || 0;
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
            <span className="text-blue-800 italic">Personelle ({formatNum(persoPerc*100, 2, "%")})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-400"></div>
            <span className="text-purple-600 italic">Croissance économique ({formatNum(demoPerc*100, 2, "%")})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-400"></div>
            <span className="text-orange-800 italic">Hauts revenus ({formatNum(richePerc*100, 2, "%")})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500"></div>
            <span className="text-red-800 italic">Génération suivante ({formatNum(nextPerc*100, 2, "%")})</span>
          </div>
        </div>
        
          {allYears.map((year) => {
            const currentData = historicalData[year - year0];
            if (!currentData) return null;

            return (
              <div  key={`summary-${year}`}>
                {currentData.age == 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-5 text-sm">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-green-800 text-center">Temps de travail dans la vie</div>
            <div className="font-semibold text-green-600 text-center" style={{marginTop: "5px"}}>{(100*propTravail).toFixed(2)}%</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-blue-800 text-center">Total cotisé</div>
            <div className="font-semibold text-blue-600 text-center" style={{marginTop: "5px"}}>
              {formatNum(age0.sumtotalCnavPlafondEnSalMoy/100, 0, "salaires moyens")}<br/>
              <i>({(dureeCotisee).toFixed(2)} ans de retraite)</i>
            </div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-purple-800 text-center">Total financé</div>
            <div className="font-semibold text-purple-600 text-center" style={{marginTop: "5px"}}>
              {formatNum((age0.sumtotalCnavPlafondEnSalMoyCroissMasSal+age0.sumtotalCnavHorsPlafondEnSalMoyCroissMasSal)/100, 0, "salaires moyens")}<br/>
              <i>({(dureeFinancee).toFixed(2)} ans de retraite)</i>
            </div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="text-orange-800 text-center">Total obtenu</div>
            <div className="font-semibold text-orange-600 text-center" style={{marginTop: "5px"}}>
              {formatNum(age0.sumpensionMensEnSalMoy/100, 0, "salaires moyens")}<br/>
              <i>({(age0.dureeVieEnRetraite).toFixed(2)} ans de retraite)</i>
            </div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-red-800 text-center">Total ponctionné</div>
            <div className="font-semibold text-red-600 text-center" style={{marginTop: "5px"}}>
              {formatNum(next/100, 0, "salaires moyens")}<br/>
              <i>({(dureeNonFinancee).toFixed(2)} ans de retraite)</i>
            </div>
          </div>
          <p className="md:col-span-5 italic">
  (*) Cette simulation concerne une personne fictive ayant toujours perçu le salaire moyen et validé toutes ses annuités. 
  Le <span className="text-blue-600">“total cotisé”</span> représente l’ensemble des cotisations réellement versées par le salarié (en salaires moyens), 
  le <span className="text-purple-600">“total financé”</span> correspond à l’apport de la croissance démographique et économique au système par répartition, 
  le <span className="text-orange-600">“total obtenu”</span> est le total des pensions perçues sur toute la retraite, 
  et le <span className="text-red-600">“total ponctionné”</span> mesure l’effort de solidarité fourni par la génération active pour couvrir la part non financée par les cotisations du retraité.
</p>

          <p className="md:col-span-5">Cela correspond pour cette génération à un taux implicite de rendement <span className="text-green-600">TRI = {(triPerso*100).toFixed(2)}%</span></p>
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