import { Box, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function ApiPage() {
  const [data, setData] = useState([]);

//   Проверк отработки мок данных через речар

  useEffect(() => {
    setTimeout(() => {
      setData([ 
        { name: "Пн", value: 5 },
        { name: "Вт", value: 8 },
        { name: "Ср", value: 6 },
        { name: "Чт", value: 9 },
        { name: "Пт", value: 7 },
      ]);
    }, 1000); 
  }, []);

  return (
    <Box py={6}>
      <Text fontSize="lg" color="gray.700" mb={4}>
        Вызов API и визуализация данных. Чисто пример
      </Text>

      <Box w="100%" h="400px" bg="white" p={4} borderRadius="lg" boxShadow="md">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#004B87" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
