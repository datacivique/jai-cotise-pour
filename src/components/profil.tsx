import React, { useMemo } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import type { ProfilType } from './types';


interface ProfilChartProps {
  profilType: ProfilType;
}

const ProfilChart: React.FC<ProfilChartProps> = ({ profilType }) => {
  const { chartData } = useMemo(() => {
    const salaires = profilType.salaires;
    if (!salaires || salaires.length === 0) {
      return { chartData: [], salaireMoyen: 1 };
    }

    // Calculer le salaire moyen (en unités relatives, normalisé autour de 1)
    const salaireEntries = salaires.filter(s => s.salaire && s.salaire > 0);
    const salaireMoyen = salaireEntries.length > 0
      ? salaireEntries.reduce((sum, s) => sum + (s.salaire || 0), 0) / salaireEntries.length
      : 1;

    // Transformer les données
    const chartData = salaires.map(s => {
      let pensionType = '';
      if (s.pension) {
        if (s.cotise && s.cotise > 0) {
          pensionType = 'cotisé';
        } else if (s.finance && s.finance > 0) {
          pensionType = 'financé';
        } else {
          pensionType = 'ponctionné';
        }
      }

      return {
        annee: s.annee,
        salaire: s.salaire || null,
        cotisation: s.cotisation || null,
        pension: s.pension || null,
        pensionCotise: (s.pension && s.cotise && s.cotise > 0) ? s.pension : null,
        pensionFinance: (s.pension && s.finance && s.finance > 0) ? s.pension : null,
        pensionPonctionne: (s.pension && s.ponctionne && s.ponctionne > 0) ? s.pension : null,
        // pensionPonctionne: (s.pension && (!s.finance || s.finance === 0) && (!s.cotise || s.cotise === 0)) ? s.pension : null,
        pensionType,
        event: s.commentaire || '',
        hasEvent: !!s.commentaire
      };
    });

    return { chartData, salaireMoyen };
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
              <p className="text-blue-600">Salaire: {data.salaire.toFixed(2)}</p>
              <p className="text-green-600">Cotisation: {data.cotisation?.toFixed(4) || '0'}</p>
            </>
          )}
          {data.pension && (
            <>
              <p className="text-red-600">Pension: {data.pension.toFixed(2)}</p>
              {data.pensionType === 'cotisé' && (
                <p className="text-green-600 font-semibold mt-1">Type: Cotisé</p>
              )}
              {data.pensionType === 'financé' && (
                <p className="text-purple-600 font-semibold mt-1">Type: Financé</p>
              )}
              {data.pensionType === 'ponctionné' && (
                <p className="text-red-600 font-semibold mt-1">Type: Ponctionné</p>
              )}
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
          {payload.annee}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full h-full p-6 bg-white">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Évolution du Profil de Carrière</h2>
        <p className="text-gray-600 text-sm mt-1">Salaires, cotisations et pensions au fil des années</p>
      </div>
      
      <ResponsiveContainer width="100%" height={500}>
        <ComposedChart
          data={chartData}
          margin={{ top: 30, right: 30, left: 20, bottom: 50 }}
        >
          <defs>
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
              value="Année" 
              position="insideBottom" 
              offset={-15}
              style={{ fontSize: 14, fontWeight: 'bold', fill: '#374151' }}
            />
          </XAxis>
          
          <YAxis 
            domain={[0, 2]}
            ticks={[0, 0.5, 1, 1.5, 2]}
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#9ca3af' }}
          >
            <Label 
              value="Salaire moyen" 
              angle={-90} 
              position="insideLeft"
              style={{ fontSize: 14, fontWeight: 'bold', fill: '#374151' }}
            />
          </YAxis>
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* Ligne de référence pour le salaire moyen à y=1 */}
          <ReferenceLine
            y={1}
            stroke="#6b7280"
            strokeDasharray="5 5"
            strokeWidth={2}
          />
          
          {/* Ligne de cotisation (sans remplissage) */}
          <Line
            type="monotone"
            dataKey="cotisation"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
          
          {/* Aires empilées pour les pensions avec différentes couleurs */}
          <Area
            type="monotone"
            dataKey="pensionCotise"
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
        </ComposedChart>
      </ResponsiveContainer>

      {/* Légende */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-blue-500"></div>
          <span className="text-gray-700">Salaire</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-green-500"></div>
          <span className="text-gray-700">Cotisation</span>
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
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 border-t-2 border-dashed border-gray-500"></div>
          <span className="text-gray-700">Salaire moyen</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
          <span className="text-gray-700">Événement important</span>
        </div>
      </div>
    </div>
  );
};
export default ProfilChart;