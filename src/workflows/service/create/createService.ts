import  { type ResourceSku} from "@azure/arm-webpubsub";
import { WebPubSubManagementClient } from "@azure/arm-webpubsub";
import { LocationListStep, ResourceGroupListStep, VerifyProvidersStep, createAzureClient } from "@microsoft/vscode-azext-azureutils";
import  { type AzureWizardExecuteStep, type AzureWizardPromptStep, type IActionContext} from "@microsoft/vscode-azext-utils";
import { AzureWizard, azureResourceExperience, createSubscriptionContext, subscriptionExperience } from "@microsoft/vscode-azext-utils";
import  { type AzureSubscription } from "@microsoft/vscode-azureresources-api";
import * as vscode from "vscode";
import { signalrProvider, webPubSubWebProvider } from "../../../constants";
import { ext } from "../../../extensionVariables";
import  { type ServiceItem } from "../../../tree/service/ServiceItem";
import * as utils from "../../../utils";
import { createActivityContext } from "../../../utils";
import { createHubSetting } from "../../hubSetting/create/createHubSetting";
import { CreateServiceStep } from "./CreateServiceStep";
import  { type ICreateServiceContext } from "./ICreateServiceContext";
import { InputSerivceSkuUnitCountStep } from "./InputSerivceSkuUnitCountStep";
import { InputServiceKindStep } from "./InputServiceKindStep";
import { InputServiceNameStep } from "./InputServiceNameStep";
import { InputServiceSkuTierStep } from "./InputServiceSkuTierStep";


export async function createService(context: IActionContext, node?: { subscription: AzureSubscription; }): Promise<void> {
    const tdp = ext.rgApiV2.resources.azureResourceTreeDataProvider;
    const selectKindContext: any = { ...context, kind: "" };
    const inputServiceKind = new InputServiceKindStep();
    await inputServiceKind.prompt(selectKindContext);

    const subscription = node?.subscription ?? await subscriptionExperience(context, tdp);
    const promptSteps: AzureWizardPromptStep<ICreateServiceContext>[] = [
        new ResourceGroupListStep(),
        new InputServiceNameStep(),
        new InputServiceSkuTierStep(),
        new InputSerivceSkuUnitCountStep(),
    ];

    const wizardContext: ICreateServiceContext = {
        ...context,
        ...createSubscriptionContext(subscription),
        ...(await createActivityContext()),
        kind: selectKindContext["kind"],
        Sku: {
            sku: {
                name: "",
                tier: "",
                capacity: 0
            } as ResourceSku
        },
    };

    const title: string = utils.localize('createWebPubSub', "Create Web PubSub");

    const subContext = createSubscriptionContext(subscription);
    const client: WebPubSubManagementClient = createAzureClient([context, subContext], WebPubSubManagementClient);

    const executeSteps: AzureWizardExecuteStep<ICreateServiceContext>[] = [
        new VerifyProvidersStep([webPubSubWebProvider]),
        new CreateServiceStep(client),
    ];

    // LocationListStep.addProviderForFiltering(wizardContext, webPubSubProvider, webPubSubId);
    // LocationListStep.addStep(wizardContext, promptSteps);

    const wizard: AzureWizard<ICreateServiceContext> = new AzureWizard(wizardContext, {
        title,
        promptSteps,
        executeSteps,
        showLoadingPrompt: true
    });

    await wizard.prompt();

    wizardContext.location = (await LocationListStep.getLocation(wizardContext, signalrProvider)).name ?? wizardContext.resourceGroup!.location;

    wizardContext.activityTitle = utils.localize('createWebPubSub', 'Create Azure Web PubSub "{0}"', wizardContext.webPubSubName);
    await wizard.execute();
    ext.branchDataProvider.refresh();

    const message = "\
Successfully created Web PubSub resource. \
You will need to: \
1. Create a hub setting. \
2. Start local tunnel or other tool to enable deployment or test. \n\
Click button to create a hub setting.";
    vscode.window.showInformationMessage(
        message,
        ...["Create a hub", "Ignore"]
    ).then(async (selection) => {
        if (selection !== "Ignore") {
            const serviceItem: ServiceItem = await azureResourceExperience(context, tdp, webPubSubWebProvider as any);
            createHubSetting(context, serviceItem);
            vscode.window.showInformationMessage(`Create hub setting for ${wizardContext.webPubSubName}`);
        }
    });
}
