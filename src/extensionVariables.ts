/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import  { type IAzExtOutputChannel, type IExperimentationServiceAdapter, type TreeElementStateManager } from "@microsoft/vscode-azext-utils";
import  { type AzureResourcesExtensionApi } from "@microsoft/vscode-azureresources-api";
import  { type ExtensionContext } from "vscode";
import  { type ServicesDataProvider } from "./tree/ServicesDataProvider";
import  { type HubSettingFileSystem } from "./workflows/hub/update/HubSettingFileSystem";

/**
 * Namespace for common variables used throughout the extension. They must be initialized in the activate() method of extension.ts
 */
// tslint:disable-next-line: export-name
export namespace ext {
    export const prefix: string = 'webPubSub';
    export let branchDataProvider: ServicesDataProvider;
    export let context: ExtensionContext;
    export let outputChannel: IAzExtOutputChannel;
    export let ignoreBundle: boolean | undefined;
    export let experimentationService: IExperimentationServiceAdapter;
    export let rgApiV2: AzureResourcesExtensionApi;
    export let state: TreeElementStateManager;
    export let hubSettingFileSystem: HubSettingFileSystem;
}

