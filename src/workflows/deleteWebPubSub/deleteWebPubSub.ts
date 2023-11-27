/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { AzureWizard, createSubscriptionContext, type IActionContext } from "@microsoft/vscode-azext-utils";
import { ext } from "../../extensionVariables";
import { WebPubSubItem } from "../../model";
import { createActivityContext } from "../../utils";
import { localize } from "../../utils/localize";
import { pickWebPubSub } from "../../utils/pickitem/ItemPicker";
import { DeleteWebPubSubConfirmationStep } from "./DeleteWebPubSubConfirmationStep";
import { DeleteWebPubSubStep } from "./DeleteWebPubSubStep";
import { IDeleteWebPubSubContext } from "./IDeleteWebPubSubContext";

export async function deleteWebPubSub(context: IActionContext, node?: WebPubSubItem): Promise<void> {
    const { subscription, webPubSub } = node ?? await pickWebPubSub(context, {
        title: localize('deleteWebPubSub', 'Delete Web PubSub'),
    });

    const resourceGroupName = getResourceGroupFromId(webPubSub.id);

    const wizardContext: IDeleteWebPubSubContext = {
        ...context,
        ...await createActivityContext(),
        subscription: createSubscriptionContext(subscription),
        resourceGroupName: resourceGroupName,
        webPubSubName: webPubSub.name
    };

    const wizard: AzureWizard<IDeleteWebPubSubContext> = new AzureWizard(wizardContext, {
        title: localize('deleteWebPubSub', 'Delete Web PubSub "{0}"', webPubSub.name),
        promptSteps: [new DeleteWebPubSubConfirmationStep()],
        executeSteps: [new DeleteWebPubSubStep()]
    });

    await wizard.prompt();

    await ext.state.showDeleting(webPubSub.id, async () => {
        await wizard.execute();
    });

    ext.branchDataProvider.refresh();
}
