import { AzureWizard, DeleteConfirmationStep, IActionContext, TreeElementBase, callWithTelemetryAndErrorHandling, createContextValue, createSubscriptionContext, nonNullValueAndProp } from "@microsoft/vscode-azext-utils";
import { AzureSubscription, type ViewPropertiesModel } from '@microsoft/vscode-azureresources-api';
import * as vscode from 'vscode';
import { ThemeIcon } from "vscode";
import { ext } from "../../../extension.bundle";
import { createActivityContext } from "../../utils";
import { createWebPubSubHubsClient } from "../../utils/createControlPlaneClient";
import { createPortalUrl } from "../../utils/createUrl";
import { localize } from "../../utils/localize";
import { IDeleteHubContext } from "../../workflows/hub/delete/IDeleteHubContext";
import { DeleteServiceStep } from "../../workflows/service/delete/DeleteServiceStep";
import { CreateWebPubSubHubModel, WebPubSubHubModel } from "../models";
import { HubSettingItem } from "./properties/HubSetting";

export class HubItem implements TreeElementBase {
    static readonly contextValue: string = 'webPubSubHubItem';
    static readonly contextValueRegExp: RegExp = new RegExp(HubItem.contextValue);

    public hubName: string;
    id: string;

    constructor(public readonly subscription: AzureSubscription, public readonly resourceGroup: string, public readonly webPubSubName: string, public readonly webPubSubHub: WebPubSubHubModel) {
        this.id = this.webPubSubHub.id;
        this.hubName = this.webPubSubHub.hubName;
    }

    viewProperties: ViewPropertiesModel = {
        data: this.webPubSubHub,
        label: `${this.webPubSubHub.hubName}`,
    };

    portalUrl: vscode.Uri = createPortalUrl(this.subscription, this.webPubSubHub.id);

    private get contextValue(): string {
        const values: string[] = [HubItem.contextValue];

        // Enable more granular tree item filtering by container app name
        values.push(nonNullValueAndProp(this.webPubSubHub, 'hubName'));

        // values.push(this.webPubSubHub.revisionsMode === KnownActiveRevisionsMode.Single ? revisionModeSingleContextValue : revisionModeMultipleContextValue);
        // values.push(this.hasUnsavedChanges() ? unsavedChangesTrueContextValue : unsavedChangesFalseContextValue);
        return createContextValue(values);
    }

    private get description(): string | undefined {
        return undefined;
    }

    async getChildren(): Promise<TreeElementBase[]> {
        const result = await callWithTelemetryAndErrorHandling('getChildren', async (context) => {
            const children: TreeElementBase[] = [];
            children.push(new HubSettingItem(this.webPubSubHub.properties));
            return children;
        });

        return result ?? [];
    }

    getTreeItem(): vscode.TreeItem {
        return {
            id: this.id,
            label: `${this.webPubSubHub.hubName}`,
            iconPath: new ThemeIcon("inbox"),
            contextValue: this.contextValue,
            description: this.description,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            tooltip: `Hub ${this.webPubSubHub.hubName}`
        };
    }

    static isHubItem(item: unknown): item is HubItem {
        return typeof item === 'object' &&
            typeof (item as HubItem).contextValue === 'string' &&
            HubItem.contextValueRegExp.test((item as HubItem).contextValue);
    }

    // static async List(context: IActionContext, subscription: AzureSubscription, resourceGroup: string, resourceName: string, webPubSubId: string): Promise<WebPubSubHubModel[]> {
    //     const subContext = createSubscriptionContext(subscription);
    //     const client = await createWebPubSubHubsAPIClient([context, subContext]);
    //     const hubs = client.webPubSubHubs.list(resourceGroup, resourceName);
    //     const hubsIter = await uiUtils.listAllIterator(hubs);
    //     return hubsIter.filter(hub => hub.id && hub.id.includes(webPubSubId))
    //         .map(HubItem.CreateWebPubSubHubModel);
    // }

    static async Get(context: IActionContext, subscription: AzureSubscription, resourceGroup: string, resourceName: string, webPubSubHubName: string): Promise<WebPubSubHubModel> {
        const client = await createWebPubSubHubsClient(context, subscription);
        return CreateWebPubSubHubModel(await client.webPubSubHubs.get(webPubSubHubName, resourceGroup, resourceName));
    }

    async delete(context: IActionContext & { suppressPrompt?: boolean; }): Promise<void> {
        const confirmMessage: string = localize('confirmDeleteWebPubSubHub', 'Are you sure you want to delete hub "{0}"?', this.hubName);
        const deleteHub: string = localize('deleteWebPubSubHub', 'Delete hub "{0}"', this.hubName);

        const wizardContext: IDeleteHubContext = {
            activityTitle: deleteHub,
            webPubSubResourceName: this.webPubSubHub.webPubSubId,
            subscription: createSubscriptionContext(this.subscription),
            resourceGroupName: this.resourceGroup,
            ...context,
            ...await createActivityContext()
        };

        const wizard: AzureWizard<IDeleteHubContext> = new AzureWizard(wizardContext, {
            promptSteps: [new DeleteConfirmationStep(confirmMessage)],
            executeSteps: [new DeleteServiceStep()]
        });

        if (!context.suppressPrompt) {
            await wizard.prompt();
        }

        await ext.state.showDeleting(this.webPubSubHub.id, async () => {
            await wizard.execute();
        });
        ext.state.notifyChildrenChanged(this.webPubSubHub.webPubSubId);
    }
}
