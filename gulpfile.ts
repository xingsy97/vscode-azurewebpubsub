/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { gulp_webpack } from '@microsoft/vscode-azext-dev';
import * as fse from 'fs-extra';
import * as gulp from 'gulp';
import * as path from 'path';

declare let exports: { [key: string]: unknown };

async function prepareForWebpack(): Promise<void> {
    const mainJsPath: string = path.join(__dirname, 'main.js');
    let contents: string = (await fse.readFile(mainJsPath)).toString();
    contents = contents
        .replace('out/extension.bundle', 'dist/extension.bundle')
        .replace(', true /* ignoreBundle */', '');
    await fse.writeFile(mainJsPath, contents);
}

async function cleanReadme(): Promise<void> {
    const readmePath: string = path.join(__dirname, 'README.md');
    let data: string = (await fse.readFile(readmePath)).toString();
    data = data.replace(/<!-- region exclude-from-marketplace -->.*?<!-- endregion exclude-from-marketplace -->/gis, '');
    await fse.writeFile(readmePath, data);
}

async function preTest(): Promise<void> {
    const fromPath: string = path.join(__dirname, 'test', 'ingress', 'dockerfileSamples');
    const toPath: string = path.join(__dirname, 'dist', 'test', 'ingress', 'dockerfileSamples');
    fse.copySync(fromPath, toPath);
}

exports['webpack-dev'] = gulp.series(prepareForWebpack, () => gulp_webpack('development'));
exports['webpack-prod'] = gulp.series(prepareForWebpack, () => gulp_webpack('production'));
exports.cleanReadme = cleanReadme;
exports.preTest = preTest;
