import { IActionContext } from "@microsoft/vscode-azext-utils";


export async function helloWorld(context: IActionContext): Promise<void> {
    context.ui.showWarningMessage("hello");
}
