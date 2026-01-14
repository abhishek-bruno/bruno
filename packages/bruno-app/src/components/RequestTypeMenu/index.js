import React, { useRef, useState } from 'react';
import MenuDropdown from 'ui/MenuDropdown';
import { REQUEST_TYPE_INFO } from '../../constants/requestTypes';

/**
 * Shared component for displaying a menu of request types
 *
 * @param {Object} props
 * @param {string[]} props.requestTypes - Array of request type keys to display (e.g. ['http-request', 'graphql-request'])
 * @param {function} props.onSelectType - Callback when a type is selected, receives (requestType)
 * @param {React.ReactNode} props.children - Trigger element for the menu
 * @param {string} props.placement - MenuDropdown placement (default: 'bottom-end')
 * @param {boolean} props.autoFocusFirstOption - Whether to auto focus first option (default: false)
 * @param {HTMLElement} props.appendTo - Where to append the dropdown (default: document.body)
 * @param {React.ReactNode} props.footer - Optional footer content to render below menu items
 */
const RequestTypeMenu = ({
  requestTypes,
  onSelectType,
  children,
  placement = 'bottom-end',
  autoFocusFirstOption = false,
  appendTo = document.body,
  footer,
  ...otherProps
}) => {
  const menuRef = useRef();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = requestTypes.map((type) => {
    const typeInfo = REQUEST_TYPE_INFO[type];
    if (!typeInfo) {
      return null;
    }

    const TypeIcon = typeInfo.icon;

    return {
      id: type,
      label: typeInfo.label,
      leftSection: <TypeIcon size={16} strokeWidth={1.5} style={{ color: typeInfo.color }} />,
      onClick: () => {
        setIsMenuOpen(false);
        onSelectType(type);
      }
    };
  }).filter(Boolean);

  return (
    <div onMouseLeave={() => setIsMenuOpen(false)}>
      <MenuDropdown
        ref={menuRef}
        items={menuItems}
        placement={placement}
        autoFocusFirstOption={autoFocusFirstOption}
        appendTo={appendTo}
        footer={footer}
        {...otherProps}
      >
        {React.cloneElement(children, {
          onClick: (e) => {
            children.props.onClick?.(e);
            setIsMenuOpen(true);
            menuRef.current?.show();
          }
        })}
      </MenuDropdown>
    </div>
  );
};

export default RequestTypeMenu;
