import { t } from '@lingui/core/macro';
import { useLocation } from 'react-router-dom';
import { IconListCheck } from 'twenty-ui/display';

import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

import { useMyTasks } from '../hooks/useMyTasks';
import { OverdueCounter } from './OverdueCounter';

// Integration point: Add <StratiaNavigationItem /> inside
// NavigationDrawerOtherSection (packages/twenty-front/src/modules/navigation/
// components/NavigationDrawerOtherSection.tsx) before the Settings item.

const STRATIA_TASKS_PATH = '/objects/tasks';

export const StratiaNavigationItem = () => {
  const { overdueCount } = useMyTasks();
  const location = useLocation();

  const isActive = location.pathname.startsWith(STRATIA_TASKS_PATH);

  return (
    <NavigationDrawerItem
      label={t`Mes taches`}
      Icon={IconListCheck}
      to={STRATIA_TASKS_PATH}
      active={isActive}
      rightOptions={<OverdueCounter count={overdueCount} />}
      alwaysShowRightOptions={true}
    />
  );
};
