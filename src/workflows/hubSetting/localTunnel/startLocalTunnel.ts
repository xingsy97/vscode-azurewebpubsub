/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from "vscode";
import { localTunnelPackageName, localTunnelTerminalName } from "../../../constants";
import { HubItem } from "../../../tree/hub/HubItem";
import { pickHub } from "../../../tree/pickitem/pickHub";
import { createEndpointFromHostName, localize } from "../../../utils";

export async function startLocalTunnel(context: IActionContext, node?: HubItem): Promise<void> {
    const hub: HubItem = node ? node : await pickHub(context, { title: localize('chooseHub', 'Choose a Hub to start local tunnel') });
    const service = hub.service;

    if (!hub || !service) {
        throw new Error(`Invalid hub ${hub} or service ${service}`);
    }

    vscode.window.showInformationMessage(`Starting Local Tunnel for Hub ${hub.hubName}`)

    const terminal: vscode.Terminal = getTermianl(localTunnelTerminalName);

    terminal.show();

    const installPackageCmd = `npm install -g ${localTunnelPackageName}`;
    // terminal.sendText(installPackageCmd);

    const runTunnelCmd = getLocalTunnelCommand(
        hub.hubName,
        createEndpointFromHostName(service.webPubSub.hostName!),
        service.resourceGroup,
        service.subscription.subscriptionId
    );

    terminal.sendText(runTunnelCmd);

    const selection = await vscode.window.showInformationMessage(
        "After the local tunnel is started, you could click the button below to open its Web portal",
        ...["Open Local Tunnel Portal", "Ignore"]
    );
    if (selection !== "Ignore") {
        vscode.env.openExternal(vscode.Uri.parse(`http://localhost:4000`));
    }
}

function getTermianl(name: string): vscode.Terminal {
    const sameNameTerminals = vscode.window.terminals.filter((t) => t.name === name);
    return sameNameTerminals.length > 0 ? sameNameTerminals[0] : vscode.window.createTerminal(name);
}

function getLocalTunnelCommand(hubName: string, endpoint: string, resourceGroup: string, subscriptionId: string): string {
    return `awps-tunnel run --hub ${hubName} \
--upstream http://localhost:3000 \
--endpoint ${endpoint} \
--resourceGroup ${resourceGroup} \
--subscription ${subscriptionId}`;
}
