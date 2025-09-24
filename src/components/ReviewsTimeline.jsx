import { Box } from "@chakra-ui/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ReviewsTimeline({ data }) {
  return (
    <Box bg="white" p={4} rounded="lg" boxShadow="md" w="100%" h="400px">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="reviews" stroke="#004B87" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
