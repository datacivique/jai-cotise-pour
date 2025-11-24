import React, { useState } from 'react';
import type { SimulationParams } from './types';

const ParametersPanel: React.FC<{
  params: SimulationParams;
  onParamsChange: (params: Partial<SimulationParams>) => void;
}> = ({ params, onParamsChange }) => {
  const [showDetailedParams, setShowDetailedParams] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Paramètres de simulation</h2>
          <button
            onClick={() => setShowDetailedParams(!showDetailedParams)}
            className="text-sm font-normal text-blue-600 hover:text-blue-800 transition-colors"
          >
            {showDetailedParams ? '∧ Masquer les détails' : '+ Paramétrage détaillé'}
          </button>
        </div>
      </div>
      <div className="px-6 py-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Année de naissance de la cohorte: {params.birthYear}
            </label>
            <input
              type="range"
              min="1945"
              max="2022"
              value={params.birthYear}
              onChange={(e) => onParamsChange({ birthYear: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
            />
          </div>

          {showDetailedParams && (
            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200" style={{marginBottom: 25}}>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium mb-2 text-gray-700 underline">Projection : hypothèses d'inflation et de croissance</label>
                      <label className="text-sm mb-2 text-gray-700" style={{marginLeft: "6px"}}>(au delà des données disponibles 2023)</label>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                        Inflation : {params.ProjectionInflation}% par an
                        </label>
                        <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="50"
                        value={params.ProjectionInflation} 
                        onChange={(e) => onParamsChange({ ProjectionInflation: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                        Croissance masse salariale : {params.ProjectionMasseSalarialeGrowth}% par an
                        </label>
                        <input
                        type="number"
                        step="0.1"
                        min="-5"
                        max="15"
                        value={params.ProjectionMasseSalarialeGrowth}
                        onChange={(e) => onParamsChange({ ProjectionMasseSalarialeGrowth: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                        Croissance du salaire moyen : {params.ProjectionSalMoyGrowth}% par an
                        </label>
                        <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="15"
                        value={params.ProjectionSalMoyGrowth} 
                        onChange={(e) => onParamsChange({ ProjectionSalMoyGrowth: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                        Croissance de l'espérance de vie : {params.ProjectionLifeExpectancyGrowth} mois par an
                        </label>
                        <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="6"
                        value={params.ProjectionLifeExpectancyGrowth}
                        onChange={(e) => onParamsChange({ ProjectionLifeExpectancyGrowth: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div className="md:col-span-2 flex items-center">
                        <label className="text-sm font-medium mb-2 text-gray-700 underline">Simulation : ajustement des paramètres de retraite</label>
                      <label className="text-sm mb-2 text-gray-700" style={{marginLeft: "6px"}}>(sur la période de vie)</label>
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 cursor-pointer" style={{marginLeft: "12px", marginBottom: "8px"}}>
                        <input
                          type="checkbox"
                          checked={params.keepParams}
                          onChange={(e) => onParamsChange({ keepParams: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span>Conserver les paramètres</span>
                      </label>
                    </div>
                {/* <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                    Croissance de la masse salariale: {params.masseSalarialeGrowth}% par an
                    </label>
                    <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={params.masseSalarialeGrowth}
                    onChange={(e) => onParamsChange({ masseSalarialeGrowth: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div> */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Bonus/Malus d'indexation sur inflation : {params.indexationInflation?.toFixed(2) ?? "0.00"}%
                        </label>
                        <input
                        type="number"
                        step="0.1"
                        min="-5"
                        max="5"
                        value={Number(params.indexationInflation?.toFixed(2)) || 0}
                        onChange={(e) => onParamsChange({ indexationInflation: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                        Âge de départ à la retraite: {params.retirementAge} ans
                        </label>
                        <input
                        type="number"
                        min="55"
                        max="70"
                        value={params.retirementAge}
                        onChange={(e) => onParamsChange({ retirementAge: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                        Durée de cotisation: {params.cotisationDuration} trimestres <i>({params.cotisationDuration/4} ans)</i>
                        </label>
                        <input
                        type="number"
                        step="1"
                        min="150"
                        max="200"
                        value={params.cotisationDuration}
                        onChange={(e) => onParamsChange({ cotisationDuration: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                        Espérance de vie: {params.lifeExpectancy} ans
                        </label>
                        <input disabled
                        type="number"
                        min="70"
                        max="95"
                        value={params.lifeExpectancy}
                        onChange={(e) => onParamsChange({ lifeExpectancy: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParametersPanel;