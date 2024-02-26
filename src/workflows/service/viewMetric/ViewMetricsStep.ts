/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import  { type AggregationType } from "@azure/arm-monitor";
import { AzureWizardExecuteStep, parseError } from "@microsoft/vscode-azext-utils";
import  { type IPickKeyContext, type IPickMetricsContext, type MetricName } from "src/workflows/common/contexts";
import * as vscode from "vscode";
import { ext } from "../../../extensionVariables";
import { createWebPubSubHubsAPIClient, localize } from '../../../utils';

const getTimeContext = (startTime: Date, endTime: Date) => {
    // {"absolute":{"startTime":"2024-01-29T14:07:20.011Z","endTime":"2024-01-30T03:16:45.931Z"},"showUTCTime":false,"grain":1}
    return { "absolute": { "startTime": startTime.toISOString(), "endTime": endTime.toISOString() }, "showUTCTime": false, "grain": 1 }
}

const getChartDefinitionContext = (resourceName: string, resourceId: string, metricName: MetricName, aggregationType: AggregationType) => {
    const metricDisplayName = metricName.replace(/(?<!^)([A-Z])/g, ' $1'); // "ServerLoad" -> "Server Load"
    const chartTitle = `${aggregationType} ${metricDisplayName} for ${resourceName}`;
    return {
        "v2charts": [{
            "metrics": [
                {
                    "resourceMetadata": {
                        "id": resourceId,
                    },
                    "name": metricName,
                    "aggregationType": 3,
                    "namespace": "microsoft.signalrservice/webpubsub",
                    "metricVisualization": { "displayName": metricDisplayName },
                }
            ],
            "title": chartTitle,
            "titleKind": 1,
            "visualization": {
                "chartType": 2,
                "legendVisualization": {
                    "isVisible": true,
                    "position": 2,
                    "hideSubtitle": false
                },
                "axisVisualization": {
                    "x": { "isVisible": true, "axisType": 2 },
                    "y": { "isVisible": true, "axisType": 1 }
                }
            }
        }
        ]
    }
}

const getMetricPortalUrl = (resourceName: string, resourceId: string, startTime: Date, endTime: Date, metricName: MetricName, aggregationType: AggregationType) => {
    const timeContext = getTimeContext(startTime, endTime);
    const chartDefinitionContext = getChartDefinitionContext(resourceName, resourceId, metricName, aggregationType);
    let url = "https://ms.portal.azure.com/#@microsoft.onmicrosoft.com/blade/Microsoft_Azure_MonitoringMetrics/Metrics.ReactView/Referer/MetricsExplorer/ResourceId/";
    url += encodeURIComponent(resourceId);
    url += `/TimeContext/${encodeURIComponent(JSON.stringify(timeContext))}`;
    url += `/ChartDefinition/${encodeURIComponent(JSON.stringify(chartDefinitionContext))}`;
    return url;
}

export class ViewMetricStep extends AzureWizardExecuteStep<IPickMetricsContext> {
    public priority: number = 110;

    public async execute(context: IPickMetricsContext, progress: vscode.Progress<{ message?: string | undefined; increment?: number | undefined }>): Promise<void> {
        const client = await createWebPubSubHubsAPIClient([context, context.subscription!]);
        // const monitorClient = await createMonitorAPIClient([context, context.subscription!]);
        progress.report({ message: localize('takeSeveralSeconds', 'This may take several seconds...') });

        if (!context.webPubSubName || !context.resourceGroupName || !context.aggregationType || !context.metricName || !context.startTime || !context.endTime) {
            throw new Error(localize(
                'invalidCopyConnectionStringParms',
                `Failed to copy connection string of "${context.webPubSubName}" in resource group "${context.resourceGroupName}"`)
            );
        }
        try {
            const resourceId = `/subscriptions/${context.subscription?.subscriptionPath}/resourceGroups/${context.resourceGroupName}/providers/Microsoft.SignalRService/WebPubSub/${context.webPubSubName}`;
            const metricsProtalUri = getMetricPortalUrl(
                context.webPubSubName,
                resourceId,
                context.startTime!,
                context.endTime!,
                context.metricName!,
                context.aggregationType!
            );
            // Ref: https://github.com/microsoft/vscode/issues/135949#issuecomment-989333270
            await vscode.env.openExternal(metricsProtalUri as any);
            /*
            const metrics = await monitorClient.metrics.list(resourceId, {metricnames: "ServerLoad", timespan: "2024-01-29T08:30:00Z/2024-01-30T08:30:00Z",});
            for (const metric of metrics.value) {
                for (const timeseries of metric.timeseries!) {
                    for (const data of timeseries.data!) {
                        ext.outputChannel.appendLog(data.maximum!.toString());
                    }
                }
            }
            */
        } catch (error) {
            const pError = parseError(error);
            if (Number(pError.errorType) < 200 || Number(pError.errorType) >= 300) {
                throw error;
            }
        }
        ext.outputChannel.appendLog(`Copied connection of "${context.webPubSubName}" in resource group "${context.resourceGroupName}" to clipboard.`);
    }

    public shouldExecute(context: IPickKeyContext): boolean {
        return true;
    }
}
