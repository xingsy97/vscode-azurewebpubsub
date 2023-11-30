// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

'use strict';

import { registerAzureUtilsExtensionVariables } from '@microsoft/vscode-azext-azureutils';
import { IActionContext, TreeElementStateManager, callWithTelemetryAndErrorHandling, createAzExtOutputChannel, createExperimentationService, registerUIExtensionVariables } from '@microsoft/vscode-azext-utils';
import { getAzureResourcesExtensionApi } from '@microsoft/vscode-azureresources-api';
import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { ext } from './extensionVariables';
import { HubsBranchDataProvider } from './tree';

export async function activate(context: vscode.ExtensionContext, perfStats: { loadStartTime: number; loadEndTime: number }, ignoreBundle?: boolean): Promise<void> {
    // the entry point for vscode.dev is this activate, not main.js, so we need to instantiate perfStats here
    // the perf stats don't matter for vscode because there is no main file to load-- we may need to see if we can track the download time
    perfStats ||= { loadStartTime: Date.now(), loadEndTime: Date.now() };
    ext.context = context;
    ext.ignoreBundle = ignoreBundle;
    ext.outputChannel = createAzExtOutputChannel('Azure Container Apps', ext.prefix);
    context.subscriptions.push(ext.outputChannel);

    registerUIExtensionVariables(ext);
    registerAzureUtilsExtensionVariables(ext);

    await callWithTelemetryAndErrorHandling('containerApps.activate', async (activateContext: IActionContext) => {
        activateContext.telemetry.properties.isActivationEvent = 'true';
        activateContext.telemetry.measurements.mainFileLoad = (perfStats.loadEndTime - perfStats.loadStartTime) / 1000;

        registerCommands();
        ext.experimentationService = await createExperimentationService(context);
        ext.state = new TreeElementStateManager();
        ext.rgApiV2 = await getAzureResourcesExtensionApi(context, '2.0.0');
        ext.branchDataProvider = new HubsBranchDataProvider();
        // ext.rgApiV2.resources.registerAzureResourceBranchDataProvider(AzExtResourceType.ContainerAppsEnvironment, ext.branchDataProvider);
        ext.rgApiV2.resources.registerAzureResourceBranchDataProvider("WebPubSub" as any, ext.branchDataProvider);
    });
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate(): void {
}
