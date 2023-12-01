import { EventListener } from "@azure/arm-webpubsub";
import { TreeElementBase, createContextValue } from "@microsoft/vscode-azext-utils";
import { ViewPropertiesModel } from "@microsoft/vscode-azureresources-api";
import * as vscode from 'vscode';
import { treeUtils } from "../..";
import { EventListenerItem } from "./EventListenerItem";


export class EventListenersItem implements TreeElementBase {
    static readonly contextValue: string = 'eventListenersItem';
    static readonly contextValueRegExp: RegExp = new RegExp(EventListenersItem.contextValue);

    constructor(public readonly eventListeners: EventListener[]) { }

    viewProperties: ViewPropertiesModel = {
        data: this.eventListeners,
        label: "Event Listeners"
    };

    private get contextValue(): string {
        const values: string[] = [];
        values.push(EventListenersItem.contextValue);
        return createContextValue(values);
    }

    async getChildren(): Promise<EventListenerItem[]> {
        const result: EventListenerItem[] = [];
        for (let i = 0; i < this.eventListeners.length; i++) {
            result.push(new EventListenerItem(this.eventListeners[i], i + 1));
        }
        return result;
    }

    getTreeItem(): vscode.TreeItem {
        return {
            label: "Event Listeners",
            iconPath: treeUtils.getIconPath('azure-web-pubsub'),
            contextValue: this.contextValue,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            description: `${this.eventListeners.length} Listeners`,
        };
    }
}
