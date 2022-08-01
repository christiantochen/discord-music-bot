import fs from "fs";
import path from "path";

const getAllFiles = (dirPath: string, arrayOfFiles?: any[]): any[] => {
	const files = fs.readdirSync(dirPath);

	if (!arrayOfFiles) arrayOfFiles = [];

	files.forEach(function (file) {
		if (fs.statSync(dirPath + "/" + file).isDirectory()) {
			arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
		} else if (arrayOfFiles) {
			arrayOfFiles.push(path.join(dirPath, "/", file));
		}
	});

	return arrayOfFiles.filter((file) =>
		file.endsWith(process.env.NODE_ENV === "production" ? ".js" : ".ts")
	);
};

export default getAllFiles;
