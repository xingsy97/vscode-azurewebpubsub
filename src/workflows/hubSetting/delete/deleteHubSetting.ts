/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { AzureWizard, createSubscriptionContext, type IActionContext } from "@microsoft/vscode-azext-utils";
import { ext } from "../../../extensionVariables";
import { HubItem } from "../../../tree/hub/HubItem";
import { pickHub } from "../../../tree/pickitem/pickHub";
import * as utils from "../../../utils";
import { createActivityContext, localize } from "../../../utils";
import { DeleteHubConfirmationStep } from "./DeleteHubConfirmationStep";
import { DeleteHubSettingStep } from "./DeleteHubStep";
import { IDeleteHubSettingContext } from "./IDeleteHubContext";


export async function deleteHubSetting(context: IActionContext, node?: HubItem): Promise<void> {
    const { service, hub: webPubSubHub } = node ?? await pickHub(context, {
        title: localize('deleteWebPubSub', 'Delete Web PubSub Hub'),
    });

    const wizardContext: IDeleteHubSettingContext = {
        ...context,
        ...await createActivityContext(),
        subscription: createSubscriptionContext(service.subscription),
        resourceGroupName: webPubSubHub.resourceGroup,
        hubName: webPubSubHub.hubName,
        webPubSubResourceName: service.name
    };

    const wizard: AzureWizard<IDeleteHubSettingContext> = new AzureWizard(wizardContext, {
        title: localize('deleteHubSetting', 'Delete Hub Setting "{0}"', webPubSubHub.hubName),
        promptSteps: [new DeleteHubConfirmationStep()],
        executeSteps: [new DeleteHubSettingStep()]
    });

    await wizard.prompt();
    wizardContext.activityTitle = utils.localize('deleteWebPubSubHubSetting', 'Delete Web PubSub Hub Setting "{0}"', wizardContext.hubName);
    await ext.state.showDeleting(webPubSubHub.id, async () => {
        await wizard.execute();
    });

    ext.branchDataProvider.refresh();
}
