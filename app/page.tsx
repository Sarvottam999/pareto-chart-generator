"use client";
import React, { useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  ComposedChart,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Plus, Trash2, Download, BarChart3 } from "lucide-react";

interface CategoryData {
  id: string;
  category: string;
  value: number;
  threshold: number;
}

interface ChartData {
  category: string;
  percentage: number;
  cumulative: number;
}

const ParetoChartGenerator: React.FC = () => {
  const [categories, setCategories] = useState<CategoryData[]>([
    { id: "1", category: "", value: 0, threshold: 0 },
  ]);
  const [chartData, setChartData] = useState<ChartData[] | null>(null);
  const [thresholdLine, setThresholdLine] = useState<number>(80);
  const chartRef = useRef<HTMLDivElement>(null);

  const [xAxisLabel, setXAxisLabel] = useState<string>("Category");
  const [yAxisLabel, setYAxisLabel] = useState<string>("Value");

  const addCategory = () => {
    const newCategory: CategoryData = {
      id: Date.now().toString(),
      category: "",
      value: 0,
      threshold: 0,
    };
    setCategories([...categories, newCategory]);
  };

  const removeCategory = (id: string) => {
    if (categories.length > 1) {
      setCategories(categories.filter((cat) => cat.id !== id));
    }
  };

  const updateCategory = (
    id: string,
    field: keyof CategoryData,
    value: string | number
  ) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id ? { ...cat, [field]: value } : cat
      )
    );
  };

  const generateChart = () => {
    const validCategories = categories.filter(
      (cat) => cat.category && cat.value > 0
    );

    if (validCategories.length === 0) return;

    const sorted = [...validCategories].sort((a, b) => b.value - a.value);
    const total = sorted.reduce((sum, cat) => sum + cat.value, 0);

    let cumulative = 0;
    const data: ChartData[] = sorted.map((cat) => {
      const percentage = (cat.value / total) * 100;
      cumulative += percentage;
      return {
        category: cat.category,
        percentage: parseFloat(percentage.toFixed(2)),
        cumulative: parseFloat(cumulative.toFixed(2)),
      };
    });

    setChartData(data);

    const avgThreshold =
      validCategories.reduce((sum, cat) => sum + cat.threshold, 0) /
      validCategories.length;
    setThresholdLine(avgThreshold || 80);
  };

  const downloadChart = () => {
    if (!chartRef.current) return;

    const svgElement = chartRef.current.querySelector("svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = 1200;
    canvas.height = 600;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const link = document.createElement("a");
        link.download = "pareto-chart.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    };

    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          {/* <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Pareto Chart Generator</h1>
          </div> */}

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Enter Categories
              </h2>
              <button
                onClick={addCategory}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 border">
                      <input
                        type="text"
                        value={xAxisLabel}
                        onChange={(e) => setXAxisLabel(e.target.value)}
                        className="w-full px-2 py-1 text-sm font-semibold text-gray-700 bg-transparent border-b-2 border-transparent hover:border-blue-400 focus:border-blue-600 focus:outline-none transition-colors"
                        placeholder="Category Name"
                      />
                    </th>
                    <th className="px-4 py-3 border">
                      <input
                        type="text"
                        value={yAxisLabel}
                        onChange={(e) => setYAxisLabel(e.target.value)}
                        className="w-full px-2 py-1 text-sm font-semibold text-gray-700 bg-transparent border-b-2 border-transparent hover:border-blue-400 focus:border-blue-600 focus:outline-none transition-colors"
                        placeholder="Value"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">
                      Threshold (%)
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border">
                        <input
                          type="text"
                          value={cat.category}
                          onChange={(e) =>
                            updateCategory(cat.id, "category", e.target.value)
                          }
                          placeholder="e.g., NGD"
                          className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 border">
                        <input
                          type="number"
                          value={cat.value || ""}
                          onChange={(e) =>
                            updateCategory(
                              cat.id,
                              "value",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          className="w-full px-3 text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 border">
                        <input
                          type="number"
                          value={cat.threshold || ""}
                          onChange={(e) =>
                            updateCategory(
                              cat.id,
                              "threshold",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="80"
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 border text-center">
                        <button
                          onClick={() => removeCategory(cat.id)}
                          disabled={categories.length === 1}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            Value
            <button
              onClick={generateChart}
              className="mt-6 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generate Pareto Chart
            </button>
          </div>
        </div>

        {chartData && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Pareto Chart - Abnormalities by Unit
              </h2>
              <button
                onClick={downloadChart}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Chart
              </button>
            </div>

            <div ref={chartRef} className="w-full h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 20, right: 60, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="category"
                    tick={{ fill: "#374151", fontSize: 12 }}
                    label={{
                      value: xAxisLabel,
                      position: "insideBottom",
                      offset: -10,
                      fill: "#374151",
                    }}
                  />
                <YAxis 
  yAxisId="left"
  tick={{ fill: '#374151', fontSize: 12 }}
  label={{ value: `${yAxisLabel} (%)`, angle: -90, position: 'insideLeft', fill: '#374151' }}
/>
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tick={{ fill: '#dc2626', fontSize: 12 }}
                    label={{ value: 'Cumulative (%)', angle: 90, position: 'insideRight', fill: '#dc2626' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                    }}
                    formatter={(value: number) => `${value.toFixed(2)}%`}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="rect"
                  />
                  <ReferenceLine
                    yAxisId="right"
                    y={thresholdLine}
                    stroke="#10b981"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{
                      value: `${thresholdLine}% Threshold`,
                      position: "right",
                      fill: "#10b981",
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="percentage"
                    fill="#6366f1"
                    name="Percentage"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#dc2626"
                    strokeWidth={3}
                    dot={{ fill: "#dc2626", r: 5 }}
                    name="Cumulative %"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParetoChartGenerator;
