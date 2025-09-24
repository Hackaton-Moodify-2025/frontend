import { Box } from "@chakra-ui/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#27AE60", "#95A5A6", "#C0392B"];

export default function SentimentPie({ data }) {
  return (
    <Box 
      bg="white" 
      p={6} 
      rounded="xl" 
      boxShadow="md" 
      w="100%" 
      h="400px"
      border="1px"
      borderColor="gray.100"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
}
