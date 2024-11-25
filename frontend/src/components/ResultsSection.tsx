import { AlertCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Factor {
  name: string;
  value: number;
}

interface Results {
  patientName: string;
  prediction: string;
  confidence: number;
  factors: Factor[];
}

interface ResultsSectionProps {
  results: Results;
}

export default function ResultsSection({ results }: ResultsSectionProps) {
  const { patientName, prediction, confidence, factors } = results;

  // Debug logs
  console.log("Full results:", results);
  console.log("Factors:", factors);

  // Check if factors is undefined or empty
  if (!factors || factors.length === 0) {
    console.error("No factors data available");
    return <div>No data available</div>;
  }

  // Log the transformed data
  const chartData = factors.map(factor => ({
    name: factor.name.length > 20 ? factor.name.substring(0, 20) + '...' : factor.name,
    value: factor.value  // Keep original value
  }));
  console.log("Chart data:", chartData);

  // Find the maximum value for scaling
  const maxValue = Math.max(...factors.map(f => f.value));

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-midnight-800/50 rounded-lg p-6 shadow-xl backdrop-blur-sm border border-purple-900/20">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Analysis Results</h3>
            <p className="text-gray-400">Patient: {patientName}</p>
          </div>
          <div className="flex items-center bg-purple-900/30 px-4 py-2 rounded-lg border border-purple-700/20">
            <span className="text-purple-300 font-semibold">
              {confidence.toFixed(2)}% Confidence
            </span>
          </div>
        </div>

        {/* Prediction Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="w-5 h-5 text-neon-purple" />
            <h4 className="text-lg font-medium text-white">Predicted Condition</h4>
          </div>
          <p className="text-2xl font-bold text-neon-purple">{prediction}</p>
        </div>

        {/* Chart Section */}
        <div className="h-[300px] mt-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2D1B4L" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => `${value.toFixed(2)}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(19, 0, 37, 0.95)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
                  color: '#fff'
                }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Impact']}
                cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
              />
              <Bar
                dataKey="value"
                fill="#A855F7"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Contributing Factors Section */}
      <div className="bg-midnight-800/50 rounded-lg p-6 shadow-xl backdrop-blur-sm border border-purple-900/20">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-neon-purple" />
          <h3 className="text-xl font-semibold text-white">Contributing Factors</h3>
        </div>
        <div className="space-y-4">
          {factors.map((item, index) => {
            // Calculate the percentage relative to the maximum value
            const percentage = (item.value / maxValue) * 100;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{item.name}</span>
                  <span className="text-neon-purple">{item.value.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-purple-900/30 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-neon-purple h-2 rounded-full transition-all duration-500 ease-in-out"
                    style={{ 
                      width: `${percentage}%`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}