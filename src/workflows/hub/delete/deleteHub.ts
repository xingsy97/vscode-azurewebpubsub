/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { AzureWizard, createSubscriptionContext, type IActionContext } from "@microsoft/vscode-azext-utils";
import { ext } from "../../../extensionVariables";
import { HubItem } from "../../../tree/hub/HubItem";
import * as utils from "../../../utils";
import { createActivityContext } from "../../../utils";
import { localize } from "../../../utils/localize";
import { pickHub } from "../../../utils/pickitem/pickHub";
import { DeleteHubConfirmationStep } from "./DeleteHubConfirmationStep";
import { DeleteHubStep } from "./DeleteHubStep";
import { IDeleteHubContext } from "./IDeleteHubContext";


export async function deleteHub(context: IActionContext, node?: HubItem): Promise<void> {
    const { subscription, webPubSubName, webPubSubHub } = node ?? await pickHub(context, {
        title: localize('deleteWebPubSub', 'Delete Web PubSub'),
    });

    const wizardContext: IDeleteHubContext = {
        ...context,
        ...await createActivityContext(),
        subscription: createSubscriptionContext(subscription),
        hubName: webPubSubHub.hubName,
        webPubSubResourceName: webPubSubName,
        resourceGroupName: webPubSubHub.resourceGroup
    };

    const wizard: AzureWizard<IDeleteHubContext> = new AzureWizard(wizardContext, {
        title: localize('deleteHub', 'Delete Hub "{0}"', webPubSubHub.hubName),
        promptSteps: [new DeleteHubConfirmationStep()],
        executeSteps: [new DeleteHubStep()]
    });

    await wizard.prompt();
    wizardContext.activityTitle = utils.localize('deleteWebPubSubHub', 'Delete Web PubSub Hub "{0}"', wizardContext.hubName);
    await ext.state.showDeleting(webPubSubHub.id, async () => {
        await wizard.execute();
    });

    ext.branchDataProvider.refresh();
}
