// ./src/components/ProtocolChart.tsx

import React, { useState, useEffect, useMemo } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "./../components/ui/card";
import { Input } from "./../components/ui/input";
import { Label } from "./../components/ui/label";
import { Slider } from "./../components/ui/slider";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "./../components/ui/tabs";
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { debounce } from 'lodash';

interface ProtocolData {
    time: number;
    // M3M3 metrics
    m3m3Total: number;
    m3m3Sol: number;
    m3m3Token: number;
    m3m3APY: number;
    // Pump.fun metrics
    pumpFunTotal: number;
    pumpFunPrice: number;
    pumpFunLiquidity: number;
    // Gobbler metrics
    gobblerTotal: number;
    gobblerLiquidity: number;
    gobblerVirtualLiquidity: number;
    gobblerFees: number;
}

interface InvestmentParams {
    feeDistribution: {
        lp: number;
        staking: number;
        protocol: number;
    };
    baseStakingAPY: number;
    earlyLPBonus: number;
    returnTimeframe: number;
}

interface BondingParams {
    lpTokenRatio: number;
    initialMCTarget: number;
    bondingMCTarget: number;
    poolThickness: number;
    curveType: 'standard' | 'quadratic';
}

interface RewardParams {
    solTokenRatio: number;
    compoundPeriod: number;
    lockDurationMultiplier: number;
    showCombinedRewards: boolean;
}

interface ProtocolChartProps {
    analysisMarkdown: string;
}

