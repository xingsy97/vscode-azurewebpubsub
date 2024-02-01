/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { AggregationType } from "@azure/arm-monitor";
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

export type MetricName = string;
export enum KnownMetricNameEnum {
    ServerLoad = "ServerLoad",
    InboundTraffic = "InboundTraffic",
    OutboundTraffic = "OutboundTraffic",
    ConnectionQuotaUtilization = "ConnectionQuotaUtilization",
    ConnectionCount = "ConnectionCount",
    ConnectionOpenCount = "ConnectionOpenCount",
    ConnectionCloseCount = "ConnectionCloseCount",
}

export interface IPickMetricsContext extends IPickServiceContext {
    startTime?: Date;
    endTime?: Date;
    metricName?: MetricName;
    aggregationType?: AggregationType;
}

export interface IPickEventHandlerContext extends IPickHubContext {
    eventHandlerSetting: EventHandler;
}

export interface IPickKeyContext extends IPickServiceContext {
    keyType?: KeyType;
}

