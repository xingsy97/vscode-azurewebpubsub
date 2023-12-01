import { KnownServiceKind, ServiceKind } from "@azure/arm-webpubsub";
import { AzureWizardPromptStep, IAzureQuickPickItem } from "@microsoft/vscode-azext-utils";
import { localize } from "../../../utils";
import { ICreateServiceContext } from "./ICreateServiceContext";

const serviceKindPickItems: IAzureQuickPickItem<ServiceKind>[] = [
    { label: "Web PubSub", data: KnownServiceKind.WebPubSub, detail: "Supports the native Web PubSub API and provides SDKs in various languages" },
    { label: "SocketIO", data: KnownServiceKind.SocketIO, detail: "Supports Socket.IO protocols and compatible with Socket.IO client and server SDKs" }
];

export class InputServiceKindStep extends AzureWizardPromptStep<ICreateServiceContext> {
    public async prompt(context: ICreateServiceContext): Promise<void> {
        const placeHolder: string = localize("kind", "Select resource kind");
        const chosenItem = await context.ui.showQuickPick(serviceKindPickItems, { placeHolder, suppressPersistence: true });
        context.kind = chosenItem.data;
    }

    public shouldPrompt(context: ICreateServiceContext): boolean {
        return true;
    }
}
