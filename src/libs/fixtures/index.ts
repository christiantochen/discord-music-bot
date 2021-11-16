import fs from "fs";
const flatten = require("flat");

export const getFixture = (fixture: string, options?: any) => {
  const endPath = process.env.NODE_ENV === "production" ? ".js" : ".ts";
  const fixtures = fixture.split(":");
  let filePath = `./${fixtures[0]}`;

  if (
    !filePath.endsWith(endPath) &&
    fs.existsSync(filePath) &&
    !fs.lstatSync(`${filePath}/index${endPath}`).isFile()
  )
    filePath += endPath;

  let fixtureClass = ((f) => f.default || f)(require(filePath));

  let message = fixtureClass[fixtures[1]];

  if (!options) return message;

  const flattenOptions = flatten(options);
  Object.keys(flattenOptions).forEach((option) => {
    message = message.replace(`<<${option}>>`, flattenOptions[option]);
  });

  return message;
};
