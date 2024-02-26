import  { type EventHandler } from "@azure/arm-webpubsub";
import  { type ExecuteActivityContext, type IActionContext } from "@microsoft/vscode-azext-utils";


export interface IUpdateEventHandlerContext extends IActionContext, ExecuteActivityContext {
    hubName?: string;
    eventHandler?: EventHandler;
}
