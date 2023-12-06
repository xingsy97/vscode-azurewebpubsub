import { EventHandler } from "@azure/arm-webpubsub";
import { ExecuteActivityContext, IActionContext } from "@microsoft/vscode-azext-utils";


export interface IUpdateEventHandlerContext extends IActionContext, ExecuteActivityContext {
    hubName?: string;
    eventHandler?: EventHandler;
}
