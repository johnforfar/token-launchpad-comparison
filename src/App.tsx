// ./src/App.tsx

import React from 'react';
import './App.css';
import ProtocolChart from './components/ProtocolChart';

const App: React.FC = () => {
  return (
    <div className="App">
      <ProtocolChart analysisMarkdown={""} />
      <div className="analysis-section">
        <h2>Token Launchpad Comparison Analysis</h2>
        <h3>Protocol Evolution Overview</h3>
        <p>
          The DeFi ecosystem has seen rapid evolution in liquidity provision mechanisms, from traditional AMMs to sophisticated staking models. This analysis examines four distinct approaches: Gobbler, Snapper, M3M3, Pump.fun and introduces Ripper as a hypothetical hybrid solution.
        </p>
        <h3>Protocol Mechanics</h3>
        
        <h4>Gobbler Protocol</h4>
        <p><strong>Mathematical Model:</strong></p>
        <pre>
          {`LP_tokens = initial_deposit * early_multiplier
where early_multiplier = max(2 - (entry_time / 5), 1)

Accumulated_fees = LP_tokens * time_held * fee_rate
where fee_rate = 0.015 (1.5%)

Total_value = LP_tokens + Accumulated_fees`}
        </pre>
        <p>Analysis: Focuses on early liquidity incentives, effective for meme markets but potentially discouraging for late entrants due to reduced potential returns.</p>
        <p className="text-sm">NOTE: Open source code access required to fully understand the protocol. This is a simplified model based off information available in the public domain.</p>

        <h4>Snapper Protocol</h4>
        <p><strong>Mathematical Model:</strong></p>
        <pre>
          {`LP_tokens = initial_deposit  // Constant distribution

Fee_multiplier = sqrt(1 + time_held * 0.3)
Accumulated_fees = LP_tokens * time_held * base_fee_rate * fee_multiplier
where base_fee_rate = 0.01 (1%)

Total_value = LP_tokens + Accumulated_fees`}
        </pre>
        <p>Analysis: Offers a balanced approach with a focus on sustainable, long-term fee rewards, reducing entry barriers while incentivizing holding.</p>
        <p className="text-sm">NOTE: Open source code access required to fully understand the protocol. This is a simplified model based off information available in the public domain.</p>

        <h4>M3M3 Protocol</h4>
        <p><strong>Mathematical Model:</strong></p>
        <pre>
          {`Base_APY = 0.35 (35%)
Staking_multiplier = min(1 + (time_held * 0.15), 3)

Total_rewards = initial_stake * (base_APY * staking_multiplier) * (time_held / 20)
SOL_rewards = Total_rewards * 0.3
Token_rewards = Total_rewards * 0.7

Total_value = initial_stake + SOL_rewards + Token_rewards`}
        </pre>
        <p>Analysis: A pure staking model with aggressive reward multipliers for top stakers, no impermanent loss, and dual-reward structures for immediate and long-term value.</p>

        <h4>Pump.fun Protocol</h4>
        <p><strong>Mathematical Model:</strong></p>
        <pre>
          {`// Simplified Bonding Curve Model for Pump.fun:
Price = Price_0 * (1 + (t * growth_rate)) // for t < 5
where:
  Price_0 is the initial price,
  growth_rate is an assumed rate of price increase, e.g., 0.2 for 20% per period

// After stabilization (5 < t < 10)
Price = Price_Stable // where Price_Stable could be around 2 * Price_0 for a 100% increase

// After potential market cap hit (t >= 10)
Price = max(Price_Stable * decay_rate^(t-10), Price_0 * 0.1)
where:
  decay_rate might be something like 0.9 or less for gradual decrease`}
        </pre>
        <p>Analysis: Pump.fun uses a bonding curve to dynamically adjust token price based on supply. Initially, prices surge due to speculative buying, but they stabilize once tokens hit specific market cap thresholds (like $69,000 on Solana). Post-stabilization, the price might decrease if interest wanes or remain stable if the token gains a solid community or utility.</p>

        <h4>Ripper Protocol (Hypothetical Hybrid Model)</h4>
        <p><strong>Mathematical Model:</strong></p>
        <pre>
          {`// AMM Component
LP_tokens = initial_deposit + early_bonus
where early_bonus = initial_deposit * 0.5 * (4 - entry_time) / 4  // Only for first 48 hours

Base_rate = 0.01 * (1 + time * 0.05)  // Growing base rate
AMM_fees = LP_tokens * time_held * base_rate * sqrt(time_held + k_factor)
where k_factor = 2 for early entry, 1 otherwise

// Staking Component
Staking_multiplier = min(1 + (time_held * 0.15), 2.5)
Staking_rewards = LP_tokens * base_staking_APY * staking_multiplier * (time_held / 20)
where base_staking_APY = 0.25 (25%)

Total_value = LP_tokens + AMM_fees + Staking_rewards`}
        </pre>
        <p>Analysis: Combines AMM liquidity provision with staking rewards, offering both early incentives and long-term holding benefits, potentially leading the market in adaptability and user engagement.</p>

        <h3>Comparative Analysis and Market Fit</h3>
        <div className="mb-8">
          <div className="overflow-x-auto">
            <table className="w-full max-w-[100vw] divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gobbler
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Snapper
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    M3M3
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pump.fun
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ripper (Hypothetical)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-3 py-6 whitespace-normal text-sm font-medium text-gray-900">
                    <strong>Early Stage (0-5 periods)</strong>
                  </td>
                  <td className="px-3 py-6 whitespace-normal text-sm text-gray-500">Leads with early incentives, ideal for meme market hype</td>
                  <td className="px-3 py-6 whitespace-normal text-sm text-gray-500">Gaining momentum, suitable for balanced liquidity</td>
                  <td className="px-3 py-6 whitespace-normal text-sm text-gray-500">Gaining momentum with aggressive staking rewards</td>
                  <td className="px-3 py-6 whitespace-normal text-sm text-gray-500">High initial price surge, ideal for meme markets due to bonding curve</td>
                  <td className="px-3 py-6 whitespace-normal text-sm text-gray-500">Competitive through dual mechanisms, versatile for various market conditions</td>
                </tr>
                <tr>
                  <td className="px-3 py-6 whitespace-normal text-sm font-medium text-gray-900">
                    <strong>Mid Stage (5-10 periods)</strong>
                  </td>
                  <td className="px-3 py-6 whitespace-normal text-sm text-gray-500">Initial edge wanes, less appealing for late joiners</td>
                  <td className="px-3 py-6 whitespace-normal text-sm text-gray-500">Provides steady growth, appealing for stable pair trading</td>
                  <td className="px-3 py-6 whitespace-normal text-sm text-gray-500">Rewards compound significantly, strong for long-term staking</td>
                  <td className="px-3 py-6 whitespace-normal text-sm text-gray-500">Price stabilizes, potential for sustained interest if community builds</td>
                  <td className="px-3 py-6 whitespace-normal text-sm text-gray-500">Could excel with hybrid approach, offering both growth and stability</td>
                </tr>
                <tr>
                  <td className="px-3 py-6 whitespace-normal text-sm font-medium text-gray-900">
                    <strong>Late Stage (10+ periods)</strong>
                  </td>
                  <td className="px-3 py-6 whitespace-normal text-sm text-gray-500">Early advantage fades, not optimal for long-term holding</td>
                  <td className="px-3 py-6 whitespace-normal text-sm text-gray-500">Offers reliable returns, good for stable, long-term liquidity</td>
                  <td className="px-3 py-6 whitespace-normal text-sm text-gray-500">Dominates with compound benefits, excellent for long-term value</td>
                  <td className="px-3 py-6 whitespace-normal text-sm text-gray-500">Price might decline if hype fades, or maintain if utility is established</td>
                  <td className="px-3 py-6 whitespace-normal text-sm text-gray-500">Potentially dominates with compound benefits, versatile for long-term strategies</td>
                </tr>
                <tr>
                  <td className="px-3 py-6 whitespace-normal text-sm font-medium text-gray-900">
                    <strong>Market Fit</strong>
                  </td>
                  <td className="px-3 py-6 whitespace-normal text-sm text-gray-500">
                    <ul className="list-disc pl-5">
                      <li>Meme Markets: High</li>
                      <li>Stable Pairs: Low</li>
                      <li>Long-term Holdings: Low</li>
                    </ul>
                  </td>
                  <td className="px-3 py-6 whitespace-normal text-sm text-gray-500">
                    <ul className="list-disc pl-5">
                      <li>Meme Markets: Medium</li>
                      <li>Stable Pairs: High</li>
                      <li>Long-term Holdings: Medium</li>
                    </ul>
                  </td>
                  <td className="px-3 py-6 whitespace-normal text-sm text-gray-500">
                    <ul className="list-disc pl-5">
                      <li>Meme Markets: Medium</li>
                      <li>Stable Pairs: Medium</li>
                      <li>Long-term Holdings: High</li>
                    </ul>
                  </td>
                  <td className="px-3 py-6 whitespace-normal text-sm text-gray-500">
                    <ul className="list-disc pl-5">
                      <li>Meme Markets: High</li>
                      <li>Stable Pairs: Low</li>
                      <li>Long-term Holdings: Low</li>
                    </ul>
                  </td>
                  <td className="px-3 py-6 whitespace-normal text-sm text-gray-500">
                    <ul className="list-disc pl-5">
                      <li>Meme Markets: Medium</li>
                      <li>Stable Pairs: Medium</li>
                      <li>Long-term Holdings: Medium</li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-gray-700">
            Market Fit Analysis: The suitability of each protocol for different market types is determined based on their mechanics. Gobbler and Pump.fun focus on early incentives, making them ideal for volatile, speculative markets like meme coins. Snapper's balanced approach aligns well with stable pairs. M3M3's aggressive staking rewards cater to long-term holding strategies. Ripper's hybrid model theoretically offers adaptability across market conditions, though its effectiveness would depend on real-world implementation and user adoption.
          </p>
        </div>

        <h3>Future Implications</h3>
        <p>Hybrid models like Ripper suggest a trend towards multi-mechanism protocols for balanced risk/reward. Market dynamics will likely see improved capital efficiency, reduced manipulation, and sustained growth.</p>

        <h3>Conclusion</h3>
        <p>Ripper's hybrid approach signifies a pivotal evolution in DeFi, merging AMM and staking for enhanced user economics and market stability. Future protocols might focus on dynamic adjustments, cross-integrations, and further reward optimization.</p>
      </div>
    </div>
  );
};

export default App;