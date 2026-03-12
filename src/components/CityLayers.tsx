import { type FC } from "react";
import { Layer, Source } from "react-map-gl/mapbox";
import { cityNames as rawCityNames } from "../utils/CityNames";

interface CityLayersProps {
  cities: string[];
  highlight: string | null;
}

interface CityLayerProps {
  city: string;
  showBorder: boolean;
  showFill: boolean;
  highlight: boolean;
  show: boolean;
}

const FILL_COLOR = "#a6e3a1";
const HIGHLIGHT_COLOR = "#f9e2af";
const CITY_NAMES = rawCityNames.map((city) => city.replaceAll(" ", "_"));

export const CityLayers: FC<CityLayersProps> = ({ cities, highlight }) => (
  <>
    <Source
      id="metro-area-inverse"
      type="vector"
      url="mapbox://nick-peterson.70d34kmx"
    >
      <Layer
        type="fill"
        source-layer="metro-area-aypnd2"
        paint={{
          "fill-opacity": 0.5,
          "fill-color": "#6b6f85",
        }}
      />
    </Source>
    {...CITY_NAMES.map((city) => (
      <CityLayer
        city={city}
        highlight={city === highlight}
        showBorder={false}
        showFill
        show={cities.includes(city)}
      />
    ))}
  </>
);

const CityLayer: FC<CityLayerProps> = ({ city, highlight, show }) => (
  <>
    <Source
      key={`${city}-key`}
      id={`${city}-id`}
      type="vector"
      url={`mapbox://nick-peterson.${city}`}
    >
      <Layer
        id={city}
        type="fill"
        source-layer={`suburb_game_${city}`}
        paint={{
          "fill-opacity": show ? 0.5 : 0,
          "fill-color": highlight ? HIGHLIGHT_COLOR : FILL_COLOR,
          "fill-outline-color": highlight ? HIGHLIGHT_COLOR : FILL_COLOR,
        }}
      />
    </Source>
  </>
);
