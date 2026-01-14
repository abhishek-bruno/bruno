import React from 'react';
import { useDispatch } from 'react-redux';
import { IconChevronDown } from '@tabler/icons';
import RequestTypeMenu from 'components/RequestTypeMenu';
import { REQUEST_TYPE_INFO } from '../../../constants/requestTypes';
import { changeTransientRequestType } from 'providers/ReduxStore/slices/collections/actions';
import { updateStandaloneRequestType } from 'providers/ReduxStore/slices/app';
import toast from 'react-hot-toast';
import styled from 'styled-components';

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 4px;
  border-left: 1px solid ${(props) => props.theme.requestTabPanel.url.border};
  border-radius: 4px;
  cursor: pointer;
  user-select: none;

  &:hover {
    background-color: ${(props) => props.theme.sidebar.collection.item.hoverBg};
  }

  .type-label {
    font-size: 0.75rem;
    font-weight: 500;
    margin-left: 4px;
    margin-right: 4px;
    color: ${(props) => props.theme.text};
  }

  .chevron {
    opacity: 0.6;
  }
`;

const TransientRequestTypeSelector = ({ item, collection }) => {
  const dispatch = useDispatch();

  if (!item?.transient) {
    return null;
  }

  // Check if this is a virtual/standalone collection
  const isVirtualCollection = collection?.uid?.startsWith('virtual-');

  const currentType = item.type;
  const typeInfo = REQUEST_TYPE_INFO[currentType] || REQUEST_TYPE_INFO['http-request'];
  const TypeIcon = typeInfo.icon;

  const handleChangeType = (targetType) => {
    if (targetType === currentType) {
      return;
    }

    // Update preference for standalone requests
    if (isVirtualCollection) {
      dispatch(updateStandaloneRequestType({ requestType: targetType }));
    }

    dispatch(
      changeTransientRequestType({
        itemUid: item.uid,
        collectionUid: collection.uid,
        targetType
      })
    )
      .then(() => {
        toast.success(`Changed to ${REQUEST_TYPE_INFO[targetType]?.label || targetType}`);
      })
      .catch((err) => {
        toast.error(err?.message || 'Failed to change request type');
      });
  };

  // Show all types except the current one
  const availableTypes = Object.keys(REQUEST_TYPE_INFO).filter((type) => type !== currentType);

  return (
    <RequestTypeMenu
      requestTypes={availableTypes}
      onSelectType={handleChangeType}
      placement="bottom-end"
    >
      <StyledWrapper title="Change request type">
        <TypeIcon size={16} strokeWidth={1.5} style={{ color: typeInfo.color }} />
        <span className="type-label">{typeInfo.label}</span>
        <IconChevronDown size={12} strokeWidth={1.5} className="chevron" />
      </StyledWrapper>
    </RequestTypeMenu>
  );
};

export default TransientRequestTypeSelector;