// Custom tooltip component for the charts
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border rounded shadow-lg">
                <p className="text-sm font-medium">Time: T+{label}</p>
                {payload.map((pld: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: pld.color }}>
                        {pld.name}: {pld.value.toFixed(2)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Colors for consistent protocol representation
const PROTOCOL_COLORS = {
    pumpFun: "#ff00ff",
    m3m3: "#ec4899",
    gobbler: "#6366f1"
};

// Calculation functions
const calculateCompoundedReturns = (
    principal: number,
    apy: number,
    periods: number
): number => {
    return principal * Math.pow(1 + apy / periods, periods);
};

const calculateMarketCapImpact = (
    initialMC: number,
    targetMC: number,
    currentTime: number,
    maxTime: number
): number => {
    if (currentTime <= maxTime / 3) {
        // Initial growth phase
        return initialMC * Math.pow(1.5, currentTime);
    } else if (currentTime <= maxTime * 2/3) {
        // Stabilization phase
        return targetMC * (1 + Math.log(currentTime / maxTime));
    } else {
        // Mature phase
        return Math.max(
            targetMC * Math.pow(0.95, currentTime - (maxTime * 2/3)),
            initialMC
        );
    }
};

const calculateM3M3Returns = (
    initialDeposit: number,
    entryTime: number,
    currentTime: number,
    isTopStaker: boolean,
    rewardParams: RewardParams
): { total: number; sol: number; token: number; apy: number } => {
    const timeHeld = Math.max(0, currentTime - entryTime);
    
    if (!isTopStaker) {
        return { 
            total: initialDeposit,
            sol: 0,
            token: 0,
            apy: 0
        };
    }

    const baseAPY = 0.35;
    const stakingMultiplier = Math.min(1 + (timeHeld * 0.15), 3);
    const effectiveAPY = baseAPY * stakingMultiplier;
    
    const totalRewards = calculateCompoundedReturns(
        initialDeposit,
        effectiveAPY,
        rewardParams.compoundPeriod * timeHeld
    ) - initialDeposit;

    const solRewards = totalRewards * rewardParams.solTokenRatio;
    const tokenRewards = totalRewards * (1 - rewardParams.solTokenRatio);

    return {
        total: initialDeposit + totalRewards,
        sol: solRewards,
        token: tokenRewards,
        apy: effectiveAPY * 100
    };
};

const calculatePumpFunReturns = (
    initialDeposit: number,
    currentTime: number,
    bondingParams: BondingParams
): { total: number; price: number; liquidity: number } => {
    let price;
    if (currentTime < 5) {
        // Initial surge phase
        price = initialDeposit * (1 + currentTime * 0.2);
    } else if (currentTime < 10) {
        // Stabilization phase
        price = initialDeposit * 2;
    } else {
        // Mature phase
        price = initialDeposit * 2 * Math.pow(0.95, currentTime - 10);
    }

    const liquidity = price * bondingParams.lpTokenRatio;

    return {
        total: price,
        price: price,
        liquidity: liquidity
    };
};

const calculateGobblerReturns = (
    initialDeposit: number,
    entryTime: number,
    currentTime: number,
    investmentParams: InvestmentParams
): { total: number; liquidity: number; virtualLiquidity: number; fees: number } => {
    const timeHeld = Math.max(0, currentTime - entryTime);
    const virtualAlpha = 1000000; // Constant from protocol
    
    // Calculate virtual liquidity multiplier based on entry time
    const earlyBonus = Math.max(0, (5 - entryTime) * 0.1);
    const virtualMultiplier = 1 + earlyBonus;
    
    // Calculate effective liquidity
    const baseLiquidity = Math.sqrt(initialDeposit * initialDeposit);
    const virtualLiquidity = baseLiquidity * virtualMultiplier;
    
    // Calculate accumulated fees
    const baseRate = 0.01;
    const fees = virtualLiquidity * timeHeld * baseRate * (1 + timeHeld * 0.05);
    
    return {
        total: baseLiquidity + fees,
        liquidity: baseLiquidity,
        virtualLiquidity: virtualLiquidity,
        fees: fees
    };
};

const ProtocolChart: React.FC<ProtocolChartProps> = ({ analysisMarkdown }) => {
    // State management for parameters
    const [timeframe, setTimeframe] = useState<number>(10);
    const [initialDeposit, setInitialDeposit] = useState<number>(1000);
    const [isTopStaker, setIsTopStaker] = useState<boolean>(true);
    
    const [investmentParams, setInvestmentParams] = useState<InvestmentParams>({
        feeDistribution: { lp: 0.6, staking: 0.3, protocol: 0.1 },
        baseStakingAPY: 0.25,
        earlyLPBonus: 0.5,
        returnTimeframe: 20
    });
    
    const [bondingParams, setBondingParams] = useState<BondingParams>({
        lpTokenRatio: 0.2,
        initialMCTarget: 1000000,
        bondingMCTarget: 69000000,
        poolThickness: 0.2,
        curveType: 'standard'
    });
    
    const [rewardParams, setRewardParams] = useState<RewardParams>({
        solTokenRatio: 0.3,
        compoundPeriod: 1,
        lockDurationMultiplier: 1,
        showCombinedRewards: true
    });

    // Generate simulation data with debounced updates
    const generateSimulationData = useMemo(() => {
        const data: ProtocolData[] = [];
        const timePoints = Array.from(
            { length: timeframe * 2 + 1 },
            (_, i) => i / 2
        );

        for (const t of timePoints) {
            // M3M3 calculations
            const m3m3Returns = calculateM3M3Returns(
                initialDeposit,
                0,
                t,
                isTopStaker,
                rewardParams
            );

            // Pump.fun calculations
            const pumpFunReturns = calculatePumpFunReturns(
                initialDeposit,
                t,
                bondingParams
            );

            // Gobbler calculations
            const gobblerReturns = calculateGobblerReturns(
                initialDeposit,
                0,
                t,
                investmentParams
            );

            data.push({
                time: t,
                // M3M3 metrics
                m3m3Total: m3m3Returns.total,
                m3m3Sol: m3m3Returns.sol,
                m3m3Token: m3m3Returns.token,
                m3m3APY: m3m3Returns.apy,
                // Pump.fun metrics
                pumpFunTotal: pumpFunReturns.total,
                pumpFunPrice: pumpFunReturns.price,
                pumpFunLiquidity: pumpFunReturns.liquidity,
                // Gobbler metrics
                gobblerTotal: gobblerReturns.total,
                gobblerLiquidity: gobblerReturns.liquidity,
                gobblerVirtualLiquidity: gobblerReturns.virtualLiquidity,
                gobblerFees: gobblerReturns.fees
            });
        }

        return data;
    }, [
        timeframe,
        initialDeposit,
        isTopStaker,
        investmentParams,
        bondingParams,
        rewardParams
    ]);

    // Component return with UI elements
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Protocol Mechanics Analysis</CardTitle>
                <CardDescription>
                    Compare returns, liquidity, and mechanics across protocols
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Global Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Initial Deposit (USD)</Label>
                            <Input
                                type="number"
                                value={initialDeposit}
                                onChange={(e) => setInitialDeposit(Number(e.target.value))}
                                min={0}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Timeframe (days)</Label>
                            <Slider
                                value={[timeframe]}
                                onValueChange={([value]) => setTimeframe(value)}
                                min={1}
                                max={20}
                                step={1}
                            />
                            <span className="text-sm text-gray-500">T+{timeframe}</span>
                        </div>
                    </div>

                    {/* Main Content Tabs */}
                        {/* Returns Analysis Tab */}
                        <Tabs defaultValue="investors">
    <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="investors">For Token Investors</TabsTrigger>
        <TabsTrigger value="lp">For Liquidity Providers</TabsTrigger>
        <TabsTrigger value="platform">For Protocol Teams</TabsTrigger>
    </TabsList>

    {/* Token Investors View */}
    <TabsContent value="investors">
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-2">Choose Your Investment Path</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="p-3 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-700">Pump.fun</h4>
                        <p className="text-sm mt-1">Market Cap Based Growth</p>
                        <ul className="mt-2 text-sm space-y-1">
                            <li>• Initial price discovery phase</li>
                            <li>• $69k MC milestone system</li>
                            <li>• Community-driven growth</li>
                        </ul>
                    </div>
                    <div className="p-3 bg-pink-50 rounded-lg">
                        <h4 className="font-medium text-pink-700">M3M3 by Meteora</h4>
                        <p className="text-sm mt-1">Stake & Earn Two Ways</p>
                        <ul className="mt-2 text-sm space-y-1">
                            <li>• Earn SOL + Token rewards</li>
                            <li>• Up to 3x reward multiplier</li>
                            <li>• Protected from IL</li>
                        </ul>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg">
                        <h4 className="font-medium text-indigo-700">Gobbler by FOMO3D</h4>
                        <p className="text-sm mt-1">Game Theory + AMM</p>
                        <ul className="mt-2 text-sm space-y-1">
                            <li>• Early investor advantages</li>
                            <li>• Virtual liquidity boosters</li>
                            <li>• Competitive fee mechanics</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                        data={generateSimulationData}
                        margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="time"
                            label={{ 
                                value: 'Days Since Launch', 
                                position: 'insideBottom',
                                offset: -40
                            }}
                        />
                        <YAxis 
                            label={{ 
                                value: 'Value (USD)', 
                                angle: -90, 
                                position: 'insideLeft',
                                offset: -40
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                            verticalAlign="top"
                            height={36}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="pumpFunTotal"
                            name="Pump.fun Returns"
                            stroke={PROTOCOL_COLORS.pumpFun}
                            strokeWidth={2}
                        />
                        <Line
                            type="monotone"
                            dataKey="m3m3Total"
                            name="M3M3 Returns"
                            stroke={PROTOCOL_COLORS.m3m3}
                            strokeWidth={2}
                        />
                        <Line
                            type="monotone"
                            dataKey="gobblerTotal"
                            name="Gobbler Returns"
                            stroke={PROTOCOL_COLORS.gobbler}
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">Pump.fun Strategy</h4>
                    <div className="space-y-2 mt-2">
                        <Label>Choose Entry Point</Label>
                        <select
                            className="w-full p-2 border rounded"
                            value={timeframe}
                            onChange={(e) => setTimeframe(Number(e.target.value))}
                        >
                            <option value={1}>Early Launch (High Risk/Reward)</option>
                            <option value={5}>Mid Launch (Balanced)</option>
                            <option value={10}>Post MC Target (Stable)</option>
                        </select>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">M3M3 Strategy</h4>
                    <div className="space-y-2 mt-2">
                        <Label>SOL vs Token Split</Label>
                        <Slider
                            value={[rewardParams.solTokenRatio * 100]}
                            onValueChange={([value]) => setRewardParams({
                                ...rewardParams,
                                solTokenRatio: value / 100
                            })}
                            max={100}
                            step={1}
                        />
                        <p className="text-sm text-gray-500">
                            {(rewardParams.solTokenRatio * 100).toFixed(0)}% SOL
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">Gobbler Strategy</h4>
                    <div className="space-y-2 mt-2">
                        <Label>Initial Position</Label>
                        <select
                            className="w-full p-2 border rounded"
                            value={investmentParams.earlyLPBonus}
                            onChange={(e) => setInvestmentParams({
                                ...investmentParams,
                                earlyLPBonus: Number(e.target.value)
                            })}
                        >
                            <option value={0.5}>Early Investor (50% Bonus)</option>
                            <option value={0.25}>Mid Entry (25% Bonus)</option>
                            <option value={0}>Late Entry (No Bonus)</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </TabsContent>

    {/* Liquidity Providers View */}
    <TabsContent value="lp">
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-2">Compare LP Strategies</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="p-3 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-700">Pump.fun LP</h4>
                        <p className="text-sm mt-1">Bonding Curve Protection</p>
                        <ul className="mt-2 text-sm space-y-1">
                            <li>• Price stability at MC targets</li>
                            <li>• AMM fee generation</li>
                            <li>• Early LP bonuses</li>
                        </ul>
                    </div>
                    <div className="p-3 bg-pink-50 rounded-lg">
                        <h4 className="font-medium text-pink-700">M3M3 LP Model</h4>
                        <p className="text-sm mt-1">Pure Staking, No IL</p>
                        <ul className="mt-2 text-sm space-y-1">
                            <li>• 35% base APY</li>
                            <li>• No impermanent loss risk</li>
                            <li>• Compound rewards in SOL</li>
                        </ul>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg">
                        <h4 className="font-medium text-indigo-700">Gobbler LP</h4>
                        <p className="text-sm mt-1">Virtual Liquidity Boost</p>
                        <ul className="mt-2 text-sm space-y-1">
                            <li>• Enhanced fee returns</li>
                            <li>• Early LP multipliers</li>
                            <li>• AMM + IL protection</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                        data={generateSimulationData}
                        margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="time"
                            label={{ 
                                value: 'Protocol Age (days)', 
                                position: 'insideBottom',
                                offset: -40
                            }}
                        />
                        <YAxis 
                            label={{ 
                                value: 'Protocol Metrics', 
                                angle: -90, 
                                position: 'insideLeft',
                                offset: -40
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                            verticalAlign="top"
                            height={36}
                        />
                        <Line
                            type="monotone"
                            dataKey="pumpFunPrice"
                            name="Pump.fun Price"
                            stroke={PROTOCOL_COLORS.pumpFun}
                            strokeWidth={2}
                        />
                        <Line
                            type="monotone"
                            dataKey="m3m3APY"
                            name="M3M3 Effective APY"
                            stroke={PROTOCOL_COLORS.m3m3}
                            strokeWidth={2}
                        />
                        <Line
                            type="monotone"
                            dataKey="gobblerFees"
                            name="Gobbler Fee Revenue"
                            stroke={PROTOCOL_COLORS.gobbler}
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">Pump.fun LP Settings</h4>
                    <div className="space-y-2 mt-2">
                        <Label>Bonding Curve</Label>
                        <select
                            className="w-full p-2 border rounded"
                            value={bondingParams.curveType}
                            onChange={(e) => setBondingParams({
                                ...bondingParams,
                                curveType: e.target.value as 'standard' | 'quadratic'
                            })}
                        >
                            <option value="standard">Linear (x*y=k)</option>
                            <option value="quadratic">Quadratic (x²*y²=k)</option>
                        </select>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">M3M3 LP Settings</h4>
                    <div className="space-y-2 mt-2">
                        <Label>Staking Duration</Label>
                        <select
                            className="w-full p-2 border rounded"
                            value={rewardParams.lockDurationMultiplier}
                            onChange={(e) => setRewardParams({
                                ...rewardParams,
                                lockDurationMultiplier: Number(e.target.value)
                            })}
                        >
                            <option value={1}>No Lock (1x APY)</option>
                            <option value={2}>3 Month Lock (2x APY)</option>
                            <option value={3}>6 Month Lock (3x APY)</option>
                        </select>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">Gobbler LP Settings</h4>
                    <div className="space-y-2 mt-2">
                        <Label>Virtual Liquidity Boost</Label>
                        <Slider
                            value={[investmentParams.earlyLPBonus * 100]}
                            onValueChange={([value]) => setInvestmentParams({
                                ...investmentParams,
                                earlyLPBonus: value / 100
                            })}
                            max={200}
                            step={1}
                        />
                        <p className="text-sm text-gray-500">
                            {(investmentParams.earlyLPBonus * 100).toFixed(0)}% boost
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </TabsContent>

    {/* Protocol Teams View */}
    <TabsContent value="platform">
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-2">Protocol Mechanism Design</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="p-3 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-700">Pump.fun Mechanics</h4>
                        <p className="text-sm text-purple-600 mt-1">Market Cap Milestones</p>
                        <pre className="mt-2 text-xs bg-white p-2 rounded">
                            price = f(marketCap, time)
                        </pre>
                    </div>
                    <div className="p-3 bg-pink-50 rounded-lg">
                        <h4 className="font-medium text-pink-700">M3M3 Mechanics</h4>
                        <p className="text-sm text-pink-600 mt-1">Dual Token Incentives</p>
                        <pre className="mt-2 text-xs bg-white p-2 rounded">
                            reward = stake * (APY * multiplier)
                        </pre>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg">
                        <h4 className="font-medium text-indigo-700">Gobbler Mechanics</h4>
                        <p className="text-sm text-indigo-600 mt-1">Virtual LP System</p>
                        <pre className="mt-2 text-xs bg-white p-2 rounded">
                            k^2 * k'^2 = virtual_α
                        </pre>
                    </div>
                </div>
            </div>

            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                        data={generateSimulationData}
                        margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="time"
                            label={{ 
                                value: 'Protocol Age (days)', 
                                position: 'insideBottom',
                                offset: -40
                            }}
                        />
                        <YAxis 
                            label={{ 
                                value: 'Protocol Metrics', 
                                angle: -90, 
                                position: 'insideLeft',
                                offset: -40
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                            verticalAlign="top"
                            height={36}
                        />
                        <Line
                            type="monotone"
                            dataKey="pumpFunPrice"
                            name="Pump.fun Price"
                            stroke={PROTOCOL_COLORS.pumpFun}
                            strokeWidth={2}
                        />
                        <Line
                            type="monotone"
                            dataKey="m3m3APY"
                            name="M3M3 Effective APY"
                            stroke={PROTOCOL_COLORS.m3m3}
                            strokeWidth={2}
                        />
                        <Line
                            type="monotone"
                            dataKey="gobblerFees"
                            name="Gobbler Fee Revenue"
                            stroke={PROTOCOL_COLORS.gobbler}
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">M3M3 Protocol Controls</h4>
                    <div className="space-y-2 mt-2">
                        <Label>Base APY Settings</Label>
                        <Slider
                            value={[investmentParams.baseStakingAPY * 100]}
                            onValueChange={([value]) => setInvestmentParams({
                                ...investmentParams,
                                baseStakingAPY: value / 100
                            })}
                            max={100}
                            step={1}
                        />
                        <p className="text-sm text-gray-500">
                            Base APY: {(investmentParams.baseStakingAPY * 100).toFixed(0)}%
                        </p>
                        <div className="mt-4">
                            <Label>Token Distribution</Label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <div>
                                    <Input
                                        type="number"
                                        value={rewardParams.solTokenRatio * 100}
                                        onChange={(e) => setRewardParams({
                                            ...rewardParams,
                                            solTokenRatio: Number(e.target.value) / 100
                                        })}
                                        min={0}
                                        max={100}
                                    />
                                    <span className="text-xs text-gray-500">SOL %</span>
                                </div>
                                <div>
                                    <Input
                                        type="number"
                                        value={(1 - rewardParams.solTokenRatio) * 100}
                                        onChange={(e) => setRewardParams({
                                            ...rewardParams,
                                            solTokenRatio: (100 - Number(e.target.value)) / 100
                                        })}
                                        min={0}
                                        max={100}
                                    />
                                    <span className="text-xs text-gray-500">Token %</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">Pump.fun Protocol Controls</h4>
                    <div className="space-y-2 mt-2">
                        <Label>Market Cap Targets</Label>
                        <select 
                            className="w-full p-2 border rounded"
                            value={bondingParams.bondingMCTarget}
                            onChange={(e) => setBondingParams({
                                ...bondingParams,
                                bondingMCTarget: Number(e.target.value)
                            })}
                        >
                            <option value={69000}>$69k (Default)</option>
                            <option value={420000}>$420k (Extended)</option>
                            <option value={1000000}>$1M (Maximum)</option>
                        </select>
                        <div className="mt-4">
                            <Label>Launch Parameters</Label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <div>
                                    <Label>Initial LP</Label>
                                    <Input
                                        type="number"
                                        value={bondingParams.lpTokenRatio * 100}
                                        onChange={(e) => setBondingParams({
                                            ...bondingParams,
                                            lpTokenRatio: Number(e.target.value) / 100
                                        })}
                                        min={0}
                                        max={100}
                                    />
                                </div>
                                <div>
                                    <Label>Price Scale</Label>
                                    <Input
                                        type="number"
                                        value={bondingParams.poolThickness * 100}
                                        onChange={(e) => setBondingParams({
                                            ...bondingParams,
                                            poolThickness: Number(e.target.value) / 100
                                        })}
                                        min={0}
                                        max={100}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">Gobbler Protocol Controls</h4>
                    <div className="space-y-2 mt-2">
                        <Label>Fee Distribution</Label>
                        <div className="space-y-1">
                            <div>
                                <Label>LP Rewards</Label>
                                <Input
                                    type="number"
                                    value={investmentParams.feeDistribution.lp * 100}
                                    onChange={(e) => setInvestmentParams({
                                        ...investmentParams,
                                        feeDistribution: {
                                            ...investmentParams.feeDistribution,
                                            lp: Number(e.target.value) / 100
                                        }
                                    })}
                                    min={0}
                                    max={100}
                                />
                            </div>
                            <div>
                                <Label>Protocol Revenue</Label>
                                <Input
                                    type="number"
                                    value={investmentParams.feeDistribution.protocol * 100}
                                    onChange={(e) => setInvestmentParams({
                                        ...investmentParams,
                                        feeDistribution: {
                                            ...investmentParams.feeDistribution,
                                            protocol: Number(e.target.value) / 100
                                        }
                                    })}
                                    min={0}
                                    max={100}
                                />
                            </div>
                            <div>
                                <Label>Treasury</Label>
                                <Input
                                    type="number"
                                    value={investmentParams.feeDistribution.staking * 100}
                                    onChange={(e) => setInvestmentParams({
                                        ...investmentParams,
                                        feeDistribution: {
                                            ...investmentParams.feeDistribution,
                                            staking: Number(e.target.value) / 100
                                        }
                                    })}
                                    min={0}
                                    max={100}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </TabsContent>
</Tabs>

</div>
            </CardContent>
        </Card>
    );
};

export default ProtocolChart;