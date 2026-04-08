import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type OverdueCounterProps = {
  count: number;
};

const StyledBadge = styled.span`
  align-items: center;
  background: ${themeCssVariables.font.color.danger};
  border-radius: 50%;
  color: ${themeCssVariables.background.primary};
  display: flex;
  font-size: 11px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: 18px;
  justify-content: center;
  min-width: 18px;
`;

export const OverdueCounter = ({ count }: OverdueCounterProps) => {
  if (count === 0) {
    return null;
  }

  const displayCount = count > 99 ? '99+' : String(count);

  return <StyledBadge>{displayCount}</StyledBadge>;
};
