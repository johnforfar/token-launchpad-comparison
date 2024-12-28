// ./src/components/ProtocolChart.tsx

import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Checkbox } from "./ui/checkbox";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "./ui/tabs";
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend,
    ResponsiveContainer 
} from 'recharts';

interface ProtocolData {
    time: number;
    gobblerTotal: number;
    snapperTotal: number;
    ripperTotal: number;
    ripperAMM: number;
    ripperStaking: number;
    m3m3Total: number;
    m3m3Sol: number;
    m3m3Token: number;
    pumpFunTotal: number;
}

interface ProtocolChartProps {
    analysisMarkdown: string;
}

const calculateGobblerReturns = (initialDeposit: number, entryTime: number, currentTime: number): ProtocolData => {
  const earlyMultiplier = Math.max(2 - (entryTime / 5), 1);
  const lpTokens = initialDeposit * earlyMultiplier;
  const timeHeld = Math.max(0, currentTime - entryTime);
  const feeRate = 0.015;
  const accumulatedFees = lpTokens * timeHeld * feeRate;
  return {
    time: currentTime,
    gobblerTotal: lpTokens + accumulatedFees,
    snapperTotal: 0,
    ripperTotal: 0,
    ripperAMM: 0,
    ripperStaking: 0,
    m3m3Total: 0,
    m3m3Sol: 0,
    m3m3Token: 0,
    pumpFunTotal: 0,
  };
};

const calculateSnapperReturns = (initialDeposit: number, entryTime: number, currentTime: number): ProtocolData => {
  const lpTokens = initialDeposit;
  const timeHeld = Math.max(0, currentTime - entryTime);
  const baseFeeRate = 0.01;
  const feeMultiplier = Math.sqrt(1 + timeHeld * 0.3);
  const accumulatedFees = lpTokens * timeHeld * baseFeeRate * feeMultiplier;
  return {
    time: currentTime,
    gobblerTotal: 0,
    snapperTotal: lpTokens + accumulatedFees,
    ripperTotal: 0,
    ripperAMM: 0,
    ripperStaking: 0,
    m3m3Total: 0,
    m3m3Sol: 0,
    m3m3Token: 0,
    pumpFunTotal: 0,
  };
};

const calculateRipperReturns = (
    initialDeposit: number, 
    entryTime: number, 
    currentTime: number, 
    isTopStaker: boolean
): ProtocolData => {
    // Initial liquidity split
    const initialLPRatio = 0.6;  // 60% goes to LP (thicker than PF's 20%)
    const initialLPAmount = initialDeposit * initialLPRatio;
    
    // Early bonus calculation
    let lpTokens = initialLPAmount;
    if (entryTime <= 4) {
        lpTokens += initialLPAmount * (0.5 * (4 - entryTime) / 4);
    }

    const timeHeld = Math.max(0, currentTime - entryTime);
    
    // AMM rewards using x*y=k (not quadratic)
    const baseRate = 0.01 * (1 + currentTime * 0.05);
    const ammFees = lpTokens * timeHeld * baseRate;

    // Staking rewards with dual-token approach
    let stakingRewards = 0;
    if (isTopStaker) {
        const stakingMultiplier = Math.min(1 + (timeHeld * 0.15), 2.5);
        const baseStakingAPY = 0.30;  // Increased from 0.25
        stakingRewards = lpTokens * baseStakingAPY * stakingMultiplier * (timeHeld / 20);
    }

    // Non-LP token portion rewards
    const nonLPAmount = initialDeposit * (1 - initialLPRatio);
    const marketCapMultiplier = calculateMCMultiplier(currentTime);
    const nonLPValue = nonLPAmount * marketCapMultiplier;

    return {
        time: currentTime,
        gobblerTotal: 0,
        snapperTotal: 0,
        ripperTotal: lpTokens + ammFees + stakingRewards + nonLPValue,
        ripperAMM: ammFees,
        ripperStaking: stakingRewards,
        m3m3Total: 0,
        m3m3Sol: 0,
        m3m3Token: 0,
        pumpFunTotal: 0,
    };
};

// Helper for market cap growth calculation
const calculateMCMultiplier = (time: number): number => {
    if (time < 5) {
        // Faster initial growth
        return Math.pow(1.3, time);
    } else if (time < 10) {
        // Moderate growth
        return Math.pow(1.3, 5) * Math.pow(1.15, time - 5);
    } else {
        // Stabilization
        return Math.pow(1.3, 5) * Math.pow(1.15, 5) * Math.pow(1.05, time - 10);
    }
};

