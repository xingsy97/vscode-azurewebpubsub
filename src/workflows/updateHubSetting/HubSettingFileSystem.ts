import { WebPubSubHubProperties, WebPubSubManagementClient } from "@azure/arm-webpubsub";
import { createAzureClient } from "@microsoft/vscode-azext-azureutils";
import { ext } from "@microsoft/vscode-azext-github";
import { AzExtTreeFileSystem, AzExtTreeFileSystemItem, IActionContext, createSubscriptionContext } from "@microsoft/vscode-azext-utils";
import { AzureSubscription } from "@microsoft/vscode-azureresources-api";
import * as jsonc from 'jsonc-parser';
import * as os from "os";
import { Diagnostic, DiagnosticSeverity, FileStat, FileType, MessageItem, Uri, commands, languages, window } from "vscode";
import { localize } from "../../utils";

const insertKeyHere: string = localize('insertTagName', '<Insert tag name>');
const insertValueHere: string = localize('insertTagValue', '<Insert tag value>');

export interface IHubSettingModel extends AzExtTreeFileSystemItem {
    getSetting(): Promise<WebPubSubHubProperties>;
    subscription: AzureSubscription;
    resourceGroup: string;
    webPubSubName: string;
    hubName: string;

    displayName: string;
    // displayType: 'resource group' | 'resource';
    displayType: 'Hub Setting',

    cTime: number;
    mTime: number;
}

/**
 * File system for editing hub setting.
 */
export class HubSettingFileSystem extends AzExtTreeFileSystem<IHubSettingModel> {
    public static scheme: string = 'webPubSubHub';
    public scheme: string = HubSettingFileSystem.scheme;

    public async statImpl(_context: IActionContext, model: IHubSettingModel): Promise<FileStat> {
        const fileContent: string = this.getFileContentFromSetting(await this.getSettingFromNode(model));
        return { type: FileType.File, ctime: model.cTime, mtime: model.mTime, size: Buffer.byteLength(fileContent) };
    }

    public async readFileImpl(_context: IActionContext, item: IHubSettingModel): Promise<Uint8Array> {
        const fileContent: string = this.getFileContentFromSetting(await this.getSettingFromNode(item));
        return Buffer.from(fileContent);
    }

    public async writeFileImpl(context: IActionContext, model: IHubSettingModel, content: Uint8Array, originalUri: Uri): Promise<void> {
        // weird issue when in vscode.dev, the content Uint8Array has a giant byteOffset that causes it impossible to decode
        // so re-form the buffer with 0 byteOffset
        const buf = Buffer.from(content, 0)
        const text: string = buf.toString('utf-8');

        const diagnostics: Diagnostic[] = languages.getDiagnostics(originalUri).filter(d => d.severity === DiagnosticSeverity.Error);
        if (diagnostics.length > 0) {
            context.telemetry.measurements.tagDiagnosticsLength = diagnostics.length;

            const showErrors: MessageItem = { title: localize('showErrors', 'Show Errors') };
            const message: string = localize('errorsExist', 'Failed to upload tags for {0}.', this.getDetailedName(model));
            void window.showErrorMessage(message, showErrors).then(async (result) => {
                if (result === showErrors) {
                    const openedUri: Uri | undefined = window.activeTextEditor?.document.uri;
                    if (!openedUri || originalUri.query !== openedUri.query) {
                        await this.showTextDocument(model);
                    }

                    await commands.executeCommand('workbench.action.showErrorsWarnings');
                }
            });

            // de-duped, sorted list of diagnostic sources
            context.telemetry.properties.diagnosticSources = diagnostics.map(d => d.source).filter((value, index, array) => value && array.indexOf(value) === index).sort().join(',');
            context.errorHandling.suppressDisplay = true;
            // This won't be displayed, but might as well track the first diagnostic for telemetry
            throw new Error(diagnostics[0].message);
        } else {
            const confirmMessage: string = localize('confirmSetting', 'Are you sure you want to update setting for {0}?', this.getDetailedName(model));
            const update: MessageItem = { title: localize('update', 'Update') };
            await context.ui.showWarningMessage(confirmMessage, { modal: true }, update);

            const tags: { [key: string]: string } = <{}>jsonc.parse(text);

            // remove example tag
            if (Object.keys(tags).includes(insertKeyHere) && tags[insertKeyHere] === insertValueHere) {
                delete tags[insertKeyHere];
            }

            const subContext = createSubscriptionContext(model.subscription);
            const client = createAzureClient([context, subContext], WebPubSubManagementClient);
            await client.webPubSubHubs.beginCreateOrUpdate(model.hubName, model.resourceGroup, model.webPubSubName, {
                properties: await model.getSetting() || {}
            })

            const updatedMessage: string = localize('updatedHubSetting', 'Successfully updated hub setting for {0}.', this.getDetailedName(model));
            void window.showInformationMessage(updatedMessage);
            ext.outputChannel.appendLog(updatedMessage);
        }
    }

    public getFilePath(node: IHubSettingModel): string {
        return `${node.displayName}-setting.jsonc`;
    }

    private getFileContentFromSetting(hubSetting: {} | undefined): string {
        hubSetting = hubSetting || {};

        const comment: string = localize('editAndSave', 'Edit and save this file to upload hub settings in Azure');
        if (Object.keys(hubSetting).length === 0) {
            // Make sure to use a new object here because of https://github.com/microsoft/vscode-azureresourcegroups/issues/54
            hubSetting = {
                [insertKeyHere]: insertValueHere
            };
        }
        return `// ${comment}${os.EOL}${JSON.stringify(hubSetting, undefined, 4)}`;
    }

    private async getSettingFromNode(node: IHubSettingModel): Promise<WebPubSubHubProperties | undefined> {
        return await node.getSetting();
    }

    private getDetailedName(node: IHubSettingModel): string {
        return `${node.displayType} "${node.displayName}"`;
    }
}
