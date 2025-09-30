import { Box } from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function TopicsBarChart({ data }) {
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
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="topic" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#004B87" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
