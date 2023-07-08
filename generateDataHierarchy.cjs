const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'public/data');
function kebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2') // Convertir les lettres en camelCase en lettres séparées par des tirets
    .replace(/[\s_]+/g, '-') // Convertir les espaces et les underscores en tirets
    .toLowerCase(); // Convertir en minuscules
}


function getFileData(filePath) {
  return fs.readdirSync(filePath).map(file => {
    const name = path.parse(file).name; // remove extension
    const tags = name.split('-'); // split tags
    const relativePath = path.join('data', path.relative(dataPath, path.join(filePath, file))).replace(/\\/g, '/');
    const slug = kebabCase(name);

    return {
      name: file,
      slug: slug,
      tags: tags,
      path: relativePath,
    }
  })
}

function getFolderData(folderPath) {
  const folders = fs.readdirSync(folderPath);

  const folderData = {};
  for (const folder of folders) {
    const folderPath = path.join(dataPath, folder);
    if (fs.statSync(folderPath).isDirectory()) {
      folderData[folder] = getFileData(folderPath);
    }
  }

  return folderData;
}

const dataInfo = {
  folders: getFolderData(dataPath),
};

const outputPath = path.join(__dirname, 'public/dataInfo.json');
fs.writeFileSync(outputPath, JSON.stringify(dataInfo));

console.log('works !')