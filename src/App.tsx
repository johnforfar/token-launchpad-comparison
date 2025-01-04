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
<Card>
  <CardHeader>
    <CardTitle>Protocol Comparison Analysis</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Protocol Evolution Overview</h3>
      <p className="text-gray-600">
        The DeFi ecosystem has seen rapid evolution in liquidity provision mechanisms. This analysis examines three distinct approaches on Solana: Pump.fun's bonding curve model, M3M3's competitive staking, and Gobbler/F8M3's virtual liquidity system.
      </p>

      <h3 className="text-lg font-semibold mt-6">Protocol Mechanics</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-fuchsia-600">Pump.fun Protocol</h4>
          <pre className="bg-gray-50 p-4 rounded-md mt-2 text-sm">
            {`// Core Price Formula
price = f(marketCap, time)

// Protocol Parameters
- Total Supply: 1B tokens fixed
- MC Milestones: $69k, $420k
- Creation Fee: 0.02 SOL
- Completion Reward: 0.5 SOL
- Auto LP Injection at Milestones`}
          </pre>
          <p className="mt-2 text-sm text-gray-600">Analysis: Bonding curve for price discovery with automated liquidity provision at market cap thresholds.</p>
        </div>

        <div>
          <h4 className="font-semibold text-pink-600">M3M3 Protocol</h4>
          <pre className="bg-gray-50 p-4 rounded-md mt-2 text-sm">
            {`// Staking Rewards
Base_APY = 0.35 (35%)
Staking_multiplier = min(1 + (time_held * 0.15), 3)

Total_rewards = initial_stake * (base_APY * staking_multiplier) * (time_held / 20)
SOL_rewards = Total_rewards * 0.3
Token_rewards = Total_rewards * 0.7

// Only top ranked stakers earn rewards`}
          </pre>
          <p className="mt-2 text-sm text-gray-600">Analysis: Pure staking model with competitive leaderboard and dual-token incentives (SOL + memetoken).</p>
        </div>

        <div>
          <h4 className="font-semibold text-indigo-600">Gobbler Protocol (F8M3)</h4>
          <pre className="bg-gray-50 p-4 rounded-md mt-2 text-sm">
            {`// Primary CFMM Formula
x * y = k^2

// Virtual Liquidity Curve 
k^2 * k'^2 = virtual_α

// Virtual LP Effect
L(t_early) > L(t_late) for equal inputs
fee allocation f(t) ∝ L(t)`}
          </pre>
          <p className="mt-2 text-sm text-gray-600">Analysis: Constant function market maker with virtual liquidity multipliers and flat-rate fees.</p>
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-6">Comparative Analysis</h3>
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pump.fun</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">M3M3</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gobbler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-4 py-4 text-sm font-medium text-gray-900">Early Stage</td>
              <td className="px-4 py-4 text-sm text-gray-500">Uses bonding curve price discovery until $69k MC</td>
              <td className="px-4 py-4 text-sm text-gray-500">Competition for top staker positions begins</td>
              <td className="px-4 py-4 text-sm text-gray-500">Virtual liquidity enhances early LP returns</td>
            </tr>
            <tr>
              <td className="px-4 py-4 text-sm font-medium text-gray-900">Mid Stage</td>
              <td className="px-4 py-4 text-sm text-gray-500">Auto-injects Raydium LP with locked liquidity</td>
              <td className="px-4 py-4 text-sm text-gray-500">Staking rewards compound with time multiplier</td>
              <td className="px-4 py-4 text-sm text-gray-500">k' factor adjusts with virtual alpha constant</td>
            </tr>
            <tr>
              <td className="px-4 py-4 text-sm font-medium text-gray-900">Mechanics</td>
              <td className="px-4 py-4 text-sm text-gray-500">Constant product with virtual reserves</td>
              <td className="px-4 py-4 text-sm text-gray-500">Top-N competitive staking with 35% base APY</td>
              <td className="px-4 py-4 text-sm text-gray-500">CFMM with k^2 * k'^2 = α relationship</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-lg font-semibold mt-6">Market Fit Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold text-fuchsia-600">Pump.fun</h4>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>Initial Price Discovery</li>  
            <li>Automated LP Injection</li>
            <li>Fixed Supply (1B tokens)</li>
          </ul>
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold text-pink-600">M3M3</h4>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>No Impermanent Loss</li>
            <li>Dual SOL/Token Rewards</li>
            <li>Competitive Leaderboard</li>
          </ul>
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold text-indigo-600">Gobbler</h4>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>Virtual LP System</li>
            <li>Flat Rate Fees</li>
            <li>AMM Trading Model</li>
          </ul>
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-6">Conclusion</h3>
      <p className="text-gray-600">
        Each protocol serves distinct market needs: Pump.fun provides automated price discovery and liquidity provision, M3M3 offers competitive staking with dual rewards, and Gobbler introduces virtual liquidity with flat-rate fees. Their success depends on market conditions and user behavior patterns.
      </p>
    </div>
  </CardContent>
</Card>
</div>
</div>
);
};

export default App;