import { cityNames } from "./CityNames";
import { colors } from "./Colors";

export interface Feature {
  userInput: string;
  geojson: GeoJSON.Feature;
}

const cityNamesSet = new Set(cityNames)

export const mapNotNull = <T, F>(list: T[], transform: (element: T) => F) =>
  list.map(transform).filter((element) => element !== null);

export const getRandomColor = () =>
  colors[Math.floor(Math.random() * colors.length)];

export const getValidCity = (cityName: string): string | null => {
  const cleanedCity = cleanCityName(cityName);

  console.log(cleanedCity)

  if (cityNamesSet.has(cleanedCity)) {
    return cleanedCity;
  } else {
    return null;
  }
};

export const cleanCityName = (cityName: string): string =>
  cityName
    .replace(/\b(st\.|St\.|ST\.|st|St|ST) /, "saint ")
    .toLowerCase()
    .trim();

export const titleCase = (cityName: string): string =>
  cityName
    .toLowerCase()
    .split(" ")
    .map((word) => word.replace(word[0], word[0].toUpperCase()))
    .join(" ");
