/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { CommandCallback, IActionContext, IParsedError, openUrl, parseError, registerCommandWithTreeNodeUnwrapping, registerErrorHandler, registerReportIssueCommand } from '@microsoft/vscode-azext-utils';
import { instrumentOperation } from 'vscode-extension-telemetry-wrapper';
import { showError } from './utils';
import { createHub } from './workflows/hub/create/createHub';
import { deleteHub } from './workflows/hub/delete/deleteHub';
import { createEventHandler } from './workflows/hubSetting/eventHandler/create/createEventHandler';
import { deleteEventHandler } from './workflows/hubSetting/eventHandler/delete/deleteEventHandler';
import { checkServiceHealth } from './workflows/service/checkHealth/checkHealth';
import { copyServiceConnectionString } from './workflows/service/copyConnectionString/copyConnectionString';
import { copyServiceEndpoint } from './workflows/service/copyEndpoint/copyEndpoint';
import { createService } from './workflows/service/create/createService';
import { deleteService } from './workflows/service/delete/deleteService';
import { openLiveTraceTool } from './workflows/service/openLiveTraceTool/openLiveTraceTool';
import { restartWebPubSub } from './workflows/service/restart/restartWebPubSub';
import { helloWorld } from "./workflows/trivial/helloWorld";

export function registerCommands(): void {
    registerCommandWithTelemetryWrapper('azureWebPubSub.common.helloWorld', helloWorld);
    registerCommandWithTelemetryWrapper('azureWebPubSub.service.create', createService);
    registerCommandWithTelemetryWrapper('azureWebPubSub.service.createInPortal', createServiceInPortal);
    registerCommandWithTelemetryWrapper('azureWebPubSub.service.delete', deleteService);
    registerCommandWithTelemetryWrapper('azureWebPubSub.service.copyConnectionString', copyServiceConnectionString);
    registerCommandWithTelemetryWrapper('azureWebPubSub.service.copyEndpoint', copyServiceEndpoint);
    registerCommandWithTelemetryWrapper('azureWebPubSub.service.openLiveTraceTool', openLiveTraceTool);
    registerCommandWithTelemetryWrapper('azureWebPubSub.service.checkHealth', checkServiceHealth);
    registerCommandWithTelemetryWrapper('azureWebPubSub.service.restart', restartWebPubSub);
    registerCommandWithTelemetryWrapper('azureWebPubSub.hub.create', createHub);
    registerCommandWithTelemetryWrapper('azureWebPubSub.hub.delete', deleteHub);
    registerCommandWithTelemetryWrapper('azureWebPubSub.hub.eventHandler.create', createEventHandler);
    registerCommandWithTelemetryWrapper('azureWebPubSub.hub.eventHandler.delete', deleteEventHandler);
    // Suppress "Report an Issue" button for all errors in favor of the command
    registerErrorHandler(c => c.errorHandling.suppressReportIssue = true);
    registerReportIssueCommand('azureWebPubSub.common.reportIssue');

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

export async function createServiceInPortal(_context: IActionContext): Promise<void> {
    await openUrl('https://portal.azure.com/#create/Microsoft.AzureWebPubSub');
}


// async function getResourceGroup(context: IActionContext, item?: ResourceItemBase): Promise<ResourceItemBase> {
//     // if (item instanceof ResourceGroupsItem) {
//     //     return item;
//     // }
//     return await pickResourceGroup(context, item);
// }

