import  { type EventListener } from "@azure/arm-webpubsub";
import  { type TreeElementBase} from "@microsoft/vscode-azext-utils";
import { createContextValue } from "@microsoft/vscode-azext-utils";
import  { type ViewPropertiesModel } from "@microsoft/vscode-azureresources-api";
import  { type HubsItem } from "src/tree/hub/HubsItem";
import * as vscode from 'vscode';
import { MarkdownString, ThemeIcon } from "vscode";


export class EventListenerItem implements TreeElementBase {
    static readonly contextValue: string = 'webPubSubHubEventListenerItem';
    static readonly contextValueRegExp: RegExp = new RegExp(EventListenerItem.contextValue);

    constructor(public readonly eventListener: EventListener, public readonly order: number) { }

    viewProperties: ViewPropertiesModel = {
        data: this.eventListener,
        label: `Event Listener ${this.order}`
    };

    private get contextValue(): string {
        const values: string[] = [];
        values.push(EventListenerItem.contextValue);
        return createContextValue(values);
    }

    async getChildren(): Promise<HubsItem[]> {
        return [];
    }


    private get toolTip(): MarkdownString {
        return new MarkdownString(`**Endpoint**: ${this.eventListener.endpoint}\n\n\
**Filter**: ${this.eventListener.filter}`);
    }

    getTreeItem(): vscode.TreeItem {
        return {
            label: `Event Listener ${this.order}`,
            iconPath: new ThemeIcon("send"),
            contextValue: this.contextValue,
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            tooltip: this.toolTip
        };
    }
}
