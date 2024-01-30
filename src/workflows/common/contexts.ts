/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { EventHandler, KeyType } from "@azure/arm-webpubsub";
import { ExecuteActivityContext, IActionContext, ISubscriptionContext } from "@microsoft/vscode-azext-utils";

export interface IPickServiceContext extends IActionContext, ExecuteActivityContext {
    subscription?: ISubscriptionContext;
    resourceGroupName?: string;
    webPubSubName?: string;
}

export interface IPickHubContext extends IPickServiceContext {
    subscription?: ISubscriptionContext;
    resourceGroupName?: string;
    webPubSubResourceName?: string;
    hubName?: string;
}

export interface IPickEventHandlerContext extends IPickHubContext {
    eventHandlerSetting: EventHandler;
}

export interface IPickKeyContext extends IPickServiceContext {
    keyType?: KeyType;
}

