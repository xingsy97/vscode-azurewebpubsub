/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { AzureWizard, createSubscriptionContext, type IActionContext } from "@microsoft/vscode-azext-utils";
import { ext } from "../../../extensionVariables";
import { WebPubSubItem } from "../../../tree/WebPubSubItem";
import * as utils from "../../../utils";
import { createActivityContext } from "../../../utils";
import { createEndpointFromHostName } from "../../../utils/createUrl";
import { localize } from "../../../utils/localize";
import { pickWebPubSub } from "../../../utils/pickitem/pickWebPubSub";
import { CheckHealthStep } from "./CheckHealthStep";
import { ICheckHealthContext } from "./ICheckHealthContext";

export async function checkHealth(context: IActionContext, node?: WebPubSubItem): Promise<void> {
    const { subscription, webPubSub } = node ?? await pickWebPubSub(context, {
        title: localize('checkHealth', 'Check Web PubSub Health'),
    });

    const wizardContext: ICheckHealthContext = {
        ...context,
        ...await createActivityContext(),
        subscription: createSubscriptionContext(subscription),
        webPubSubName: webPubSub.name,
        resourceGroupName: webPubSub.resourceGroup,
        endpoint: webPubSub.hostName !== undefined ? createEndpointFromHostName(webPubSub.hostName!) : undefined
    };

    const wizard: AzureWizard<ICheckHealthContext> = new AzureWizard(wizardContext, {
        title: localize('checkHealth', 'Check Health of "{0}"', webPubSub.name),
        promptSteps: [],
        executeSteps: [new CheckHealthStep()]
    });

    await wizard.prompt();
    wizardContext.activityTitle = utils.localize('checkHealth', 'Check Health of "{0}"', wizardContext.webPubSubName);
    await ext.state.runWithTemporaryDescription(webPubSub.id, "Checking...", async () => {
        await wizard.execute();
    });

    // ext.branchDataProvider.refresh();
}
