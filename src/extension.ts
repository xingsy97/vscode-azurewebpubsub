// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

'use strict';

import { registerAzureUtilsExtensionVariables } from '@microsoft/vscode-azext-azureutils';
import { TreeElementStateManager, createAzExtOutputChannel, createExperimentationService, registerUIExtensionVariables } from '@microsoft/vscode-azext-utils';
import { AzureResourcesExtensionApi, getAzureResourcesExtensionApi } from '@microsoft/vscode-azureresources-api';
import * as vscode from 'vscode';
import { dispose as disposeTelemetryWrapper, initialize, instrumentOperation } from 'vscode-extension-telemetry-wrapper';
import { registerCommands } from './commands';
import { ext } from './extensionVariables';
import { HubsBranchDataProvider } from './model';
import { getAiKey, getExtensionId, getExtensionVersion, loadPackageInfo } from './utils';

export async function activateInternal(context: vscode.ExtensionContext, _perfStats: { loadStartTime: number; loadEndTime: number }, ignoreBundle?: boolean): Promise<void> {
    ext.context = context;
    ext.ignoreBundle = ignoreBundle;
    ext.outputChannel = createAzExtOutputChannel('Azure Web PubSub', ext.prefix);
    context.subscriptions.push(ext.outputChannel);

    registerUIExtensionVariables(ext);
    registerAzureUtilsExtensionVariables(ext);

    await loadPackageInfo(context);
    // Usage data statistics.
    if (getAiKey()) {
        initialize(getExtensionId(), getExtensionVersion(), getAiKey(), { firstParty: true });
    }
    instrumentOperation('activation', async () => {
        registerCommands();
        const rgApiProvider: AzureResourcesExtensionApi = await getAzureResourcesExtensionApi(context, '2.0.0');
        if (rgApiProvider) {
            ext.experimentationService = await createExperimentationService(context);
            ext.state = new TreeElementStateManager();
            ext.rgApiV2 = await getAzureResourcesExtensionApi(context, '2.0.0');
            ext.branchDataProvider = new HubsBranchDataProvider();
            // ext.rgApiV2.resources.registerAzureResourceBranchDataProvider(AzExtResourceType.WebPubSub, ext.branchDataProvider);
            ext.rgApiV2.resources.registerAzureResourceBranchDataProvider("WebPubSub" as any, ext.branchDataProvider);
        } else {
            throw new Error('Could not find the Azure Resource Groups extension');
        }
    })();
}

export async function deactivateInternal(): Promise<void> {
    await disposeTelemetryWrapper();
}
