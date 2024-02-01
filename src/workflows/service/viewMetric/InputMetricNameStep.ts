import { AzureWizardPromptStep, IAzureQuickPickItem } from "@microsoft/vscode-azext-utils";
import { localize } from "../../../utils";
import { IPickMetricsContext, KnownMetricNameEnum, MetricName } from "../../common/contexts";

const metricNamePickItems: IAzureQuickPickItem<MetricName>[] = [
    { label: "Server Load", data: KnownMetricNameEnum.ServerLoad },
    { label: "Inbound Traffic", data: KnownMetricNameEnum.InboundTraffic },
    { label: "Outbound Traffic", data: KnownMetricNameEnum.OutboundTraffic },
    { label: "Connection Quota Utilization", data: KnownMetricNameEnum.ConnectionQuotaUtilization },
    { label: "Connection Count", data: KnownMetricNameEnum.ConnectionCount },
    { label: "Connection Open Count", data: KnownMetricNameEnum.ConnectionOpenCount },
    { label: "Connection Close Count", data: KnownMetricNameEnum.ConnectionCloseCount },
];

export class InputMetricNameStep extends AzureWizardPromptStep<IPickMetricsContext> {
    public async prompt(context: IPickMetricsContext): Promise<void> {
        const placeHolder: string = localize("selectMetricName", "Select Metric Name");
        const chosenItem = await context.ui.showQuickPick(metricNamePickItems, { placeHolder, suppressPersistence: true });
        context.metricName = chosenItem.data;
    }

    public shouldPrompt(context: IPickMetricsContext): boolean {
        return true;
    }
}
