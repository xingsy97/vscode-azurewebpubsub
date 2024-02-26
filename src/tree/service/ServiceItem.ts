import  { type WebPubSubResource } from "@azure/arm-webpubsub";
import { KnownServiceKind } from "@azure/arm-webpubsub";
import { getResourceGroupFromId, uiUtils } from "@microsoft/vscode-azext-azureutils";
import  { type IActionContext, type TreeElementBase, type TreeItemIconPath} from "@microsoft/vscode-azext-utils";
import { createContextValue, createSubscriptionContext } from "@microsoft/vscode-azext-utils";
import  { type AzureResource, type AzureSubscription, type ViewPropertiesModel } from '@microsoft/vscode-azureresources-api';
import * as vscode from 'vscode';
import { createWebPubSubHubsAPIClient } from "../../utils";
import { HubsItem } from "../hub/HubsItem";
import  { type WebPubSubModel } from "../models";
import { treeUtils } from "../treeUtils";
import { ServicePropertiesItem } from "./ServicePropertiesItem";


export class ServiceItem implements TreeElementBase {
    static readonly contextValue: string = 'webPubSubItem';
    static readonly contextValueRegExp: RegExp = new RegExp(ServiceItem.contextValue);

    id: string;
    resourceGroup: string;
    name: string;
    hubs: HubsItem;
    properties: ServicePropertiesItem;

    constructor(public readonly subscription: AzureSubscription, public readonly resource: AzureResource, public readonly webPubSub: WebPubSubModel) {
        this.id = webPubSub.id;
        this.resourceGroup = webPubSub.resourceGroup;
        this.name = webPubSub.name;
        this.hubs = new HubsItem(this);
        this.properties = new ServicePropertiesItem(this.webPubSub);
    }

    viewProperties: ViewPropertiesModel = {
        data: this.webPubSub,
        label: `Properties`
    };

    private get contextValue(): string {
        const values: string[] = [];

        // Enable more granular tree item filtering by environment name
        // values.push(nonNullValueAndProp(this.webPubSub, 'name'));

        values.push(ServiceItem.contextValue);
        return createContextValue(values);
    }

    async getChildren(): Promise<TreeElementBase[]> {
        return [this.hubs, this.properties];
    }

    get iconPath(): TreeItemIconPath {
        return treeUtils.getIconPath(this.webPubSub.kind === KnownServiceKind.WebPubSub ? 'azure-web-pubsub' : 'azure-web-pubsub-socketio');
    }

    getTreeItem(): vscode.TreeItem {
        return {
            label: this.webPubSub.name,
            id: this.id,
            iconPath: this.iconPath,
            contextValue: this.contextValue,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            tooltip: `${this.webPubSub.name}, ${this.webPubSub.sku?.tier} ${this.webPubSub.sku?.capacity} units, ${this.webPubSub.location}`,
        };
    }

    static isWebPubSubItem(item: unknown): item is ServiceItem {
        return typeof item === 'object' &&
            typeof (item as ServiceItem).contextValue === 'string' &&
            ServiceItem.contextValueRegExp.test((item as ServiceItem).contextValue);
    }

    static async List(context: IActionContext, subscription: AzureSubscription): Promise<WebPubSubResource[]> {
        const subContext = createSubscriptionContext(subscription);
        const client = await createWebPubSubHubsAPIClient([context, subContext]);
        return await uiUtils.listAllIterator(client.webPubSub.listBySubscription());
    }

    static async Get(context: IActionContext, subscription: AzureSubscription, resourceGroup: string, name: string): Promise<WebPubSubModel> {
        const subContext = createSubscriptionContext(subscription);
        const client = await createWebPubSubHubsAPIClient([context, subContext]);
        return ServiceItem.CreateWebPubSubModel(await client.webPubSub.get(resourceGroup, name), name);
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
