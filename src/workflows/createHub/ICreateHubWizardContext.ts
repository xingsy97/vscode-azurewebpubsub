/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { WebPubSubHub } from "@azure/arm-webpubsub";
import { ExecuteActivityContext, IActionContext, ISubscriptionContext } from "@microsoft/vscode-azext-utils";

export interface ICreateHubContext extends IActionContext, ExecuteActivityContext {
    subscription?: ISubscriptionContext;
    resourceGroupName?: string;
    webPubSubResourceName?: string;
    hubName?: string;
    hubSetting?: WebPubSubHub;
}
