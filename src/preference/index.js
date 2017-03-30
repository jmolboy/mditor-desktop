const app = require('electron').app;
const Promise = require('bluebird');
const fs = require('fs');
const writeFile = Promise.promisify(require('fs').writeFile);
const readFile = Promise.promisify(require('fs').readFile);
const Parser = require('mditor').Parser;
const yaml = require('js-yaml');

const DATA_PATH = app.getPath('userData');
const PERFERENCE_FILE = `${DATA_PATH}/preference.md`;

async function exists(file) {
  return new Promise(resolve => {
    fs.exists(file, resolve);
  });
}

function parseYaml(text) {
  try {
    return yaml.safeLoad(text, 'utf8');
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function createFile() {
  let buffer = await readFile(`${__dirname}/preference.md`)
  return writeFile(PERFERENCE_FILE, buffer);
}

async function getFile() {
  let isExists = await exists(PERFERENCE_FILE);
  if (!isExists) await createFile();
  return PERFERENCE_FILE;
}

async function load() {
  let isExists = await exists(PERFERENCE_FILE);
  if (!isExists) return;
  let buffer = await readFile(PERFERENCE_FILE);
  if (!buffer) return;
  let content = buffer.toString();
  let editorConfigs, shortcutConfigs;
  Parser.highlights['editor'] = {
    parse: function (code) {
      editorConfigs = code;
    }
  };
  Parser.highlights['shortcut'] = {
    parse: function (code) {
      shortcutConfigs = code;
    }
  };
  let parser = new Parser();
  parser.parse(content);
  return {
    editor: parseYaml(editorConfigs),
    shortcut: parseYaml(shortcutConfigs)
  }
}

exports.getFile = getFile;
exports.load = load;