const calculateM3M3Returns = (initialDeposit: number, entryTime: number, currentTime: number, isTopStaker: boolean): ProtocolData => {
  const timeHeld = Math.max(0, currentTime - entryTime);

  if (!isTopStaker) return {
    time: currentTime,
    gobblerTotal: 0,
    snapperTotal: 0,
    ripperTotal: 0,
    ripperAMM: 0,
    ripperStaking: 0,
    m3m3Total: initialDeposit,
    m3m3Sol: 0,
    m3m3Token: 0,
    pumpFunTotal: 0,
  };

  const baseAPY = 0.35;
  const stakingMultiplier = Math.min(1 + (timeHeld * 0.15), 3);
  const totalRewards = initialDeposit * (baseAPY * stakingMultiplier) * (timeHeld / 20);
  const solRewards = totalRewards * 0.3;
  const tokenRewards = totalRewards * 0.7;

  return {
    time: currentTime,
    gobblerTotal: 0,
    snapperTotal: 0,
    ripperTotal: 0,
    ripperAMM: 0,
    ripperStaking: 0,
    m3m3Total: initialDeposit + solRewards + tokenRewards,
    m3m3Sol: solRewards,
    m3m3Token: tokenRewards,
    pumpFunTotal: 0,
  };
};

const ProtocolChart: React.FC<ProtocolChartProps> = ({ analysisMarkdown }) => {
    const [deposit, setDeposit] = useState<number>(1000);
    const [entryTime, setEntryTime] = useState<number>(0);
    const [isTopStaker, setIsTopStaker] = useState<boolean>(true);
    const [simulationData, setSimulationData] = useState<ProtocolData[]>([]);

    const generateCurvePoints = (
        formula: (x: number) => number,
        start: number,
        end: number,
        points: number = 200
    ) => {
        const step = (end - start) / points;
        return Array.from({ length: points + 1 }, (_, i) => {
            const x = start + step * i;
            const y = formula(x);
            return {
                x,
                y: isFinite(y) ? y : null
            };
        }).filter(point => point.y !== null);
    };

    useEffect(() => {
        const newData: ProtocolData[] = [];
        for (let t = 0; t <= 20; t++) {
            const gobbler = calculateGobblerReturns(deposit, entryTime, t);
            const snapper = calculateSnapperReturns(deposit, entryTime, t);
            const ripper = calculateRipperReturns(deposit, entryTime, t, isTopStaker);
            const m3m3 = calculateM3M3Returns(deposit, entryTime, t, isTopStaker);

            let pumpFunValue = 0;
            if (t === 0) pumpFunValue = deposit;
            else if (t < 5) pumpFunValue = deposit * Math.pow(1.5, t);
            else if (t < 10) pumpFunValue = deposit * Math.pow(1.2, t);
            else pumpFunValue = Math.max(deposit * Math.pow(0.9, t - 10), deposit * 0.1);

            newData.push({
                ...gobbler,
                snapperTotal: snapper.snapperTotal,
                ripperTotal: ripper.ripperTotal,
                ripperAMM: ripper.ripperAMM,
                ripperStaking: ripper.ripperStaking,
                m3m3Total: m3m3.m3m3Total,
                m3m3Sol: m3m3.m3m3Sol,
                m3m3Token: m3m3.m3m3Token,
                pumpFunTotal: pumpFunValue,
            });
        }
        setSimulationData(newData);
    }, [deposit, entryTime, isTopStaker]);

    return (
        <div className="w-full p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Token Launchpad Comparison</CardTitle>
                    <CardDescription>Comparing returns of Gobbler, Snapper, M3M3, Pump.Fun Launchpads</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="deposit">Initial Deposit (USD)</Label>
                            <Input
                                id="deposit"
                                type="number"
                                value={deposit}
                                onChange={(e) => setDeposit(Number(e.target.value))}
                                min={0}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Entry Time: T={entryTime}</Label>
                            <Slider
                                value={[entryTime]}
                                onValueChange={([value]) => setEntryTime(value)}
                                max={20}
                                step={1}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                checked={isTopStaker}
                                onCheckedChange={(checked) => setIsTopStaker(!!checked)}
                                id="topStaker"
                            />
                            <Label htmlFor="topStaker">Top Staker Status</Label>
                        </div>
                    </div>

                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="details">Reward Details</TabsTrigger>
                            <TabsTrigger value="curves">Bonding Curves</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview">
                            <div className="border rounded p-4" style={{ height: '400px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={simulationData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="time" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="gobblerTotal" 
                                            stroke="#f59e0b" 
                                            name="Gobbler"
                                            strokeWidth={2}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="snapperTotal" 
                                            stroke="#10b981" 
                                            name="Snapper"
                                            strokeWidth={2}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="ripperTotal" 
                                            stroke="#6366f1" 
                                            name="Ripper *"
                                            strokeWidth={2}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="m3m3Total" 
                                            stroke="#ec4899" 
                                            name="M3M3"
                                            strokeWidth={2}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="pumpFunTotal" 
                                            stroke="#ff00ff" 
                                            name="Pump.Fun"
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </TabsContent>

                        <TabsContent value="details">
                            <div className="border rounded p-4" style={{ height: '400px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={simulationData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="time" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="ripperAMM" 
                                            stroke="#6366f1" 
                                            name="Ripper AMM *"
                                            strokeWidth={2}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="ripperStaking" 
                                            stroke="#818cf8" 
                                            name="Ripper Staking"
                                            strokeWidth={2}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="m3m3Sol" 
                                            stroke="#ec4899" 
                                            name="M3M3 SOL"
                                            strokeWidth={2}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="m3m3Token" 
                                            stroke="#f472b6" 
                                            name="M3M3 Token"
                                            strokeWidth={2}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="pumpFunTotal" 
                                            stroke="#ff00ff" 
                                            name="Pump.Fun"
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </TabsContent>
                        <TabsContent value="curves">
                            <div className="border rounded p-4" style={{ height: '400px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        data={generateCurvePoints((x) => x, 0.1, 10)}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="x"
                                            domain={[0, 10]} 
                                            type="number"
                                        />
                                        <YAxis 
                                            domain={[0, 1000]} 
                                            type="number"
                                        />
                                        <Tooltip />
                                        <Legend />
                                        
                                        {/* Standard x*y=k curves */}
                                        <Line 
                                            data={generateCurvePoints((x) => 10/x, 0.1, 10)}
                                            type="monotone"
                                            dataKey="y"
                                            stroke="#f59e0b"
                                            name="x*y=10"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                        <Line 
                                            data={generateCurvePoints((x) => 100/x, 0.1, 10)}
                                            type="monotone"
                                            dataKey="y"
                                            stroke="#10b981"
                                            name="x*y=100"
                                            strokeWidth={2}
                                            dot={false}
                                        />

                                        {/* Quadratic curves */}
                                        <Line 
                                            data={generateCurvePoints((x) => Math.sqrt(10/(x*x)), 0.1, 10)}
                                            type="monotone"
                                            dataKey="y"
                                            stroke="#6366f1"
                                            name="x^2*y^2=10"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                        <Line 
                                            data={generateCurvePoints((x) => Math.sqrt(100/(x*x)), 0.1, 10)}
                                            type="monotone"
                                            dataKey="y"
                                            stroke="#ec4899"
                                            name="x^2*y^2=100"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-amber-600">Gobbler</CardTitle>
                            </CardHeader>
                            <CardContent>
                                ${simulationData[simulationData.length-1]?.gobblerTotal?.toFixed(2) || 0}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-emerald-600">Snapper</CardTitle>
                            </CardHeader>
                            <CardContent>
                                ${simulationData[simulationData.length-1]?.snapperTotal?.toFixed(2) || 0}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-indigo-600">Ripper *</CardTitle>
                            </CardHeader>
                            <CardContent>
                                ${simulationData[simulationData.length-1]?.ripperTotal?.toFixed(2) || 0}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-pink-600">M3M3</CardTitle>
                            </CardHeader>
                            <CardContent>
                                ${simulationData[simulationData.length-1]?.m3m3Total?.toFixed(2) || 0}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-fuchsia-600">Pump.Fun</CardTitle>
                            </CardHeader>
                            <CardContent>
                                ${simulationData[simulationData.length-1]?.pumpFunTotal?.toFixed(2) || 0}
                            </CardContent>
                        </Card>
                    </div>
                    <p className="text-sm text-gray-500">* Ripper is a hypothetical hybrid protocol that combines AMM and staking mechanisms. Read more in the analysis section below.</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProtocolChart;