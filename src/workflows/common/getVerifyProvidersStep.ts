import { VerifyProvidersStep } from "@microsoft/vscode-azext-azureutils";
import { type ISubscriptionActionContext } from "@microsoft/vscode-azext-utils";

/**
 * Use to obtain a `VerifyProvidersStep` that registers all known container app providers to the user's subscription
 */

export function getVerifyProvidersStep<T extends ISubscriptionActionContext>(): VerifyProvidersStep<T> {
    return new VerifyProvidersStep<T>([
        "Microsoft.SignalRService/WebPubSub",
    ]);
}
