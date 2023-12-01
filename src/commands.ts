/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { CommandCallback, IActionContext, IParsedError, openUrl, parseError, registerCommandWithTreeNodeUnwrapping, registerErrorHandler, registerReportIssueCommand } from '@microsoft/vscode-azext-utils';
import { instrumentOperation } from 'vscode-extension-telemetry-wrapper';
import { showError } from './utils';
import { createHub } from './workflows/createHub/createHub';
import { createWebPubSub, helloWorld } from './workflows/createWebPubSub/createWebPubSub';
import { deleteHub } from './workflows/deleteHub/deleteHub';
import { deleteWebPubSub } from './workflows/deleteWebPubSub/deleteWebPubSub';
import { restartWebPubSub } from './workflows/restartWebPubSub/restartWebPubSub';

export function registerCommands(): void {
    registerCommandWithTelemetryWrapper('azureWebPubSub.webPubSub.createInPortal', createServiceInportalWebPubSub);
    // Suppress "Report an Issue" button for all errors in favor of the command
    registerErrorHandler(c => c.errorHandling.suppressReportIssue = true);
    registerCommandWithTelemetryWrapper('azureWebPubSub.webPubSub.helloWorld', helloWorld);
    registerCommandWithTelemetryWrapper('azureWebPubSub.webPubSub.create', createWebPubSub);
    registerCommandWithTelemetryWrapper('azureWebPubSub.webPubSub.delete', deleteWebPubSub);
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

