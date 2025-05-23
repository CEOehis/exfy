import {useRoute} from '@react-navigation/native';
import React, {useCallback} from 'react';
import type {ValueOf} from 'type-fest';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearSageIntacctErrorField} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {updateSageIntacctNonreimbursableExpensesExportDestination} from '@userActions/connections/SageIntacct';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type MenuListItem = ListItem & {
    value: ValueOf<typeof CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE>;
};

function SageIntacctNonReimbursableExpensesDestinationPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const {config} = policy?.connections?.intacct ?? {};
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_NON_REIMBURSABLE_DESTINATION>>();
    const backTo = route.params.backTo;

    const data: MenuListItem[] = Object.values(CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE).map((expenseType) => ({
        value: expenseType,
        text: translate(`workspace.sageIntacct.nonReimbursableExpenses.values.${expenseType}`),
        keyForList: expenseType,
        isSelected: config?.export.nonReimbursable === expenseType,
    }));

    const goBack = useCallback(() => {
        Navigation.goBack(backTo ?? (policyID && ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES.getRoute(policyID)));
    }, [backTo, policyID]);

    const selectDestination = useCallback(
        (row: MenuListItem) => {
            if (row.value !== config?.export.nonReimbursable && policyID) {
                updateSageIntacctNonreimbursableExpensesExportDestination(policyID, row.value, config?.export.nonReimbursable);
            }
            goBack();
        },
        [config?.export.nonReimbursable, policyID, goBack],
    );

    return (
        <SelectionScreen
            displayName={SageIntacctNonReimbursableExpensesDestinationPage.displayName}
            title="workspace.accounting.exportAs"
            sections={[{data}]}
            listItem={RadioListItem}
            onSelectRow={(selection: SelectorType) => selectDestination(selection as MenuListItem)}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            onBackButtonPress={goBack}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            pendingAction={settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE)}
        />
    );
}

SageIntacctNonReimbursableExpensesDestinationPage.displayName = 'SageIntacctNonReimbursableExpensesDestinationPage';

export default withPolicyConnections(SageIntacctNonReimbursableExpensesDestinationPage);
