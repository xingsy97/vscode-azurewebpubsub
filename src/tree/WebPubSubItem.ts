import { WebPubSubResource } from "@azure/arm-webpubsub";
import { getResourceGroupFromId, uiUtils } from "@microsoft/vscode-azext-azureutils";
import { IActionContext, TreeElementBase, callWithTelemetryAndErrorHandling, createContextValue, createSubscriptionContext, nonNullValueAndProp } from "@microsoft/vscode-azext-utils";
import { AzureResource, AzureSubscription } from '@microsoft/vscode-azureresources-api';
import * as vscode from 'vscode';
import { WebPubSubModel, createWebPubSubHubsAPIClient, treeUtils } from ".";
import { HubItem } from "./hub/HubItem";
import { HubsItem } from "./hub/HubsItem";


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
            const hubs = await HubItem.List(context, this.subscription, this.resourceGroup, this.name, this.id);
            return hubs
                .map(hub => new HubItem(this.subscription, this.resourceGroup, this.name, hub))
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
            tooltip: `Web PubSub resource ${this.webPubSub.name}`
        };
    }

    static isWebPubSubItem(item: unknown): item is WebPubSubItem {
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
        return WebPubSubItem.CreateWebPubSubModel(await client.webPubSub.get(resourceGroup, name), name);
    }

    private static CreateWebPubSubModel(webPubSub: WebPubSubResource, webPubSubname: string): WebPubSubModel {
        if (!webPubSub.id) {
            throw new Error(`Invalid webPubSub.id: ${webPubSub.id}`);
        }
        return {
            name: webPubSubname,
            resourceGroup: getResourceGroupFromId(webPubSub.id),
            id: webPubSub.id,
            ...webPubSub
        }
        // return createAzureResourceModel(webPubSub);
    }
}
