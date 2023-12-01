/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { AzureWizard, createSubscriptionContext, type IActionContext } from "@microsoft/vscode-azext-utils";
import { ext } from "../../../extensionVariables";
import { ServiceItem } from "../../../tree/service/ServiceItem";
import * as utils from "../../../utils";
import { createActivityContext } from "../../../utils";
import { createEndpointFromHostName } from "../../../utils/createUrl";
import { localize } from "../../../utils/localize";
import { pickService } from "../../../utils/pickitem/pickService";
import { CopyEndpointStep } from "./CopyEndpointStep";
import { ICopyEndpointContext } from "./ICopyEndpointContext";

export async function copyEndpoint(context: IActionContext, node?: ServiceItem): Promise<void> {
    const { subscription, webPubSub } = node ?? await pickService(context, {
        title: localize('copyEndpoint', 'Copy Endpoint'),
    });

    const wizardContext: ICopyEndpointContext = {
        ...context,
        ...await createActivityContext(),
        subscription: createSubscriptionContext(subscription),
        webPubSubName: webPubSub.name,
        resourceGroupName: webPubSub.resourceGroup,
        endpoint: webPubSub.hostName !== undefined ? createEndpointFromHostName(webPubSub.hostName!) : undefined
    };

    const wizard: AzureWizard<ICopyEndpointContext> = new AzureWizard(wizardContext, {
        title: localize('copyEndpoint', 'Copy Endpoint of "{0}"', webPubSub.name),
        promptSteps: [],
        executeSteps: [new CopyEndpointStep()]
    });

    await wizard.prompt();
    wizardContext.activityTitle = utils.localize('copyEndpoint', 'Copy Endpoint of "{0}"', wizardContext.webPubSubName);
    await ext.state.runWithTemporaryDescription(webPubSub.id, "Retrieving Endpoint...", async () => {
        await wizard.execute();
    });

    // ext.branchDataProvider.refresh();
}
