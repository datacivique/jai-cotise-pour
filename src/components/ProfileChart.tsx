import React, { useMemo } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import type { ProfilType } from './types';
import { salaireMensMoyBrut2025 } from './types';
import { GetSalRef } from '../helpers/ProfilType';
import { formatNum } from '../helpers/Common';

// Mapping des profils
const PROFILS = {
  0: 'Ouvrier',
  1: 'Employé',
  2: 'Cadre',
  3: 'Profession intermédiaire'
};

interface ProfilChartProps {
  profilType: ProfilType;
}

const ProfilChart: React.FC<ProfilChartProps> = ({ profilType }) => {
  // Récupérer le profil actuel depuis l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const currentProfil = urlParams.get('profil') || '0';

  // Fonction pour changer de profil
  const handleProfilChange = (profilId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('profil', profilId);
    window.location.href = url.toString();
  };

  const maxSalaire = Math.max(...profilType.salaires.map(s => s.salaire))*salaireMensMoyBrut2025;
  const maxTick = Math.ceil(Math.max(maxSalaire, salaireMensMoyBrut2025) / 1000) * 1000;
  const ticks = Array.from({ length: maxTick / 1000 + 1 }, (_, i) => i * 1000);
  const salaireRef = GetSalRef(profilType.salaires)*salaireMensMoyBrut2025;

const { chartData, totaux } = useMemo(() => {
    const salaires = profilType.salaires;
    if (!salaires || salaires.length === 0) {
      return { chartData: [], salaireMoyen: 1, totaux: { cotisation: 0, cotise: 0, finance: 0, ponctionne: 0, pension: 0 } };
    }

    // Calculer le salaire moyen (en unités relatives, normalisé autour de 1)
    const salaireEntries = salaires.filter(s => s.salaire && s.salaire > 0);
    const salaireMoyen = salaireEntries.length > 0
      ? salaireEntries.reduce((sum, s) => sum + (s.salaire || 0), 0) / salaireEntries.length
      : 1;

      var sumCotisation = profilType.totalCotisation;
      var sumCotise = profilType.totalCotisation;
      var sumFinance = profilType.totalFinance;
      var sumPonctionne = profilType.totalPonction;
      var sumPension = profilType.totalCotisation+profilType.totalFinance+profilType.totalPonction;
      var sumTotal = profilType.totalCotisation+profilType.totalFinance+profilType.totalPonction;

    // Transformer les données en euros
    const chartData = salaires.map(s => {
      // Conversion en euros (règle de 3: valeur_relative * salaireMensMoyBrut2025)
      return {
        annee: s.annee,
        salaire: s.salaire ? s.salaire * salaireMensMoyBrut2025 : null,
        net: s.net ? s.net * salaireMensMoyBrut2025 : null,
        cotisation: s.cotisation ? s.cotisation * salaireMensMoyBrut2025 : null,
        pension: s.pension ? s.pension * salaireMensMoyBrut2025 : null,
        pensionCotise: s.cotise ? s.cotise * salaireMensMoyBrut2025 : null,
        pensionFinance: s.finance ? s.finance * salaireMensMoyBrut2025 : null,
        pensionPonctionne: s.ponctionne ? s.ponctionne * salaireMensMoyBrut2025 : null,
        event: s.commentaire || '',
        hasEvent: !!s.commentaire
      };
    });

    const totaux = {
      cotisation: sumCotisation * 12,
      cotise: sumCotise * 12,
      finance: sumFinance * 12,
      ponctionne: sumPonctionne * 12,
      pension: sumPension * 12
    };

    // console.log(totaux)

    return { chartData, salaireMoyen, totaux };
  }, [profilType]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">Aucune donnée disponible</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-gray-300">
          <p className="font-bold text-gray-800 mb-2">Année {data.annee}</p>
          {data.salaire && (
            <>
              <p className="text-blue-600">Salaire brut: {data.salaire.toFixed(0)} €</p>
              <p className="text-grey">Salaire net: {data.net.toFixed(0)} €</p>
              <p className="text-green-600">Cotisation: {data.cotisation?.toFixed(0) || '0'} €</p>
            </>
          )}
          {data.pension && (
            <>
              <p className="text-red-600">Pension brute: {data.pension.toFixed(0)} €</p>
              <p className="text-grey">Pension nette: {data.net.toFixed(0)} €</p>
            </>
          )}
          {data.event && (
            <p className="text-gray-700 text-sm mt-2 italic font-medium border-t pt-2">
              📌 {data.event}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom dot pour les événements
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload.hasEvent) return null;

    return (
      <g>
        {/* Cercle rouge pour marquer l'événement */}
        <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} />
        {/* Petit texte au-dessus */}
        <text
          x={cx}
          y={cy - 15}
          textAnchor="middle"
          fill="#ef4444"
          fontSize="11"
          fontWeight="bold"
        >
        </text>
      </g>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-4">
        <div><h2 className="text-xl font-semibold text-gray-900">Évolution du Profil de Carrière type :</h2></div>
        {/* Boutons de sélection des profils */}
        <div className="flex flex-wrap gap-2 mb-4" style={{marginBottom: "-4px"}}>
          {Object.entries(PROFILS).map(([id, nom]) => (
            <button
              key={id}
              onClick={() => handleProfilChange(id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentProfil === id
                  ? 'bg-blue-600 text-blue-700 shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {nom}
            </button>
          ))}
        </div>
      </div>
      <p className="px-6 py-4 text-gray-600 text-sm mt-1">Montants exprimés en euros 2025, indexés sur le salaire moyen afin de refléter l'effort contributif dans le temps.</p>
      <ResponsiveContainer width="100%" height={500}>
        <ComposedChart
          data={chartData}
          margin={{ top: 30, right: 30, left: 20, bottom: 50 }}
        >
          <defs>
            {/* Dégradé vert pour les pensions cotisation */}
            <linearGradient id="colorCotisation" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.7}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
            </linearGradient>
            {/* Dégradé vert pour les pensions cotisées */}
            <linearGradient id="colorPensionCotise" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.7}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
            </linearGradient>
            {/* Dégradé violet pour les pensions financées */}
            <linearGradient id="colorPensionFinance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.7}/>
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.2}/>
            </linearGradient>
            {/* Dégradé rouge pour les pensions ponctionnées */}
            <linearGradient id="colorPensionPonctionne" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.7}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          
          <XAxis 
            dataKey="annee"
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#9ca3af' }}
          >
            <Label 
              value="Année après avoir commencer le travail" 
              position="insideBottom" 
              offset={-15}
              style={{ fontSize: 14, fontWeight: 'bold', fill: '#374151' }}
            />
          </XAxis>
          
          <YAxis 
            domain={[0, maxTick]}
            ticks={ticks}
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#9ca3af' }}
          >
            <Label 
              value="Montant mensuel brut (€)" 
              angle={-90} 
              position="insideLeft"
              style={{ fontSize: 14, fontWeight: 'bold', fill: '#374151' }}
            />
          </YAxis>
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* Lignes de référence pointillées tous les 1000€ */}
          {[1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000].map(value => (
            <ReferenceLine
              key={value}
              y={value}
              stroke="#d1d5db"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          ))}
          
          {/* Ligne de référence pour le salaire moyen */}
          <ReferenceLine
            y={salaireMensMoyBrut2025}
            stroke="#6b7280"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{ value: `Salaire moyen brut (${formatNum(salaireMensMoyBrut2025, 0, "€")} en 2025)`, position: 'insideBottomRight', fill: '#6b7280', fontSize: 12 }}
          />
          
          {/* Ligne de référence pour le salaire de référence */}
          <ReferenceLine
            y={salaireRef}
            stroke="#3b82f6"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{ value: `Salaire de référence brut (${formatNum(salaireRef, 0, "€")})`, position: 'insideBottomRight', fill: '#3b82f6', fontSize: 12 }}
          />
          
          {/* Ligne de cotisation (sans remplissage) */}
          {/* <Line
            type="monotone"
            dataKey="cotisation"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          /> */}
          <Area
            type="monotone"
            dataKey="cotisation"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorCotisation)"
            fillOpacity={1}
            dot={false}
            connectNulls={false}
          />
          
          {/* Aires empilées pour les pensions avec différentes couleurs */}
          <Area
            type="monotone"
            dataKey="pensionCotise"
            stackId="pension"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#colorPensionCotise)"
            fillOpacity={1}
            dot={false}
            connectNulls={false}
          />
          
          <Area
            type="monotone"
            dataKey="pensionFinance"
            stackId="pension"
            stroke="#a855f7"
            strokeWidth={2}
            fill="url(#colorPensionFinance)"
            fillOpacity={1}
            dot={false}
            connectNulls={false}
          />
          
          <Area
            type="monotone"
            dataKey="pensionPonctionne"
            stackId="pension"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#colorPensionPonctionne)"
            fillOpacity={1}
            dot={false}
            connectNulls={false}
          />
          
          {/* Ligne bleue du salaire avec points rouges pour les événements */}
          <Line
            type="monotone"
            dataKey="salaire"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={<CustomDot />}
            connectNulls={false}
          />
          
          {/* Ligne grise du salaire net  */}
          <Line
            type="monotone"
            dataKey="net"
            stroke="#999999"
            strokeWidth={1}
            dot={false}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Légende */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-blue-500"></div>
          <span className="text-gray-700">Salaire brut</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gray-400"></div>
          <span className="text-gray-700">Revenu net</span>
        </div>
        {/* <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-green-500"></div>
          <span className="text-gray-700">Cotisation</span>
        </div> */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-3 bg-gradient-to-b from-blue-500/70 to-green-500/20"></div>
          <span className="text-gray-700">Cotisations payées</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-3 bg-gradient-to-b from-green-500/70 to-green-500/20"></div>
          <span className="text-gray-700">Pension cotisée</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-3 bg-gradient-to-b from-purple-500/70 to-purple-500/20"></div>
          <span className="text-gray-700">Pension financée</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-3 bg-gradient-to-b from-red-500/70 to-red-500/20"></div>
          <span className="text-gray-700">Pension ponctionnée</span>
        </div>
        {/* <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 border-t-2 border-dashed border-gray-500"></div>
          <span className="text-gray-700">Salaire moyen</span>
        </div> */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
          <span className="text-gray-700">Événement</span>
        </div>
      </div>

<p className="px-6 py-4 text-gray-700 text-sm mt-1 italic">
  (*) Les <span className="text-blue-600 font-semibold">"Cotisations payées"</span> (<span className="underline decoration-blue-600 decoration-2">{formatNum(totaux.cotisation * salaireMensMoyBrut2025, 0, "€")}</span> = {formatNum(totaux.cotise, 0, "salaires moyens")}) représentent l'ensemble des cotisations retraite réellement versées durant la carrière. 
  La <span className="text-green-600 font-semibold">"Pension cotisée"</span> (<span className="underline decoration-green-600 decoration-2">{formatNum(totaux.cotisation * salaireMensMoyBrut2025, 0, "€")}</span> = {formatNum(totaux.cotisation, 0, "salaires moyens")}) correspond à la part de la pension directement financée par ces cotisations personnelles. 
  La <span className="text-purple-600 font-semibold">"Pension financée"</span> (<span className="underline decoration-purple-600 decoration-2">{formatNum(totaux.finance * salaireMensMoyBrut2025, 0, "€")}</span> = {formatNum(totaux.finance, 0, "salaires moyens")}) est l'apport du système par répartition grâce à la croissance démographique et économique. 
  La <span className="text-red-600 font-semibold">"Pension ponctionnée"</span> (<span className="underline decoration-red-600 decoration-2">{formatNum(totaux.ponctionne * salaireMensMoyBrut2025, 0, "€")}</span> = {formatNum(totaux.ponctionne, 0, "salaires moyens")}) mesure l'effort de solidarité fourni par la génération active pour couvrir la part non autofinancée de la pension. 
  <br/>Le total des pensions perçues s'élève à <span className="underline decoration-gray-600 decoration-2">{formatNum(totaux.pension * salaireMensMoyBrut2025, 0, "€")}</span> = {formatNum(totaux.pension, 0, "salaires moyens")}.
  <br /><br />
  Tous les montants sont exprimés en <strong>euros 2025 indexés sur le salaire moyen</strong>. Chaque cotisation et pension est d'abord calculée en proportion du salaire moyen de son année, puis convertie en euros 2025 via le salaire moyen brut de référence ({formatNum(salaireMensMoyBrut2025, 0, "€")}/mois). Cette méthode permet de mesurer l'effort contributif relatif à chaque époque, indépendamment de l'inflation et de la croissance économique.
</p>
    </div>
  );
};
export default ProfilChart;