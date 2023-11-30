// import { AzureWizardExecuteStep, parseError } from "@microsoft/vscode-azext-utils";
// import * as vscode from 'vscode';
// import { createWebPubSubHubsAPIClient } from ".";
// import { ext } from "../../extension.bundle";
// import { localize } from "../utils/localize";
// import { IDeleteWebPubSubHubWizardContext } from "../workflows/deleteWebPubSub/IDeleteWebPubSubHubWizardContext";


// export class DeleteWebPubSubStep extends AzureWizardExecuteStep<IDeleteWebPubSubHubWizardContext> {
//     public priority: number = 100;

//     public async execute(context: IDeleteWebPubSubHubWizardContext, progress: vscode.Progress<{ message?: string | undefined; increment?: number | undefined; }>): Promise<void> {
//         const hubNames: string[] = Array.isArray(context.webPubSubHubNames) ? context.webPubSubHubNames : [context.webPubSubHubNames];
//         const webClient = await createWebPubSubHubsAPIClient([context, context.subscription]);

//         for (const hubName of hubNames) {
//             try {
//                 const deleting: string = localize('deletingWebPubSubHub', 'Deleting Web PubSub Hub "{0}"...', hubName);
//                 const deleted: string = localize('deletedWebPubSubHub', 'Deleted Web PubSub Hub "{0}".', hubName);

//                 progress.report({ message: deleting });
//                 await webClient.webPubSubHubs.beginDeleteAndWait(hubName, context.resourceGroupName, context.resourceName);

//                 ext.outputChannel.appendLog(deleted);
//             } catch (error) {
//                 const pError = parseError(error);
//                 // a 204 indicates a success, but sdk is catching it as an exception
//                 // accept any 2xx reponse code
//                 if (Number(pError.errorType) < 200 || Number(pError.errorType) >= 300) {
//                     throw error;
//                 }
//             }
//         }
//     }

//     public shouldExecute(context: IDeleteWebPubSubHubWizardContext): boolean {
//         return !!context.webPubSubHubNames?.length;
//     }
// }
