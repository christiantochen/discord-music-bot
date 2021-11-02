import fs from "fs";
const flatten = require("flat");

export const getFixture = (fixture: string, options?: any) => {
  const fixtures = fixture.split(":");
  let filePath = `./${fixtures[0]}`;

  if (
    !filePath.endsWith(process.env.NODE_ENV === "production" ? ".js" : ".ts") &&
    fs.existsSync(filePath) &&
    !fs
      .lstatSync(
        `${filePath}/index${process.env.NODE_ENV === "production" ? ".js" : ".ts"}`
      )
      .isFile()
  )
    filePath += process.env.NODE_ENV === "production" ? ".js" : ".ts";

  let fixtureClass = ((f) => f.default || f)(require(filePath));

  let message = fixtureClass[fixtures[1]];

  if (!options) return message;

  const flattenOptions = flatten(options);
  Object.keys(flattenOptions).forEach((option) => {
    message = message.replace(`<<${option}>>`, flattenOptions[option]);
  });

  return message;
};
