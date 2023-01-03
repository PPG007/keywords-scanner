import { getInput, getBooleanInput, setFailed, error } from '@actions/core';
import { readdirSync, lstatSync, createReadStream } from 'fs';
import { createInterface } from 'readline';
import { join } from 'path';

const keywords = JSON.parse(getInput('keywords'));
const ignoreCase = getBooleanInput('ignoreCase');
const ignoredDirs = JSON.parse(getInput('ignoredDirs'));

let hasKeyword = false;
await parse('.', keywords, ignoreCase, ignoredDirs);

if (hasKeyword) {
    setFailed('found keywords, see workflow details')
}

async function parse(dirName, keywords, ignoreCase, ignoredDirs) {
    const files = readdirSync(dirName);
    for (let i = 0; i < files.length; i++) {
        const tempPath = join(dirName, files[i]);
        let shouldIgnore = false;
        ignoredDirs.forEach(ignoredDir => {
            if (ignoredDir === tempPath) {
                shouldIgnore = true;
            }
        });
        if (shouldIgnore) {
            continue
        }
        if (lstatSync(tempPath).isDirectory()) {
            await parse(tempPath, keywords, ignoreCase, ignoredDirs)
        } else {
            await checkKeyWords(tempPath, keywords, ignoreCase)
        }
    }
}

async function checkKeyWords(filePath, keywords, ignoreCase) {
    let reader = createInterface({
        input: createReadStream(filePath),
    });
    let line = 0;
    reader.on('line', function (text) {
        line++;
        keywords.forEach(keyword => {
            const result = checkKeyWord(text, keyword, ignoreCase);
            if (result != null) {
                hasKeyword = true;
                error({
                    'file': filePath,
                    'line': line,
                    'index': result.index,
                    'content': result.input,
                    'keyword': keyword,
                });
            }
        });
    });
    const answer = new Promise((resolve) => {
        reader.on('close', () => {
            resolve();
        })
    });
    await answer;
}

function checkKeyWord(content, keyword, ignoreCase) {
    let modifier = 'g';
    if (ignoreCase) {
        modifier = 'ig';
    }
    let regex = new RegExp(keyword, modifier)
    return regex.exec(content)
}
