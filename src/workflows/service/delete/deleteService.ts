/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { AzureWizard, createSubscriptionContext, type IActionContext } from "@microsoft/vscode-azext-utils";
import { ext } from "../../../extensionVariables";
import { WebPubSubItem } from "../../../tree/WebPubSubItem";
import { createActivityContext } from "../../../utils";
import { localize } from "../../../utils/localize";
import { pickWebPubSub } from "../../../utils/pickitem/pickWebPubSub";
import { IPickWebPubSubContext } from "../../common/IPickWebPubSubContext";
import { DeleteServiceConfirmStep } from "./DeleteServiceConfirmStep";
import { DeleteServiceStep } from "./DeleteServiceStep";

export async function deleteService(context: IActionContext, node?: WebPubSubItem): Promise<void> {
    const { subscription, webPubSub } = node ?? await pickWebPubSub(context, {
        title: localize('deleteWebPubSub', 'Delete Web PubSub'),
    });

    const wizardContext: IPickWebPubSubContext = {
        ...context,
        ...await createActivityContext(),
        subscription: createSubscriptionContext(subscription),
        resourceGroupName: webPubSub.resourceGroup,
        webPubSubName: webPubSub.name
    };

    const wizard: AzureWizard<IPickWebPubSubContext> = new AzureWizard(wizardContext, {
        title: localize('deleteWebPubSub', 'Delete Web PubSub "{0}"', webPubSub.name),
        promptSteps: [new DeleteServiceConfirmStep()],
        executeSteps: [new DeleteServiceStep()]
    });

    await wizard.prompt();

    await ext.state.showDeleting(webPubSub.id, async () => {
        await wizard.execute();
    });

    ext.branchDataProvider.refresh();
}
