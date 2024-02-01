import { AggregationType, KnownAggregationTypeEnum } from "@azure/arm-monitor";
import { AzureWizardPromptStep, IAzureQuickPickItem } from "@microsoft/vscode-azext-utils";
import { localize } from "../../../utils";
import { IPickMetricsContext, KnownMetricNameEnum, MetricName } from "../../common/contexts";

const completeAggregationTypePickItems: IAzureQuickPickItem<AggregationType>[] = [
    { label: "Minimum", data: KnownAggregationTypeEnum.Minimum },
    { label: "Maximum", data: KnownAggregationTypeEnum.Maximum },
    { label: "Average", data: KnownAggregationTypeEnum.Average },
    { label: "Total", data: KnownAggregationTypeEnum.Total },
];

const mapMetricNameToAggregationPickItems = (metricsName: MetricName): IAzureQuickPickItem<AggregationType>[] => {
    var pickIndexs: number[] = [];
    switch (metricsName) {
        case KnownMetricNameEnum.ServerLoad:
        case KnownMetricNameEnum.ConnectionQuotaUtilization:
            pickIndexs = [0, 1, 2] // min, max, avg
            break;
        case KnownMetricNameEnum.ConnectionOpenCount:
        case KnownMetricNameEnum.ConnectionCloseCount:
        case KnownMetricNameEnum.InboundTraffic:
        case KnownMetricNameEnum.OutboundTraffic:
            pickIndexs = [3] // sum
            break;
        case KnownMetricNameEnum.ConnectionCount:
            pickIndexs = [1, 2] // max, avg
            break;
        default:
            break;
    }
    return pickIndexs.map(index => completeAggregationTypePickItems[index]);
}

export class InputAggregationTypeStep extends AzureWizardPromptStep<IPickMetricsContext> {
    public async prompt(context: IPickMetricsContext): Promise<void> {
        if (!context.metricName) {
            throw new Error("metricsName is undefined");
        }
        const placeHolder = localize("kind", "Select Aggregation Type");
        const pickItems = mapMetricNameToAggregationPickItems(context.metricName);
        const chosenItem = await context.ui.showQuickPick(pickItems, { placeHolder, suppressPersistence: true });
        context.aggregationType = chosenItem.data;
    }

    public shouldPrompt(context: IPickMetricsContext): boolean {
        return true;
    }
}
