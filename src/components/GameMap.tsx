import { useCallback, useState, type FC } from "react";
import Map, { Popup } from "react-map-gl/mapbox";
import { CityLayers } from "./CityLayers";
import type { MapMouseEvent } from "mapbox-gl";
import { CityInput } from "./CityInput";
import { getValidCity, titleCase } from "../utils/helpers";
import "mapbox-gl/dist/mapbox-gl.css";
import "./GameMap.css";
import { Button } from "./Button";

interface PopupInfo {
  longitude: number;
  latitude: number;
  city: string;
}

const SAVED_CITIES: string[] = JSON.parse(localStorage.getItem("cities") ?? '[]')

const saveCities = (cities: string[]) => localStorage.setItem("cities", JSON.stringify(cities));

const getFeature = (event: MapMouseEvent): string | null =>
  event.features?.[0]?.layer?.id ?? null;

export const GameMap: FC = () => {
  const [highlight, setHighlight] = useState<string | null>(null);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [cities, setCities] = useState<string[]>(SAVED_CITIES);

  const handleMouseMove = useCallback(
    (event: MapMouseEvent) => {
      const selectedCity = getFeature(event) ?? "";

      const isHoveringOverFoundCity = cities.includes(selectedCity);

      if (popupInfo && popupInfo.city !== selectedCity) {
        setPopupInfo(null);
      }

      if (isHoveringOverFoundCity) {
        setHighlight(selectedCity);
      } else {
        setHighlight(null);
      }
    },
    [cities, popupInfo]
  );

  const handleMouseClick = (event: MapMouseEvent) => {
    event.originalEvent.stopPropagation();
    if (popupInfo) {
      setPopupInfo(null);
      return;
    }

    const selectedCity = getFeature(event) ?? "";
    const isClickingFoundCity =
      (event.features?.length ?? 0) > 0 && cities.includes(selectedCity);

    if (isClickingFoundCity) {
      setPopupInfo({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        city: selectedCity.replaceAll("_", " "),
      });
    }
  };

  const addCity = (city: string, clearInput: () => void) => {
    const validCity = getValidCity(city);

    if (validCity && !cities.includes(validCity)) {
      const newCities = [...cities, validCity.replaceAll(" ", "_")];
      saveCities(newCities);
      setCities(newCities);
    }

    if (validCity) {
      clearInput();
    }
  };

  const southWestBound = {
    lng: -94.921449446183,
    lat: 44.24161281699164,
  };

  const northEastBound = {
    lng: -91.7584219273087,
    lat: 45.75842443539333,
  };

  return (
    <>
      <Map
        initialViewState={{
          latitude: 44.97395553995278,
          longitude: -93.26764542557905,
          zoom: 8,
        }}
        onMouseMove={handleMouseMove}
        onClick={handleMouseClick}
        cursor={highlight ? "pointer" : undefined}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        mapStyle={import.meta.env.VITE_MAP_STYLE_URL}
        interactiveLayerIds={cities}
        maxBounds={[southWestBound, northEastBound]}
      >
        <CityLayers cities={cities} highlight={highlight} />

        {popupInfo && (
          <Popup
            anchor="top"
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            onClose={() => setPopupInfo(null)}
          >
            <span className="tooltip neon-tip">
              {titleCase(popupInfo.city)}
              <span className="neon-glow" />
            </span>
          </Popup>
        )}

        <CityInput onEnter={addCity} />
      </Map>
    </>
  );
};
