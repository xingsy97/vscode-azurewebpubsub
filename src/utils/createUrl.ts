/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { OpenInPortalOptions } from "@microsoft/vscode-azext-azureutils";
import { AzureSubscription } from '@microsoft/vscode-azureresources-api';
import * as vscode from 'vscode';

export function createPortalUrl(subscription: AzureSubscription, id: string, options?: OpenInPortalOptions): vscode.Uri {
    const queryPrefix: string = (options && options.queryPrefix) ? `?${options.queryPrefix}` : '';
    const url: string = `${subscription.environment.portalUrl}/${queryPrefix}#@${subscription.tenantId}/resource${id}`;

    return vscode.Uri.parse(url);
}

export function createLiveTraceToolUrl(location: string, endpoint: string, accessToken: string): vscode.Uri {
    const protocol = "https";
    const serviceType = "wps"; // In portal, Socket.IO resource also use "wps". Not sure it's bug or not.
    const liveTradeDomain = `${location}.livetrace.webpubsub.azure.com`;
    const state: {} = {
        negotiation: {
            "url": `${endpoint}/livetrace`,
            "accessToken": accessToken
        },
        serviceType: serviceType,
        authType: "key"
    }
    const url = `${protocol}://${liveTradeDomain}?state=${JSON.stringify(state)}`;
    return vscode.Uri.parse(url);
    //https://eastus.livetrace.webpubsub.azure.com/?state={"negotiation":{"url":"https://search-demo-wps-temp.webpubsub.azure.com/livetrace","accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL3NlYXJjaC1kZW1vLXdwcy10ZW1wLndlYnB1YnN1Yi5henVyZS5jb20vbGl2ZXRyYWNlIiwiaWF0IjoxNzAxNDMzOTg3LCJleHAiOjE3MDE0NDExODd9.ncvVpeefkHwBAitjQkta4Pd1VYN_yGreJDsOs4Rl8fE"},"serviceType":"wps","authType":"key"}
}

export function createEndpointFromHostName(hostName: string, protocol: "http" | "https" = "https"): string {
    return `${protocol}://${hostName}`;
}

