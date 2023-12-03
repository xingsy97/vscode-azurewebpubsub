import { EventHandler } from "@azure/arm-webpubsub";
import { TreeElementBase, createContextValue } from "@microsoft/vscode-azext-utils";
import { ViewPropertiesModel } from "@microsoft/vscode-azureresources-api";
import * as vscode from 'vscode';
import { MarkdownString, ThemeIcon } from "vscode";
import { EventHandlersItem } from "./EventHandlersItem";


export class EventHandlerItem implements TreeElementBase {
    static readonly contextValue: string = 'webPubSubHubEventHandlerItem';
    static readonly contextValueRegExp: RegExp = new RegExp(EventHandlerItem.contextValue);

    constructor(public readonly eventHandlersItem: EventHandlersItem, public readonly eventHandler: EventHandler, public readonly indexInHub: number) { }

    viewProperties: ViewPropertiesModel = {
        data: this.eventHandler,
        label: `Event Handler ${this.indexInHub}`
    };

    private get contextValue(): string {
        const values: string[] = [];
        values.push(EventHandlerItem.contextValue);
        return createContextValue(values);
    }

    async getChildren(): Promise<TreeElementBase[]> {
        return [];
    }

    private get toolTip(): MarkdownString {
        return new MarkdownString(`**Url Template**: ${this.eventHandler.urlTemplate}\n\n\
**System Events**: ${this.eventHandler.systemEvents}\n\n\
**User Event Pattern**: ${this.eventHandler.userEventPattern}`)
    }

    getTreeItem(): vscode.TreeItem {
        return {
            label: `Event Handler ${this.indexInHub}`,
            iconPath: new ThemeIcon("send"),
            contextValue: this.contextValue,
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            tooltip: this.toolTip
        };
    }
}
