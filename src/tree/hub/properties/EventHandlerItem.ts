import { EventHandler } from "@azure/arm-webpubsub";
import { TreeElementBase, createContextValue } from "@microsoft/vscode-azext-utils";
import { ViewPropertiesModel } from "@microsoft/vscode-azureresources-api";
import * as vscode from 'vscode';
import { treeUtils } from "../..";


export class EventHandlerItem implements TreeElementBase {
    static readonly contextValue: string = 'eventHandlerItem';
    static readonly contextValueRegExp: RegExp = new RegExp(EventHandlerItem.contextValue);

    constructor(public readonly eventHandler: EventHandler, public readonly order: number) { }

    viewProperties: ViewPropertiesModel = {
        data: this.eventHandler,
        label: `Event Handler ${this.order}`
    };

    private get contextValue(): string {
        const values: string[] = [];
        values.push(EventHandlerItem.contextValue);
        return createContextValue(values);
    }

    async getChildren(): Promise<TreeElementBase[]> {
        return [];
    }

    getTreeItem(): vscode.TreeItem {
        return {
            label: `Event Handler ${this.order}`,
            iconPath: treeUtils.getIconPath('azure-web-pubsub'),
            contextValue: this.contextValue,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            tooltip: `Url Template: ${this.eventHandler.urlTemplate}`
        };
    }
}
