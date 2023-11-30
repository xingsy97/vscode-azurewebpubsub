import { WebPubSubResource } from "@azure/arm-webpubsub";
import { uiUtils } from "@microsoft/vscode-azext-azureutils";
import { IActionContext, callWithTelemetryAndErrorHandling, createContextValue, createSubscriptionContext, nonNullValueAndProp } from "@microsoft/vscode-azext-utils";
import { AzureResource, AzureSubscription } from '@microsoft/vscode-azureresources-api';
import * as vscode from 'vscode';
import { HubsItem, TreeElementBase, WebPubSubModel, createAzureResourceModel, createWebPubSubHubsAPIClient, treeUtils } from ".";
import { WebPubSubHubItem } from "./WebPubSubHubItem";


export class WebPubSubItem implements TreeElementBase {
    static readonly contextValue: string = 'webPubSubItem';
    static readonly contextValueRegExp: RegExp = new RegExp(WebPubSubItem.contextValue);

    id: string;
    resourceGroup: string;
    name: string;

    constructor(public readonly subscription: AzureSubscription, public readonly resource: AzureResource, public readonly webPubSub: WebPubSubModel) {
        this.id = webPubSub.id;
        this.resourceGroup = webPubSub.resourceGroup;
        this.name = webPubSub.name;
    }

    private get contextValue(): string {
        const values: string[] = [];

        // Enable more granular tree item filtering by environment name
        values.push(nonNullValueAndProp(this.webPubSub, 'name'));

        values.push(WebPubSubItem.contextValue);
        return createContextValue(values);
    }

    async getChildren(): Promise<HubsItem[]> {
        const result = await callWithTelemetryAndErrorHandling('getChildren', async (context) => {
            const hubs = await WebPubSubHubItem.List(context, this.subscription, this.resourceGroup, this.name, this.id);
            return hubs
                .map(ca => new WebPubSubHubItem(this.subscription, ca))
                .sort((a, b) => treeUtils.sortById(a, b));
        });

        return result ?? [];
    }

    getTreeItem(): vscode.TreeItem {
        return {
            label: this.webPubSub.name,
            id: this.id,
            iconPath: treeUtils.getIconPath('azure-web-pubsub'),
            contextValue: this.contextValue,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        };
    }

    static isManagedEnvironmentItem(item: unknown): item is WebPubSubItem {
        return typeof item === 'object' &&
            typeof (item as WebPubSubItem).contextValue === 'string' &&
            WebPubSubItem.contextValueRegExp.test((item as WebPubSubItem).contextValue);
    }

    static async List(context: IActionContext, subscription: AzureSubscription): Promise<WebPubSubResource[]> {
        const subContext = createSubscriptionContext(subscription);
        const client = await createWebPubSubHubsAPIClient([context, subContext]);
        return await uiUtils.listAllIterator(client.webPubSub.listBySubscription());
    }

    static async Get(context: IActionContext, subscription: AzureSubscription, resourceGroup: string, name: string): Promise<WebPubSubModel> {
        const subContext = createSubscriptionContext(subscription);
        const client = await createWebPubSubHubsAPIClient([context, subContext]);
        return WebPubSubItem.CreateWebPubSubModel(await client.webPubSub.get(resourceGroup, name));
    }

    private static CreateWebPubSubModel(webPubSub: WebPubSubResource): WebPubSubModel {
        return createAzureResourceModel(webPubSub);
    }
}
