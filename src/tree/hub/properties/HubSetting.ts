import { WebPubSubHubProperties } from "@azure/arm-webpubsub";
import { TreeElementBase, createContextValue } from "@microsoft/vscode-azext-utils";
import { ViewPropertiesModel } from "@microsoft/vscode-azureresources-api";
import * as vscode from 'vscode';
import { treeUtils } from "../..";
import { EventHandlersItem } from "./EventHandlersItem";
import { EventListenersItem } from "./EventListenersItem";


export class HubSettingItem implements TreeElementBase {
    static readonly contextValue: string = 'hubSettingItem';
    static readonly contextValueRegExp: RegExp = new RegExp(HubSettingItem.contextValue);

    constructor(public readonly HubSettings: WebPubSubHubProperties) { }


    viewProperties: ViewPropertiesModel = {
        data: this.HubSettings,
        label: "Event Listeners"
    };


    private get contextValue(): string {
        const values: string[] = [];

        // values.push(nonNullValueAndProp(this.webPubSub, 'name'));

        values.push(HubSettingItem.contextValue);
        return createContextValue(values);
    }

    async getChildren(): Promise<TreeElementBase[]> {
        const result: TreeElementBase[] = [];
        result.push(new EventHandlersItem(this.HubSettings.eventHandlers ?? []));
        result.push(new EventListenersItem(this.HubSettings.eventListeners ?? []));
        return result;
    }

    getTreeItem(): vscode.TreeItem {
        return {
            label: "Hub Settings",
            iconPath: treeUtils.getIconPath('azure-web-pubsub'),
            contextValue: this.contextValue,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        };
    }
}
