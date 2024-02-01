import { AzureWizardPromptStep, IAzureQuickPickItem } from "@microsoft/vscode-azext-utils";
import { localize } from "../../../utils";
import { IPickMetricsContext } from "../../common/contexts";

const hourDelta = 60 * 60 * 1000;
const dayDelta = 24 * hourDelta;

const timespanPickItems: IAzureQuickPickItem<number>[] = [
    { label: "Last Hour", data: hourDelta },
    { label: "Last 24 Hour", data: 24 * hourDelta },
    { label: "Last 7 Day", data: 7 * dayDelta },
];

export class InputTimespanStep extends AzureWizardPromptStep<IPickMetricsContext> {
    public async prompt(context: IPickMetricsContext): Promise<void> {
        const placeHolder: string = localize("selectTimeSpan", "Select Time Span");
        const chosenItem = await context.ui.showQuickPick(timespanPickItems, { placeHolder, suppressPersistence: true });
        context.endTime = new Date();
        context.startTime = new Date(context.endTime.getTime() - chosenItem.data);
    }

    public shouldPrompt(context: IPickMetricsContext): boolean {
        return true;
    }
}
