/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { WebPubSubManagementClient } from "@azure/arm-webpubsub";
import { AzExtClientContext, createAzureClient } from "@microsoft/vscode-azext-azureutils";
import { IActionContext, createSubscriptionContext } from "@microsoft/vscode-azext-utils";
import { AzureSubscription } from "@microsoft/vscode-azureresources-api";

export async function createWebPubSubHubsAPIClient(context: AzExtClientContext): Promise<WebPubSubManagementClient> {
    return createAzureClient(context, WebPubSubManagementClient);
}

export async function createWebPubSubHubsClient(context: IActionContext, subscription: AzureSubscription): Promise<WebPubSubManagementClient> {
    return createWebPubSubHubsAPIClient([context, createSubscriptionContext(subscription)]);
}

