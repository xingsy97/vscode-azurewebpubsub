import { ExecuteActivityContext, IActionContext, ISubscriptionContext } from "@microsoft/vscode-azext-utils";


export interface IDeleteWebPubSubHubWizardContext extends IActionContext, ExecuteActivityContext {
    subscription: ISubscriptionContext;
    resourceName: string;
    resourceGroupName: string;
    webPubSubHubNames: string | string[];
}
