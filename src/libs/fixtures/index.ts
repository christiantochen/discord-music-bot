import fs from "fs";
const flatten = require("flat");

export const getFixture = (fixture: string, options?: any) => {
  const fixtures = fixture.split(":");
  let filePath = `./${fixtures[0]}`;

  if (
    !filePath.endsWith(".ts") &&
    fs.existsSync(filePath) &&
    !fs.lstatSync(`${filePath}/index.ts`).isFile()
  )
    filePath += ".ts";

  let fixtureClass = ((f) => f.default || f)(require(filePath));

  let message = fixtureClass[fixtures[1]];

  if (!options) return message;

  const flattenOptions = flatten(options);
  Object.keys(flattenOptions).forEach((option) => {
    message = message.replace(`<<${option}>>`, flattenOptions[option]);
  });

  return message;
};
