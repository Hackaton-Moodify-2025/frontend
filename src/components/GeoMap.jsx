import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { Box, Tooltip } from "@chakra-ui/react";

// рабочий гео чуть позже добавим

const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/russia/russia.json";

export default function GeoMap({ cities }) {
  return (
    <Box w="100%" h="500px" bg="white" p={4} rounded="lg" boxShadow="md">
      <ComposableMap projection="geoMercator" projectionConfig={{ scale: 400 }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#E6E6E6"
                stroke="#999"
              />
            ))
          }
        </Geographies>
        {cities.map((city, i) => (
          <Marker key={i} coordinates={city.coords}>
            <Tooltip label={`${city.name}: ${city.count} отзывов`}>
              <circle
                r={Math.sqrt(city.count)}
                fill={city.negative > city.positive ? "red" : "green"}
                stroke="#fff"
                strokeWidth={1}
              />
            </Tooltip>
          </Marker>
        ))}
      </ComposableMap>
    </Box>
  );
}
