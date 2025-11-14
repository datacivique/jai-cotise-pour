import React from 'react';
import type { SalaryInfo } from './types';
import { formatNum } from './Helpers';

export default function MethodologyDisplay({ salaryInfo }: { salaryInfo: SalaryInfo }) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Données sources et méthodologie</h2>
        </div>
      </div>
      
      <div className="px-6 py-6 space-y-6">
        {/* Objectif */}
        <div className="bg-blue-50 rounded-lg p-5 border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">🎯 Objectif</h3>
          <p className="text-gray-700 leading-relaxed mb-3">
            Cette application analyse la <strong>soutenabilité du système de retraite par répartition</strong> (régime général) 
            en comparant les cotisations et pensions d'un assuré exprimées en <strong>part de PMSS</strong> (Plafond Mensuel 
            de la Sécurité Sociale).
          </p>
          <p className="text-gray-700 leading-relaxed">
            L’objectif est d’illustrer que lorsque la valeur des pensions perçues dépasse la somme des cotisations versées (en parts de PMSS), le système s’éloigne d’un équilibre purement <strong>assurantiel</strong> et repose davantage sur un transfert intergénérationnel croissant.
          </p>
        </div>

        {/* Approche conservatrice */}
        <div className="bg-yellow-50 rounded-lg p-5 border-l-4 border-yellow-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">⚠️ Approche conservatrice : Test en conditions favorables</h3>
          <p className="text-gray-700 leading-relaxed mb-3">
            Cette analyse teste la soutenabilité du système dans un scénario <strong>volontairement favorable</strong> :
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Carrière complète au PMSS</strong> (alors que la plupart des salariés reste en-dessous du PMSS toute leur vie)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Aucune période de chômage</strong>, maladie ou temps partiel</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Exclusion des prestations supplémentaires</strong> (minimum contributif, majorations familiales de 10% pour 3 enfants, pension de réversion)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Inclusion du bénéfice de la croissance économique</strong> (augmentation de la masse salariale, hausse du taux d'emploi)</span>
            </li>
          </ul>
          <div className="mt-4 bg-white rounded-md p-3 border-l-2 border-yellow-600">
            <p className="text-gray-800 font-semibold">
              💡 <strong>Si le système apparaît insoutenable dans ces conditions optimales, il l'est a fortiori dans la réalité.</strong>
            </p>
          </div>
        </div>

        {/* Principe */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">💼 Principe de calcul</h3>
          <p className="text-gray-700 leading-relaxed mb-3">
            Nous modélisons un assuré rémunéré <strong>toute sa carrière au PMSS</strong> et mesurons :
          </p>
          <div className="grid md:grid-cols-3 gap-4 mb-3">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="font-semibold text-green-900 mb-1">💰 Contribution personnelle</div>
              <div className="text-sm text-gray-700">Cotisations CNAV (part patronale + salariale)</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="font-semibold text-purple-900 mb-1">🤝 Solidarité intra-générationnelle</div>
              <div className="text-sm text-gray-700">Cotisations hors plafond</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="font-semibold text-orange-900 mb-1">📈 Bénéfice de la croissance économique</div>
              <div className="text-sm text-gray-700">Augmentation de la masse salariale par la démographie, taux d'emploi</div>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Ces contributions sont comparées aux <strong>prestations reçues durant la retraite</strong> (calculées sur 
            l'espérance de vie moyenne de la génération), le tout exprimé en part de PMSS.
          </p>
        </div>

        {/* Contribution personnelle */}
        <div className="border-t border-gray-200 pt-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">👥 1. Contribution personnelle</h3>
          <p className="text-gray-700 leading-relaxed mb-2">
            Basée sur les <strong>taux totaux CNAV</strong> par année de cotisation, la durée de cotisation et l'âge de départ à taux plein.
          </p>
          <div className="text-sm text-gray-600 space-y-1 pl-4">
            <div>📊 Sources : <a href="https://www.statistiques-recherche.lassuranceretraite.fr/app/uploads/2020/11/T2_recueil-stat-2019.pdf" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Recueil statistique CNAV 2019</a></div>
            <div>📅 Durées & âges : <a href="https://www.carpv.fr/wp-content/uploads/2015/03/Age_legal_depart_-retraite.pdf" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">CARPV</a> | <a href="https://www.cleiss.fr/docs/regimes/regime_france3.html" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">CLEISS</a> | <a href="https://www.cprpf.fr/app/uploads/2023/11/DAT.pdf" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">CPRPF</a></div>
          </div>
        </div>

        {/* Solidarité intra-générationnelle */}
        <div className="border-t border-gray-200 pt-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🤝 2. Solidarité intra-générationnelle</h3>
          <p className="text-gray-700 leading-relaxed mb-3">
            Nous reconstituons la <strong>masse salariale brute plafonnée</strong> et celle <strong>au-dessus du PMSS</strong> pour estimer 
            le ratio de contributions hors plafond.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-3">
            <div className="font-semibold text-gray-900 mb-2">Méthodologie de reconstitution :</div>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>Distribution des salaires nets EQTP 2021 (<a href="https://www.insee.fr/fr/statistiques/fichier/6799523/donnees_insee_premiere_n1938.xlsx" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">INSEE - Figure 2</a>) → centiles au-dessus du PMSS</li>
              <li>Salaire moyen (<a href="https://www.insee.fr/fr/statistiques/fichier/6799523/donnees_insee_premiere_n1938.xlsx" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Figure 1</a>) → reconstitution de la dernière tranche</li>
              <li>Masse salariale privée 2021 via <a href="https://www.insee.fr/fr/statistiques/8574832" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Comptes de la nation</a> (1.107 et 3.201) pour inclure primes, apprentissage, etc...</li>
              <li>Ventilation équitable des primes sur chaque tranche</li>
              <li>Obtient le ratio brut/net du <a href="https://www.insee.fr/fr/statistiques/fichier/8282118/PLAFOND.xlsx" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">PMSS 2021</a> ({formatNum(salaryInfo.ratioBrutNet, 2, "%")})</li>
              <li>Calcul des masses (×12 mois, ratio brut/net)</li>
            </ol>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="font-semibold text-purple-900 mb-2">📊 Résultats stabilisés (2021) :</div>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">72%</span>
                <span className="text-gray-700">Masse salariale plafonnée / masse totale privée</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">41%</span>
                <span className="text-gray-700">Masse au-dessus du PMSS / masse totale privée</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Hypothèse : Ces proportions restent dans ces ordres de grandeur dans le temps, les inégalités salariales 
              évoluant peu en comparaison de l'évolution du PMSS lui-même, d'autant que la part de contribution déplafonnée reste marginale.
            </p>
          </div>
        </div>

        {/* Contribution démographique */}
        <div className="border-t border-gray-200 pt-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">📈 3. Bénéfice de la croissance économique</h3>
          <p className="text-gray-700 leading-relaxed mb-2">
            Comparaison année après année de la <strong>masse salariale privée en part de PMSS</strong> pour mesurer 
            les effets conjugués de :
          </p>
          <ul className="text-sm text-gray-700 space-y-1 pl-6 mb-3">
            <li>• Augmentation du nombre de cotisants (démographie, immigration)</li>
            <li>• Hausse du taux d'emploi (réduction du chômage)</li>
            <li>• Gains de productivité</li>
            <li>• Croissance de la masse salariale totale</li>
          </ul>
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <p className="text-sm text-gray-700">
              <strong>Note méthodologique :</strong> Cette croissance macro bénéficie au système global par répartition. 
              Nous l'intégrons ici pour montrer que <em>même en tenant compte de ces gains collectifs</em>, 
              le système reste déficitaire pour l'assuré modélisé.
            </p>
          </div>
        </div>

        {/* Pensions */}
        <div className="border-t border-gray-200 pt-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">💳 Calcul des pensions</h3>
          <p className="text-gray-700 leading-relaxed mb-2">
            Les pensions sont indexées sur <strong>l'inflation</strong> (<a href="https://www.insee.fr/fr/statistiques/fichier/8282118/INFLATION.xlsx" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">INSEE</a>). 
            Point de départ : <strong>50% du PMSS</strong> (retraite à taux plein).
          </p>
          <p className="text-gray-700 leading-relaxed mb-2">
            Nous appliquons le différentiel <strong>inflation - croissance du PMSS</strong> pour conserver 
            une prestation exprimée en part de PMSS constante dans le temps.
          </p>
          <p className="text-sm text-gray-600 italic">
            Note : Les revalorisations exceptionnelles hors inflation sont exclues de cette analyse (approche conservatrice).
          </p>
        </div>

        {/* Résultat final */}
        <div className="border-t-2 border-gray-300 pt-5">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-5 border-l-4 border-blue-600">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🔍 Indicateur de soutenabilité</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Nous obtenons deux totaux exprimés en <strong>parts de PMSS</strong> :
            </p>
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-gray-800">
                <span className="font-semibold text-green-700">✓ Somme cotisée :</span>
                <span>Contribution personnelle + solidarité intra-générationnelle + bénéfice de la croissance économique</span>
              </div>
              <div className="flex items-center gap-2 text-gray-800">
                <span className="font-semibold text-blue-700">✓ Somme perçue :</span>
                <span>Pensions de retraite sur l'espérance de vie de la génération</span>
              </div>
            </div>
            <div className="bg-white rounded-md p-4 border border-red-300">
              <p className="text-gray-800 font-medium mb-2">
                💡 <strong>Lorsque la somme des pensions dépasse la somme des cotisations</strong> (en part de PMSS), 
                cela révèle un <span className="text-red-600 font-semibold">déséquilibre structurel</span>.
              </p>
              <p className="text-gray-700 text-sm">
                Recevoir plus qu'on a cotisé transforme un système assurantiel soutenable en système de Ponzi 
                où ce sont les générations futures qui assumeront le déficit. L'écart mesure l'ampleur de cet abus 
                du système et questionne sa viabilité à long terme.
              </p>
            </div>
          </div>
        </div>

        {/* Limites */}
        <div className="border-t-2 border-gray-300 pt-5">
          <div className="bg-gray-50 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">⚖️ Limites de l'analyse</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <span className="font-semibold text-gray-900">• Analyse individuelle vs système collectif :</span> Cette 
                approche mesure l'équilibre pour un profil type au PMSS. Le système par répartition fonctionne sur la mutualisation, 
                mais si même un assuré médian ne peut être financé, le système global est insoutenable.
              </div>
              <div>
                <span className="font-semibold text-gray-900">• Évolution des paramètres :</span> Les ratios 72%/41% 
                de répartition des masses salariales sont basés sur les données 2021 et supposés stables dans le temps.
              </div>
              <div>
                <span className="font-semibold text-gray-900">• Périmètre :</span> Régime général uniquement. 
                Les régimes complémentaires type AGIRC-ARRCO ne sont pas inclus.
              </div>
              <div>
                <span className="font-semibold text-gray-900">• Hypothèse d'indexation :</span> Les pensions sont 
                supposées strictement indexées sur l'inflation. Les revalorisations réelles peuvent en différer.
              </div>
              <div>
                <span className="font-semibold text-gray-900">• Attribution de la croissance macro :</span> Le bénéfice 
                de la croissance économique (augmentation de la masse salariale) est un gain collectif du système par répartition. 
                Son attribution à un individu est une convention méthodologique pour tester la soutenabilité en conditions favorables.
              </div>
            </div>
          </div>
        </div>

        {/* Interprétation */}
        <div className="bg-red-50 rounded-lg p-5 border-l-4 border-red-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">⚠️ Interprétation des résultats</h3>
          <p className="text-gray-700 leading-relaxed">
            Cette méthodologie établit une <strong>borne inférieure de l'insoutenabilité</strong> : si le système est 
            déficitaire dans ce scénario optimal (carrière complète au PMSS avec bénéfice de la croissance), il l'est 
            nécessairement davantage dans la réalité où :
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            <li>• 70% des salariés cotisent en-dessous du PMSS</li>
            <li>• Les carrières sont incomplètes (chômage, temps partiel)</li>
            <li>• Les prestations incluent des avantages supplémentaires (minimums, majorations)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}