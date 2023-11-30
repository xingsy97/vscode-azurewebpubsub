import { WebPubSubHub, WebPubSubManagementClient } from "@azure/arm-webpubsub";
import { createAzureClient, getResourceGroupFromId, uiUtils } from "@microsoft/vscode-azext-azureutils";
import { AzureWizard, DeleteConfirmationStep, IActionContext, callWithTelemetryAndErrorHandling, createContextValue, createSubscriptionContext, nonNullProp, nonNullValueAndProp } from "@microsoft/vscode-azext-utils";
import { AzureSubscription, type ViewPropertiesModel } from '@microsoft/vscode-azureresources-api';
import * as vscode from 'vscode';
import { HubsItem, TreeElementBase, WebPubSubHubModel, createWebPubSubHubsAPIClient, createWebPubSubHubsClient, treeUtils } from ".";
import { ext } from "../../extension.bundle";
import { createActivityContext } from "../utils";
import { createPortalUrl } from "../utils/createPortalUrl";
import { localize } from "../utils/localize";
import { DeleteWebPubSubStep } from "../workflows/deleteWebPubSub/DeleteWebPubSubStep";
import { IDeleteWebPubSubHubWizardContext } from "../workflows/deleteWebPubSubHub/IDeleteWebPubSubHubWizardContext";

export class WebPubSubHubItem implements HubsItem {
    static readonly contextValue: string = 'webPubSubHubItem';
    static readonly contextValueRegExp: RegExp = new RegExp(WebPubSubHubItem.contextValue);

    id: string;

    private resourceGroup: string;
    private name: string;

    public get webPubSubHub(): WebPubSubHubModel {
        return this._webPubSubHub;
    }

    constructor(public readonly subscription: AzureSubscription, private _webPubSubHub: WebPubSubHubModel) {
        this.id = this.webPubSubHub.id;
        this.resourceGroup = this.webPubSubHub.resourceGroup;
        this.name = this.webPubSubHub.name;
    }

    viewProperties: ViewPropertiesModel = {
        data: this.webPubSubHub,
        label: this.webPubSubHub.name,
    };

    portalUrl: vscode.Uri = createPortalUrl(this.subscription, this.webPubSubHub.id);

    private get contextValue(): string {
        const values: string[] = [WebPubSubHubItem.contextValue];

        // Enable more granular tree item filtering by container app name
        values.push(nonNullValueAndProp(this.webPubSubHub, 'name'));

        // values.push(this.webPubSubHub.revisionsMode === KnownActiveRevisionsMode.Single ? revisionModeSingleContextValue : revisionModeMultipleContextValue);
        // values.push(this.hasUnsavedChanges() ? unsavedChangesTrueContextValue : unsavedChangesFalseContextValue);
        return createContextValue(values);
    }

    private get description(): string | undefined {
        // if (this.webPubSubHub.revisionsMode === KnownActiveRevisionsMode.Single && this.hasUnsavedChanges()) {
        //     return localize('unsavedChanges', 'Unsaved changes');
        // }
        // if (this.webPubSubHub.provisioningState && this.webPubSubHub.provisioningState !== 'Succeeded') {
        //     return this.webPubSubHub.provisioningState;
        // }
        return undefined;
    }

    async getChildren(): Promise<TreeElementBase[]> {
        const result = await callWithTelemetryAndErrorHandling('getChildren', async (context) => {
            const children: TreeElementBase[] = [];
            const client = createAzureClient([context, createSubscriptionContext(this.subscription)], WebPubSubManagementClient);


            // if (this.webPubSubHub.revisionsMode === KnownActiveRevisionsMode.Single) {
            //     const revision: Revision = await client.containerAppsRevisions.getRevision(this.resourceGroup, this.name, nonNullProp(this.webPubSubHub, 'latestRevisionName'));
            //     children.push(...RevisionItem.getTemplateChildren(this.subscription, this.webPubSubHub, revision));
            // } else {
            //     children.push(new RevisionsItem(this.subscription, this.webPubSubHub));
            // }
            // children.push(new ConfigurationItem(this.subscription, this.webPubSubHub));
            // children.push(new LogsGroupItem(this.subscription, this.webPubSubHub));
            return children;
        });

        return result ?? [];
    }

    getTreeItem(): vscode.TreeItem {
        return {
            id: this.id,
            label: nonNullProp(this.webPubSubHub, 'name'),
            iconPath: treeUtils.getIconPath('azure-web-pubsub-hub'),
            contextValue: this.contextValue,
            description: this.description,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        };
    }

    static isContainerAppItem(item: unknown): item is WebPubSubHubItem {
        return typeof item === 'object' &&
            typeof (item as WebPubSubHubItem).contextValue === 'string' &&
            WebPubSubHubItem.contextValueRegExp.test((item as WebPubSubHubItem).contextValue);
    }

    static async List(context: IActionContext, subscription: AzureSubscription, resourceGroup: string, resourceName: string, webPubSubId: string): Promise<WebPubSubHubModel[]> {
        const subContext = createSubscriptionContext(subscription);
        const client = await createWebPubSubHubsAPIClient([context, subContext]);
        const hubs = client.webPubSubHubs.list(resourceGroup, resourceName);
        const hubsIter = await uiUtils.listAllIterator(hubs);
        return hubsIter.filter(hub => hub.id && hub.id.includes(webPubSubId))
            .map(WebPubSubHubItem.CreateWebPubSubHubModel);
    }

    static async Get(context: IActionContext, subscription: AzureSubscription, resourceGroup: string, resourceName: string, webPubSubHubName: string): Promise<WebPubSubHubModel> {
        const client = await createWebPubSubHubsClient(context, subscription);
        return WebPubSubHubItem.CreateWebPubSubHubModel(await client.webPubSubHubs.get(webPubSubHubName, resourceGroup, resourceName));
    }

    static CreateWebPubSubHubModel(webPubSubHub: WebPubSubHub): WebPubSubHubModel {
        return {
            id: nonNullProp(webPubSubHub, 'id'),
            name: nonNullProp(webPubSubHub, 'name'),
            webPubSubId: nonNullProp(webPubSubHub, 'id'),
            resourceGroup: getResourceGroupFromId(nonNullProp(webPubSubHub, 'id')),
            ...webPubSubHub,
        };
    }

    async delete(context: IActionContext & { suppressPrompt?: boolean; }): Promise<void> {
        const confirmMessage: string = localize('confirmDeleteWebPubSubHub', 'Are you sure you want to delete hub "{0}"?', this.name);
        const deleteContainerApp: string = localize('deleteWebPubSubHub', 'Delete hub "{0}"', this.name);

        const wizardContext: IDeleteWebPubSubHubWizardContext = {
            activityTitle: deleteContainerApp,
            webPubSubHubNames: this.name,
            subscription: createSubscriptionContext(this.subscription),
            resourceGroupName: this.resourceGroup,
            resourceName: this.name,
            ...context,
            ...await createActivityContext()
        };

        const wizard: AzureWizard<IDeleteWebPubSubHubWizardContext> = new AzureWizard(wizardContext, {
            promptSteps: [new DeleteConfirmationStep(confirmMessage)],
            executeSteps: [new DeleteWebPubSubStep()]
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
