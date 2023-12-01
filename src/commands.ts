/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { CommandCallback, IActionContext, IParsedError, openUrl, parseError, registerCommandWithTreeNodeUnwrapping, registerErrorHandler, registerReportIssueCommand } from '@microsoft/vscode-azext-utils';
import { instrumentOperation } from 'vscode-extension-telemetry-wrapper';
import { showError } from './utils';
import { createHub } from './workflows/hub/create/createHub';
import { deleteHub } from './workflows/hub/delete/deleteHub';
import { createService } from './workflows/service/create/createService';
import { deleteService } from './workflows/service/delete/deleteService';
import { restartWebPubSub } from './workflows/service/restart/restartWebPubSub';
import { copyConnectionString } from './workflows/trivial/copyConnectionString/copyConnectionString';
import { copyEndpoint } from './workflows/trivial/copyEndpoint/copyEndpoint';
import { helloWorld } from "./workflows/trivial/helloWorld";
import { openLiveTraceTool } from './workflows/trivial/openLiveTraceTool/openLiveTraceTool';

export function registerCommands(): void {
    registerCommandWithTelemetryWrapper('azureWebPubSub.webPubSub.createInPortal', createServiceInportalWebPubSub);
    // Suppress "Report an Issue" button for all errors in favor of the command
    registerErrorHandler(c => c.errorHandling.suppressReportIssue = true);
    registerCommandWithTelemetryWrapper('azureWebPubSub.webPubSub.helloWorld', helloWorld);
    registerCommandWithTelemetryWrapper('azureWebPubSub.webPubSub.create', createService);
    registerCommandWithTelemetryWrapper('azureWebPubSub.webPubSub.delete', deleteService);
    registerCommandWithTelemetryWrapper('azureWebPubSub.webPubSub.copyConnectionString', copyConnectionString);
    registerCommandWithTelemetryWrapper('azureWebPubSub.webPubSub.copyEndpoint', copyEndpoint);
    registerCommandWithTelemetryWrapper('azureWebPubSub.webPubSub.openLiveTraceTool', openLiveTraceTool);
    registerCommandWithTelemetryWrapper('azureWebPubSub.hub.create', createHub);
    registerCommandWithTelemetryWrapper('azureWebPubSub.hub.delete', deleteHub);
    registerCommandWithTelemetryWrapper('azureWebPubSub.webPubSub.restart', restartWebPubSub);
    registerReportIssueCommand('azureWebPubSub.reportIssue');
}

function registerCommandWithTelemetryWrapper(commandId: string, callback: CommandCallback): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const callbackWithTroubleshooting: CommandCallback = (context: IActionContext, ...args: []) => instrumentOperation(commandId, async () => {
        try {
            await callback(context, ...args);
        } catch (error) {
            const e: IParsedError = parseError(error);
            if (!e.isUserCancelledError) {
                // tslint:disable-next-line: no-unsafe-any
                showError(commandId, error);
            }
            throw error;
        }
    })();
    registerCommandWithTreeNodeUnwrapping(commandId, callbackWithTroubleshooting);
}

export async function createServiceInportalWebPubSub(_context: IActionContext): Promise<void> {
    await openUrl('https://portal.azure.com/#create/Microsoft.AzureWebPubSub');
}


// async function getResourceGroup(context: IActionContext, item?: ResourceItemBase): Promise<ResourceItemBase> {
//     // if (item instanceof ResourceGroupsItem) {
//     //     return item;
//     // }
//     return await pickResourceGroup(context, item);
// }

