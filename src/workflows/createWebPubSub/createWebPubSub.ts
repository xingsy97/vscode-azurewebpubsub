import { ResourceSku, WebPubSubManagementClient } from "@azure/arm-webpubsub";
import { LocationListStep, ResourceGroupListStep, VerifyProvidersStep, createAzureClient } from "@microsoft/vscode-azext-azureutils";
import { AzureWizard, AzureWizardExecuteStep, AzureWizardPromptStep, IActionContext, createSubscriptionContext, subscriptionExperience } from "@microsoft/vscode-azext-utils";
import { AzureSubscription } from "@microsoft/vscode-azureresources-api";
import { webPubSubId, webPubSubProvider } from "../../constants";
import { ext } from "../../extensionVariables";
import * as utils from "../../utils";
import { createActivityContext } from "../../utils";
import { CreateWebPubSubStep } from "./CreateWebPubSubStep";
import { IWebPubSubCreationWizardContext } from "./IWebPubSubCreationWizardContext";
import { InputWebPubSubNameStep, InputWebPubSubSkuTierListStep, InputWebPubSubSkuUnitCountListStep } from "./InputWebPubSubNameStep";

export async function helloWorld(context: IActionContext): Promise<void> {
    context.ui.showWarningMessage("hello ZZZ");
}

export async function createWebPubSub(context: IActionContext, node?: { subscription: AzureSubscription }): Promise<void> {
    const tdp = ext.rgApiV2.resources.azureResourceTreeDataProvider;
    const subscription = node?.subscription ?? await subscriptionExperience(context, tdp);

    const wizardContext: IWebPubSubCreationWizardContext = {
        ...context,
        ...createSubscriptionContext(subscription),
        ...(await createActivityContext()),
        Sku: {
            sku: {
                name: "",
                tier: "",
                capacity: 0
            } as ResourceSku
        }
    };

    const title: string = utils.localize('createWebPubSub', "Create Web PubSub");

    const promptSteps: AzureWizardPromptStep<IWebPubSubCreationWizardContext>[] = [
        new InputWebPubSubNameStep(),
        new ResourceGroupListStep(),
        new InputWebPubSubSkuTierListStep(),
        new InputWebPubSubSkuUnitCountListStep(),
    ];

    const subContext = createSubscriptionContext(subscription);
    const client: WebPubSubManagementClient = createAzureClient([context, subContext], WebPubSubManagementClient);

    const executeSteps: AzureWizardExecuteStep<IWebPubSubCreationWizardContext>[] = [
        new VerifyProvidersStep([webPubSubProvider]),
        // new ResourceGroupCreateStep<IWebPubSubCreationWizardContext>(),
        new CreateWebPubSubStep(client),
    ];

    LocationListStep.addProviderForFiltering(wizardContext, webPubSubProvider, webPubSubId);
    LocationListStep.addStep(wizardContext, promptSteps);

    const wizard: AzureWizard<IWebPubSubCreationWizardContext> = new AzureWizard(wizardContext, {
        title,
        promptSteps,
        executeSteps,
        showLoadingPrompt: true
    });

    await wizard.prompt();
    wizardContext.activityTitle = utils.localize('createWebPubSub', 'Create Azure Web PubSub "{0}"', wizardContext.webPubSubName);
    await wizard.execute();
}