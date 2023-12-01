import { TreeElementBase } from '@microsoft/vscode-azext-utils';
import { AzureSubscription } from '@microsoft/vscode-azureresources-api';
import { WebPubSubHubModel } from "..";


export interface HubsItem extends TreeElementBase {
    subscription: AzureSubscription;
    resourceGroup: string;
    webPubSubName: string;
    webPubSubHub: WebPubSubHubModel;
}
