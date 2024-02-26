/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { AzureWizard, createSubscriptionContext, type IActionContext } from "@microsoft/vscode-azext-utils";
import  { type IPickServiceContext } from "src/workflows/common/contexts";
import { ext } from "../../../extensionVariables";
import { pickService } from "../../../tree/pickitem/pickService";
import  { type ServiceItem } from "../../../tree/service/ServiceItem";
import * as utils from "../../../utils";
import { createActivityContext, localize } from "../../../utils";
import { OpenLiveTraceToolStep } from "./OpenLiveTraceToolStep";

export async function openLiveTraceTool(context: IActionContext, node?: ServiceItem): Promise<void> {
    const { subscription, webPubSub } = node ?? await pickService(context, {
        title: localize('openLiveTraceTool', 'Open LiveTrace Tool'),
    });

    const wizardContext: IPickServiceContext = {
        ...context,
        ...await createActivityContext(),
        subscription: createSubscriptionContext(subscription),
        webPubSubName: webPubSub.name,
        resourceGroupName: webPubSub.resourceGroup
    };

    const wizard: AzureWizard<IPickServiceContext> = new AzureWizard(wizardContext, {
        title: localize('openLiveTraceTool', 'Open LiveTrace Tool of "{0}"', webPubSub.name),
        promptSteps: [],
        executeSteps: [new OpenLiveTraceToolStep()]
    });

    await wizard.prompt();
    wizardContext.activityTitle = utils.localize('openLiveTraceTool', 'Open LiveTrace Tool of "{0}"', wizardContext.webPubSubName);
    await ext.state.runWithTemporaryDescription(webPubSub.id, "Retrieving Endpoint...", async () => {
        await wizard.execute();
    });

    // ext.branchDataProvider.refresh();
}
