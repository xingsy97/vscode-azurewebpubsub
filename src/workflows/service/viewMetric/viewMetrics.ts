/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { AzureWizard, createSubscriptionContext, type IActionContext } from "@microsoft/vscode-azext-utils";
import { IPickMetricsContext, IPickServiceContext } from "src/workflows/common/contexts";
import { pickService } from "../../../tree/pickitem/pickService";
import { ServiceItem } from "../../../tree/service/ServiceItem";
import * as utils from "../../../utils";
import { createActivityContext, localize } from "../../../utils";
import { InputAggregationTypeStep } from "./InputAggregationTypeStep";
import { InputMetricNameStep } from "./InputMetricNameStep";
import { InputTimespanStep } from "./InputTimespanStep";
import { ViewMetricStep } from "./ViewMetricsStep";

export async function viewMetrics(context: IActionContext, node?: ServiceItem): Promise<void> {
    const { subscription, webPubSub } = node ?? await pickService(context, {
        title: localize('viewMetric', 'View Metric'),
    });

    const wizardContext: IPickMetricsContext = {
        ...context,
        ...await createActivityContext(),
        subscription: createSubscriptionContext(subscription),
        webPubSubName: webPubSub.name,
        resourceGroupName: webPubSub.resourceGroup
    };

    const wizard: AzureWizard<IPickServiceContext> = new AzureWizard(wizardContext, {
        title: localize('selectMetricAndAggregationType', 'Select metric and aggregation type'),
        promptSteps: [new InputTimespanStep(), new InputMetricNameStep(), new InputAggregationTypeStep()],
        executeSteps: [new ViewMetricStep()]
    });

    await wizard.prompt();
    wizardContext.activityTitle = utils.localize('viewMetric', 'View Metric of "{0}"', wizardContext.webPubSubName);
    await wizard.execute();
}