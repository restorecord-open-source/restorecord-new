import React, { FunctionComponent } from 'react';
import { Attributes, ReactNode } from 'react';
import { Tooltip, TooltipProps } from 'react-tippy';

interface CustomTooltipProps extends TooltipProps {
  children: ReactNode;
}

const CustomTooltip: FunctionComponent<CustomTooltipProps> = (props: (Partial<any> & Attributes) | undefined) =>
    React.cloneElement(<Tooltip />, { ...props });

export default CustomTooltip;