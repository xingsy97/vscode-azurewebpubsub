import { Resource, WebPubSubHub, WebPubSubManagementClient, WebPubSubResource } from "@azure/arm-webpubsub";
import { AzExtClientContext, createAzureClient } from "@microsoft/vscode-azext-azureutils";
import { IActionContext, TreeElementBase, TreeItemIconPath, callWithTelemetryAndErrorHandling, createSubscriptionContext, nonNullProp } from "@microsoft/vscode-azext-utils";
import { AzureResource, AzureResourceBranchDataProvider, AzureSubscription } from '@microsoft/vscode-azureresources-api';
import * as vscode from 'vscode';
import { ext } from "../../extension.bundle";
import { WebPubSubItem } from "./WebPubSubItem";

// export interface TreeElementBase extends ResourceModelBase {
//     getChildren?(): vscode.ProviderResult<TreeElementBase[]>;
//     getTreeItem(): vscode.TreeItem | Thenable<vscode.TreeItem>;

//     viewProperties?: ViewPropertiesModel;
// }

interface ResourceModel extends Resource {
    id: string;
    name: string;
    resourceGroup: string;
}

export interface WebPubSubHubModel extends WebPubSubHub {
    id: string;
    hubName: string;
    resourceGroup: string;
    webPubSubId: string;
}

// export function createAzureResourceModel<T extends Resource>(resource: T): T & ResourceModel {
//     return {
//         id: nonNullProp(resource, 'id'),
//         name: nonNullProp(resource, 'name'),
//         resourceGroup: getResourceGroupFromId(id),
//         ...resource,
//     }
// }

export type WebPubSubModel = WebPubSubResource & ResourceModel;

export async function createWebPubSubHubsAPIClient(context: AzExtClientContext): Promise<WebPubSubManagementClient> {
    return createAzureClient(context, WebPubSubManagementClient)
}

export async function createWebPubSubHubsClient(context: IActionContext, subscription: AzureSubscription): Promise<WebPubSubManagementClient> {
    return createWebPubSubHubsAPIClient([context, createSubscriptionContext(subscription)]);
}

export class HubsBranchDataProvider extends vscode.Disposable implements AzureResourceBranchDataProvider<TreeElementBase> {
    private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<TreeElementBase | undefined>();

    constructor() {
        super(
            () => {
                this.onDidChangeTreeDataEmitter.dispose();
            });
    }

    get onDidChangeTreeData(): vscode.Event<TreeElementBase | undefined> {
        return this.onDidChangeTreeDataEmitter.event;
    }

    async getChildren(element: TreeElementBase): Promise<TreeElementBase[] | null | undefined> {
        return (await element.getChildren?.())?.map((child) => {
            if (child.id) {
                return ext.state.wrapItemInStateHandling(child as TreeElementBase & { id: string }, () => this.refresh(child))
            }
            return child;
        });
    }

    async getResourceItem(element: AzureResource): Promise<TreeElementBase> {
        const resourceItem = await callWithTelemetryAndErrorHandling(
            'getResourceItem',
            async (context: IActionContext) => {
                context.errorHandling.rethrow = true;
                const webPubSub = await WebPubSubItem.Get(context, element.subscription, nonNullProp(element, 'resourceGroup'), element.name);
                return new WebPubSubItem(element.subscription, element, webPubSub);
            });

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return ext.state.wrapItemInStateHandling(resourceItem!, () => this.refresh(resourceItem));
    }

    async getTreeItem(element: TreeElementBase): Promise<vscode.TreeItem> {
        const ti = await element.getTreeItem();
        return ti;
    }

    refresh(element?: TreeElementBase): void {
        this.onDidChangeTreeDataEmitter.fire(element);
    }
}

export const branchDataProvider = new HubsBranchDataProvider();

export namespace treeUtils {
    export function getIconPath(iconName: string): TreeItemIconPath {
        return vscode.Uri.joinPath(getResourcesUri(), `${iconName}.svg`);
    }

    function getResourcesUri(): vscode.Uri {
        return vscode.Uri.joinPath(ext.context.extensionUri, 'resources')
    }

    export function sortById(a: TreeElementBase, b: TreeElementBase): number {
        return a.id && b.id ? a.id.localeCompare(b.id) : 0;
    }
}


