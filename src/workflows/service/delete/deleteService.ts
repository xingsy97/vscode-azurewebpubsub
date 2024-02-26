/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { AzureWizard, createSubscriptionContext, type IActionContext } from "@microsoft/vscode-azext-utils";
import  { type IPickServiceContext } from "src/workflows/common/contexts";
import { ext } from "../../../extensionVariables";
import { pickService } from "../../../tree/pickitem/pickService";
import  { type ServiceItem } from "../../../tree/service/ServiceItem";
import { createActivityContext, localize } from "../../../utils";
import { DeleteServiceConfirmStep } from "./DeleteServiceConfirmStep";
import { DeleteServiceStep } from "./DeleteServiceStep";

export async function deleteService(context: IActionContext, node?: ServiceItem): Promise<void> {
    const { subscription, webPubSub } = node ?? await pickService(context, {
        title: localize('deleteWebPubSub', 'Delete Web PubSub Service'),
    });

    const wizardContext: IPickServiceContext = {
        ...context,
        ...await createActivityContext(),
        subscription: createSubscriptionContext(subscription),
        resourceGroupName: webPubSub.resourceGroup,
        webPubSubName: webPubSub.name
    };

    const wizard: AzureWizard<IPickServiceContext> = new AzureWizard(wizardContext, {
        title: localize('deleteWebPubSub', 'Delete Web PubSub Service "{0}"', webPubSub.name),
        promptSteps: [new DeleteServiceConfirmStep()],
        executeSteps: [new DeleteServiceStep()]
    });

    await wizard.prompt();

    await ext.state.showDeleting(webPubSub.id, async () => {
        await wizard.execute();
    });

    ext.branchDataProvider.refresh();
}
