"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VisitorChartProps {
    data: {
        date: string;
        count: number;
    }[];
}

export function VisitorChart({ data }: VisitorChartProps) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Trafic Visiteurs (7 derniers jours)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <Tooltip
                                contentStyle={{ background: "#fff", border: "1px solid #eee", borderRadius: "8px" }}
                                labelStyle={{ color: "#666" }}
                                formatter={(value: number) => [`${value} visiteurs`, "Visiteurs"]}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#8884d8"
                                strokeWidth={2}
                                activeDot={{ r: 8 }}
                                dot={{ r: 4, fill: "#8884d8" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
