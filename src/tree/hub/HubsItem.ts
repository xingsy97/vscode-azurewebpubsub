import { uiUtils } from "@microsoft/vscode-azext-azureutils";
import { IActionContext, TreeElementBase, callWithTelemetryAndErrorHandling, createContextValue, createSubscriptionContext } from "@microsoft/vscode-azext-utils";
import { AzureSubscription, type ViewPropertiesModel } from '@microsoft/vscode-azureresources-api';
import * as vscode from 'vscode';
import { ThemeIcon } from "vscode";
import { createWebPubSubHubsAPIClient } from "../../utils/createControlPlaneClient";
import { CreateWebPubSubHubModel, WebPubSubHubModel } from "../models";
import { ServiceItem } from "../service/ServiceItem";
import { treeUtils } from "../treeUtils";
import { HubItem } from "./HubItem";

export class HubsItem implements TreeElementBase {
    static readonly contextValue: string = 'webPubSubHubsItem';
    static readonly contextValueRegExp: RegExp = new RegExp(HubsItem.contextValue);
    // Note: DO NOT remove this, otherwise `pickWebPubSub` will be parsed with null `subscription`
    public subscription: AzureSubscription;

    constructor(public readonly service: ServiceItem) {
        this.subscription = service.subscription;
    }

    viewProperties: ViewPropertiesModel = {
        data: {},
        label: `Hubs`
    };

    // portalUrl: vscode.Uri = createPortalUrl(this.subscription, this.webPubSubHub.id);

    private get contextValue(): string {
        const values: string[] = [HubsItem.contextValue];

        // Enable more granular tree item filtering by container app name
        // values.push(nonNullValueAndProp(this.service, 'name'));

        // values.push(this.webPubSubHub.revisionsMode === KnownActiveRevisionsMode.Single ? revisionModeSingleContextValue : revisionModeMultipleContextValue);
        // values.push(this.hasUnsavedChanges() ? unsavedChangesTrueContextValue : unsavedChangesFalseContextValue);
        return createContextValue(values);
    }

    private get description(): string | undefined {
        return undefined;
    }

    async getChildren(): Promise<TreeElementBase[]> {
        let childs: TreeElementBase[] = [];
        const hubChilds = await callWithTelemetryAndErrorHandling('getChildren', async (context) => {
            const hubs = await this.List(context);
            return hubs
                .map(hub => new HubItem(this.service, hub))
                .sort((a, b) => treeUtils.sortById(a, b));
        });
        if (hubChilds) childs = childs.concat(hubChilds);
        return childs;
    }

    getTreeItem(): vscode.TreeItem {
        return {
            label: `Hubs`,
            iconPath: new ThemeIcon("server"),
            contextValue: this.contextValue,
            description: this.description,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        };
    }

    static isHubsItem(item: unknown): item is HubItem {
        return typeof item === 'object' &&
            typeof (item as HubsItem).contextValue === 'string' &&
            HubItem.contextValueRegExp.test((item as HubsItem).contextValue);
    }

    static async getHubs(context: IActionContext, subscription: AzureSubscription, resourceGroup: string, resourceName: string, webPubSubId: string) {
        const subContext = createSubscriptionContext(subscription);
        const client = await createWebPubSubHubsAPIClient([context, subContext]);
        return client.webPubSubHubs.list(resourceGroup, resourceName);
    }

    // async List(context: IActionContext, subscription: AzureSubscription, resourceGroup: string, resourceName: string, webPubSubId: string): Promise<WebPubSubHubModel[]> {
    async List(context: IActionContext): Promise<WebPubSubHubModel[]> {
        const hubs = await HubsItem.getHubs(context, this.subscription, this.service.resourceGroup, this.service.name, this.service.id);
        const hubIterator = await uiUtils.listAllIterator(hubs);
        return hubIterator
            .filter(hub => hub.id && hub.id.includes(this.service.id))
            .map(CreateWebPubSubHubModel);
    }

    // static async Get(context: IActionContext, subscription: AzureSubscription, resourceGroup: string, resourceName: string, webPubSubHubName: string): Promise<WebPubSubHubModel> {
    //     const client = await createWebPubSubHubsClient(context, subscription);
    //     return HubItem.CreateWebPubSubHubModel(await client.webPubSubHubs.get(webPubSubHubName, resourceGroup, resourceName));
    // }


}
