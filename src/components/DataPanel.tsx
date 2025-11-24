import React, { useState } from 'react';
import { salaireMensMoyNet2021, type HistoricalData, type SalaryDistributionEqtp, type SalaryInfo } from './types';
import { formatNum } from '../helpers/Common';
import MethodologyDisplay from './Methodo';

const DataPanel: React.FC<{
  historicalData: HistoricalData[];
  salaryDistributionEqtp: SalaryDistributionEqtp[];
  salaryInfo: SalaryInfo;
  isLoading: boolean;
}> = ({ historicalData, salaryDistributionEqtp, salaryInfo, isLoading }) => {
  const [showData, setShowData] = useState(false);
  const [activeTab, setActiveTab] = useState<'historical' | 'projection' | 'distributionEqtp' | 'distributionBrute' | 'methodo'>('methodo');

  // Pour calculer le nombre de personnes au dessus du pmss
  const data2021 = historicalData.find(d => d.year === 2021);
  const pmss2021 = data2021?.pmssNet ?? 0;
  const masseSal2021 = data2021?.masseSalarialeBrut ?? 0;
  const masseSalPublic2021 = data2021?.masseSalarialePubliqueBrut ?? 0;
  const masseSalPriv2021 = masseSal2021-masseSalPublic2021;

  var activDataColor = activeTab == 'historical'?"gray":"blue";

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <p className="text-gray-600">Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Données sources et méthodologie</h2>
          <button
            onClick={() => setShowData(!showData)}
            className="text-sm font-normal text-blue-600 hover:text-blue-800 transition-colors"
          >
            {showData ? '∧ Masquer' : '+ Afficher'}
          </button>
        </div>
      </div>

      {showData && (
        <div className="px-6 py-4">
          {/* Tabs */}
          <div className="flex space-x-4 mb-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('methodo')}
              className={`pb-2 px-4 font-medium transition-colors ${
                activeTab === 'methodo'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Méthodologie
            </button>
            <button
              onClick={() => setActiveTab('historical')}
              className={`pb-2 px-4 font-medium transition-colors ${
                activeTab === 'historical'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Données historiques ({2023-1944} ans)
            </button>
            <button
              onClick={() => setActiveTab('projection')}
              className={`pb-2 px-4 font-medium transition-colors ${
                activeTab === 'projection'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Données projetées ({historicalData.length-(2023-1944)} ans)
            </button>
            <button
              onClick={() => setActiveTab('distributionEqtp')}
              className={`pb-2 px-4 font-medium transition-colors ${
                activeTab === 'distributionEqtp'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Distribution EQTP 2021
            </button>
          </div>

          {/* Historical Data Table */}
          { (activeTab == 'historical' || activeTab == 'projection') && (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className={`px-2 py-2 text-left font-semibold text-${activDataColor}-700`}>Année</th>
                    <th className={`px-3 py-2 text-right text-${activDataColor}-700`}>Inflation</th>
                    <th className={`px-2 py-2 text-right font-semibold text-${activDataColor}-700`}>Masse sal. brut (Mds€)</th>
                    <th className={`px-2 py-2 text-right font-semibold text-${activDataColor}-700`}>Masse sal. pub. brut (Mds€)</th>
                    {/* <th className={`px-2 py-2 text-right font-semibold text-${activDataColor}-700`}>Emploi ménages (milliers)</th> */}
                    <th className={`px-2 py-2 text-right font-semibold text-${activDataColor}-700`}>Sal. Moy. Net TC (€/an)</th>
                    <th className={`px-2 py-2 text-right font-semibold text-blue-700`}>Sal. Moy. Net Eqtp (€/mens)</th>
                    <th className={`px-2 py-2 text-right font-semibold text-${activDataColor}-700`}>Tx Cnav Plaf. (%)</th>
                    <th className={`px-2 py-2 text-right font-semibold text-${activDataColor}-700`}>Tx Cnav Déplaf. (%)</th>
                    <th className={`px-2 py-2 text-right font-semibold text-${activDataColor}-700`}>Espérance de vie (ans)</th>
                    <th className={`px-2 py-2 text-right font-semibold text-${activDataColor}-700`}>Âge retraite</th>
                    <th className={`px-2 py-2 text-right font-semibold text-${activDataColor}-700`}>Durée cotis.</th>
                  </tr>
                </thead>
                <tbody>
                  {historicalData.map((data, idx) => (
                    (((activeTab == 'historical' && data.year <= 2023) || (activeTab == 'projection' && data.year > 2023)) && (
                    <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className={`px-2 py-2 text-${activDataColor}-700`}>{data.year}</td>
                      <td className={`px-2 py-2 text-right text-${activDataColor}-700`}>{formatNum(data.inflation,1)}</td>
                      <td className={`px-2 py-2 text-right text-${activDataColor}-700`}>{formatNum(data.masseSalarialeBrut,1)}</td>
                      <td className={`px-2 py-2 text-right text-${activDataColor}-700`}>{formatNum(data.masseSalarialePubliqueBrut,1)}</td>
                      {/* <td className={`px-2 py-2 text-right text-${activDataColor}-700`}>{formatNum(data.s14,1)}</td> */}
                      <td className={`px-2 py-2 text-right text-${activDataColor}-700`}>{formatNum(data.salMoyNetAnTc)}</td>
                      <td className={`px-2 py-2 text-right text-blue-700`}>{formatNum(data.salMoyNetMens)}</td>
                      <td className={`px-2 py-2 text-right text-${activDataColor}-700`}>{formatNum(data.txCnavPlafond,2)}</td>
                      <td className={`px-2 py-2 text-right text-${activDataColor}-700`}>{formatNum(data.txCnavSalaire,2)}</td>
                      <td className={`px-2 py-2 text-right text-${activDataColor}-700`}>{formatNum(data.esperanceVie,1)}</td>
                      <td className={`px-2 py-2 text-right text-${activDataColor}-700`}>{data.ageRetraite}</td>
                      <td className={`px-2 py-2 text-right text-${activDataColor}-700`}>{data.dureeCotisation}</td>
                    </tr>
                  ))))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* distributionEqtp */}
          {activeTab === 'distributionEqtp' && (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Tranche</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">Effectif</th>
                    <th className="px-3 py-2 text-right font-semibold text-blue-700">Centile</th>
                    <th className="px-3 py-2 text-right font-semibold text-blue-700">Net Mens. Ref</th>
                    <th className="px-3 py-2 text-right font-semibold text-blue-700">&gt; Pmss  Net ({pmss2021}€)</th>
                    <th className="px-3 py-2 text-right font-semibold text-blue-700">Masse Sal. Brut Plaf. Pmss</th>
                    <th className="px-3 py-2 text-right font-semibold text-blue-700">Masse Sal. Brut &gt;Pmss</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const rows = salaryDistributionEqtp.map((range, idx) => {
                      var isOverPmss = range.masseBrutAnOverPmss > 0;
                      return (
                        <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                          <td className="px-3 py-2">
                            {formatNum(range.min, 0, "€")} - {formatNum(range.max, 0, "€")}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {formatNum(range.effectif)}
                          </td>
                          <td className={`px-3 py-2 text-right ${isOverPmss?"text-orange-600":"text-green-600"}`}>
                            {formatNum(range.centile, 1)}
                          </td>
                          <td className={`px-3 py-2 text-right ${isOverPmss?"text-orange-600":"text-green-600"}`}>
                            {formatNum(range.moyen,0,"€")}
                          </td>
                          <td className={`px-3 py-2 text-right ${isOverPmss?"text-orange-600":"text-green-600"}`}>
                            {isOverPmss?"oui":"non"}
                          </td>
                          <td className={`px-3 py-2 text-right ${isOverPmss?"text-orange-600":"text-green-600"}`}>
                            {formatNum(range.masseBrutAnMaxPmss,2, "Mds €")}
                          </td>
                          <td className={`px-3 py-2 text-right ${isOverPmss?"text-orange-600":"text-green-600"}`}>
                            {formatNum(range.masseBrutAnOverPmss,2, "Mds €")}
                          </td>
                        </tr>
                      );
                    });

                    // Ajout Total
                    rows.push(
                      <tr key="total" className="border-t border-gray-200 bg-gray-100 font-semibold">
                        <td className="px-3 py-2">Total</td>
                        <td className="px-3 py-2 text-right">{formatNum(salaryInfo.effectifSalarie)}</td>
                        <td className="px-3 py-2 text-right">100.0</td>
                        <td className="px-3 py-2 text-right">
                          {formatNum(salaireMensMoyNet2021,0, "€")}
                        </td>
                        <td className="px-3 py-2 text-right text-orange-600">{formatNum(100-salaryInfo.centileOverPmss,1)}</td>
                        <td className="px-3 py-2 text-right text-orange-600">
                          {formatNum(salaryInfo.masseSalMaxPmss,2, "Mds €")}
                        </td>
                        <td className="px-3 py-2 text-right text-orange-600">
                          {formatNum(salaryInfo.masseSalOverPmss,2, "Mds €")}
                        </td>
                      </tr>
                    );

                    // Ajout Total
                    rows.push(
                      <tr key="totalMenage" className="border-t border-gray-200 bg-gray-100 font-semibold">
                        <td className="px-3 py-2">Total +ménages</td>
                        <td className="px-3 py-2 text-right">{formatNum(salaryInfo.effectifSalarieTotalPrive)}</td>
                        <td className="px-3 py-2 text-right">-</td>
                        <td className="px-3 py-2 text-right">
                          {formatNum(salaryInfo.salaireMoyTotalPrive,0, "€")}
                        </td>
                        <td className="px-3 py-2 text-right text-orange-600">{formatNum(100-salaryInfo.centileOverPmss,1)}</td>
                        <td className="px-3 py-2 text-right text-orange-600">
                          {formatNum(salaryInfo.partMasseSalMaxPmss*masseSalPriv2021,2, "Mds €")}
                        </td>
                        <td className="px-3 py-2 text-right text-orange-600">
                          {formatNum(salaryInfo.partMasseSalOverPmss*masseSalPriv2021,2, "Mds €")}
                        </td>
                      </tr>
                    );

                    return rows;
                  })()}
                </tbody>
              </table>
            </div>
          )}
          
          {/* distributionEqtp */}
          {activeTab === 'methodo' && (
            <div className="overflow-x-auto max-h-96 overflow-y-auto ">
              <div className="space-y-6 mt-4">
                <MethodologyDisplay salaryInfo={salaryInfo} />
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default DataPanel;