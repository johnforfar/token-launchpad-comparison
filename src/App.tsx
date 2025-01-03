// ./src/App.tsx

import React from 'react';
import ProtocolChart from './components/ProtocolChart';
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

interface MarketScenario {
  name: string;
  description: string;
  marketCapTarget: number;
  volatility: number;
  stakingAPY: number;
}

const defaultScenarios: MarketScenario[] = [
  {
    name: "Steady Growth",
    description: "Gradual increase in market cap with low volatility",
    marketCapTarget: 1000000,
    volatility: 0.2,
    stakingAPY: 0.25
  },
  {
    name: "Meme Pump",
    description: "Rapid price increase followed by stabilization",
    marketCapTarget: 69000000,
    volatility: 0.8,
    stakingAPY: 0.35
  },
  {
    name: "Bear Market",
    description: "Declining market with higher rewards",
    marketCapTarget: 500000,
    volatility: 0.4,
    stakingAPY: 0.45
  }
];

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <Card>
          <CardHeader>
            <CardTitle>DeFi Protocol Comparison & Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Compare mechanics and performance across Pump.fun, M3M3 by Meteora, and Gobbler by FOMO3D protocols.
              Analyze returns, risks, and liquidity dynamics in different market scenarios.
            </p>

            <p className="text-gray-600 text-sm italic">
              NOTE: This dashboard is currently under development. The values presented are estimations based on available data and may not reflect actual performance. Users are advised to verify any critical information independently. The developers are not liable for any decisions made based on the information provided herein. Please check back for updates as the dashboard evolves.
            </p>
          </CardContent>
        </Card>

        {/* Main Protocol Chart */}
        <ProtocolChart analysisMarkdown={""} />

        {/* Educational Section */}
        <Card>
          <CardHeader>
            <CardTitle>Protocol Insights & Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="philosophy">
              <TabsList>
                <TabsTrigger value="philosophy">Protocol Philosophy</TabsTrigger>
                <TabsTrigger value="mechanics">Core Mechanics</TabsTrigger>
              </TabsList>

              <TabsContent value="philosophy">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <h4 className="font-semibold text-fuchsia-600 mb-2">Pump.fun Philosophy</h4>
                    <p className="text-sm text-gray-600">
                      Leverages market psychology through bonding curves and MC milestones,
                      creating natural price discovery mechanisms.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-pink-600 mb-2">M3M3 Philosophy</h4>
                    <p className="text-sm text-gray-600">
                      Focuses on sustainable staking rewards through dual-token incentives,
                      promoting long-term holding and reduced volatility.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-indigo-600 mb-2">Gobbler Philosophy</h4>
                    <p className="text-sm text-gray-600">
                      Combines AMM efficiency with game theory incentives, rewarding early
                      liquidity while maintaining long-term sustainability.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="mechanics">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <h4 className="font-semibold text-fuchsia-600 mb-2">Pump.fun Mechanics</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-600">
                      <li>Uses a bonding curve to control price</li>
                      <li>Has MC milestone targets ($69k, $420k)</li>
                      <li>Early LP incentives through curve pricing</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-pink-600 mb-2">M3M3 Mechanics</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-600">
                      <li>Pure staking model</li>
                      <li>Dual rewards (SOL + Token)</li>
                      <li>No impermanent loss</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-indigo-600 mb-2">Gobbler Mechanics</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-600">
                      <li>Hybrid AMM mechanics</li>
                      <li>Virtual liquidity system</li>
                      <li>Dynamic fee structure</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>

        {/* Market Scenarios */}
        <Card>
          <CardHeader>
            <CardTitle>Predefined Market Scenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {defaultScenarios.map((scenario) => (
                <div 
                  key={scenario.name}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold">{scenario.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>Target MC: ${scenario.marketCapTarget.toLocaleString()}</p>
                    <p>Volatility: {(scenario.volatility * 100).toFixed(0)}%</p>
                    <p>Staking APY: {(scenario.stakingAPY * 100).toFixed(0)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default App;