// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { WebPubSubHub } from "@azure/arm-webpubsub";
import { ExecuteActivityContext, IActionContext, ISubscriptionContext } from "@microsoft/vscode-azext-utils";

export interface ICreateHubContext extends IActionContext, ExecuteActivityContext {
    subscription?: ISubscriptionContext;
    resourceGroupName?: string;
    hubName?: string;
    hubSetting?: WebPubSubHub;
}
