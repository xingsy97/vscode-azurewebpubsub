// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IAzExtOutputChannel, IExperimentationServiceAdapter, TreeElementStateManager } from "@microsoft/vscode-azext-utils";
import { AzureResourcesExtensionApi } from "@microsoft/vscode-azureresources-api";
import { ExtensionContext } from "vscode";
import { HubsBranchDataProvider } from "./tree";

/**
 * Namespace for common variables used throughout the extension. They must be initialized in the activate() method of extension.ts
 */
// tslint:disable-next-line: export-name
export namespace ext {
    export let context: ExtensionContext;
    export let outputChannel: IAzExtOutputChannel;
    export let ignoreBundle: boolean | undefined;
    export const prefix: string = 'webPubSub';

    export let experimentationService: IExperimentationServiceAdapter;
    export let rgApiV2: AzureResourcesExtensionApi;

    export let state: TreeElementStateManager;
    export let branchDataProvider: HubsBranchDataProvider;
}

