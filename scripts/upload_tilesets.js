import { cityBoundaries } from "./city_boundaries.js";
import fs, { promises as fsp } from "node:fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const MAPBOX_USERNAME = "nick-peterson";
const MAPBOX_BASE_URL = `https://api.mapbox.com/uploads/v1/${MAPBOX_USERNAME}`;
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

const parseFile = async (cityFeature) => {
  const name = cityFeature.properties["FEATURE_NAME"]
    .trim()
    .toLowerCase()
    .replaceAll(" ", "_");
  const geojson = {
    type: "FeatureCollection",
    name: `${name}_border`,
    features: [
      {
        type: "Feature",
        properties: {
          ...cityFeature.properties,
          FEATURE_NAME: name,
        },
        geometry: cityFeature.geometry,
      },
    ],
  };

  await fsp.writeFile(`./data/${name}.geojson`, JSON.stringify(geojson));

  console.log(`Parsed : ${name}`);

  return name;
};

const getS3Credentials = async () => {
  const response = await fetch(
    `${MAPBOX_BASE_URL}/credentials?access_token=${MAPBOX_ACCESS_TOKEN}`,
    {
      method: "POST",
    }
  );

  return await response.json();
};

const uploadFileToS3Bucket = async (filePath, s3Credentials) => {
  const client = new S3Client({
    region: "us-east-1",
    credentials: {
      accessKeyId: s3Credentials.accessKeyId,
      secretAccessKey: s3Credentials.secretAccessKey,
      sessionToken: s3Credentials.sessionToken,
    },
  });

  const fileStream = fs.createReadStream(filePath, { encoding: "utf8" });

  const command = new PutObjectCommand({
    Bucket: s3Credentials.bucket,
    Body: fileStream,
    Key: s3Credentials.key,
  });

  const response = await client.send(command);

  console.log(`Uploaded to S3 : ${filePath}`);

  return response;
};

const uploadTilesetToMapbox = async (cityName, url) => {
  const body = {
    url: url,
    tileset: `nick-peterson.${cityName}`,
    name: `suburb_game_${cityName}`,
  };

  const response = await fetch(
    `${MAPBOX_BASE_URL}?access_token=${MAPBOX_ACCESS_TOKEN}`,
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    }
  );

  const json = await response.json();

  console.log(`Uploaded to Mapbox : ${JSON.stringify(json)}`);

  return json;
};

const parseAndUploadFile = async (cityFeature, s3Credentials) => {
  try {
    const cityName = await parseFile(cityFeature);
    console.log("Start Uploading", cityName);

    await uploadFileToS3Bucket(`./data/${cityName}.geojson`, s3Credentials);
    delay(10000);
    await uploadTilesetToMapbox(cityName, s3Credentials.url);
    console.log("Done Uploading", cityName);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getCityBoundaryChunks = (chunkSize) => {
  const chunks = [];
  for (let i = 0; i < cityBoundaries.features.length; i += chunkSize) {
    const chunk = cityBoundaries.features.slice(i, i + chunkSize);
    chunks.push(chunk);
  }
  return chunks;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const run = async () => {
  const success = [];
  const failure = [];

  for (const feature of cityBoundaries.features) {
    // Delay is required to avoid hitting mapbox rate limits
    await delay(3000);
    console.log("start processing", feature.properties);
    const s3Credentials = await getS3Credentials();
    try {
      await parseAndUploadFile(feature, s3Credentials);
      success.push(feature.properties["FEATURE_NAME"]);
    } catch (error) {
      console.error(`Failed to process ${feature.properties["FEATURE_NAME"]}`);
      failure.push(feature.properties["FEATURE_NAME"]);
    }
  }

  console.log(`Uploaded ${success.length} cities successfully`);
  console.log(success);
  console.log();
  console.log(`Failed to upload ${failure.length} cities`);
  console.log(failure);
};

await run();
