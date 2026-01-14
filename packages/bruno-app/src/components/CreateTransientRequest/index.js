import React, { useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MenuDropdown from 'ui/MenuDropdown';
import { newTransientHttpRequest, newTransientGrpcRequest, newTransientWsRequest } from 'providers/ReduxStore/slices/collections/actions';
import { updateStandaloneRequestType } from 'providers/ReduxStore/slices/app';
import toast from 'react-hot-toast';
import { IconPlus } from '@tabler/icons';
import ActionIcon from 'ui/ActionIcon';
import ToolHint from 'components/ToolHint/index';
import { REQUEST_TYPE_INFO } from '../../constants/requestTypes';
import StyledWrapper from './StyledWrapper';
import { useTheme } from 'providers/Theme/index';

const CreateTransientRequest = ({ collectionUid, itemUid = null, onRequestCreated, placement = 'bottom', tooltipPlacement = 'bottom', tooltipPositionStrategy = 'absolute', location = 'default' }) => {
  const dispatch = useDispatch();
  const collections = useSelector((state) => state.collections.collections);
  const lastUsedStandaloneType = useSelector((state) => state.app.preferences.standaloneRequest?.lastUsedType || 'http-request');
  const collection = collections?.find((c) => c.uid === collectionUid);

  const menuRef = useRef();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme } = useTheme();

  if (!collection) {
    return null;
  }

  // Check if this is a virtual/standalone collection
  const isVirtualCollection = collectionUid?.startsWith('virtual-');

  // Get presets from collection config for regular collections
  // For standalone collections, use the last used type from preferences
  const presets = collection.brunoConfig?.presets || { requestType: 'http', requestUrl: '' };
  const presetType = isVirtualCollection
    ? (lastUsedStandaloneType?.replace('-request', '') || 'http')
    : (presets.requestType || 'http');
  const presetUrl = presets.requestUrl || '';

  const handleCreateHttpRequest = useCallback(async (url = presetUrl) => {
    dispatch(
      newTransientHttpRequest({
        requestName: 'Untitled',
        requestType: 'http-request',
        requestUrl: url,
        requestMethod: 'GET',
        collectionUid: collection.uid
      })
    )
      .then(() => {
        onRequestCreated?.();
      })
      .catch((err) => toast.error(err ? err.message : 'An error occurred while adding the request'));
  }, [dispatch, collection, presetUrl, onRequestCreated]);

  const handleCreateGraphQLRequest = useCallback(async (url = presetUrl) => {
    dispatch(
      newTransientHttpRequest({
        requestName: 'Untitled',
        requestType: 'graphql-request',
        requestUrl: url,
        requestMethod: 'POST',
        collectionUid: collection.uid,
        body: {
          mode: 'graphql',
          graphql: {
            query: '',
            variables: ''
          }
        }
      })
    )
      .then(() => {
        onRequestCreated?.();
      })
      .catch((err) => toast.error(err ? err.message : 'An error occurred while adding the request'));
  }, [dispatch, collection, presetUrl, onRequestCreated]);

  const handleCreateWebSocketRequest = useCallback(async (url = presetUrl) => {
    dispatch(
      newTransientWsRequest({
        requestName: 'Untitled',
        requestUrl: url,
        requestMethod: 'ws',
        collectionUid: collection.uid
      })
    )
      .then(() => {
        onRequestCreated?.();
      })
      .catch((err) => toast.error(err ? err.message : 'An error occurred while adding the request'));
  }, [dispatch, collection, presetUrl, onRequestCreated]);

  const handleCreateGrpcRequest = useCallback(async (url = presetUrl) => {
    dispatch(
      newTransientGrpcRequest({
        requestName: 'Untitled',
        requestUrl: url,
        collectionUid: collection.uid
      })
    )
      .then(() => {
        onRequestCreated?.();
      })
      .catch((err) => toast.error(err ? err.message : 'An error occurred while adding the request'));
  }, [dispatch, collection, presetUrl, onRequestCreated]);

  // Create request based on preset type
  const handleCreatePresetRequest = useCallback(() => {
    switch (presetType) {
      case 'graphql':
        return handleCreateGraphQLRequest(presetUrl);
      case 'grpc':
        return handleCreateGrpcRequest(presetUrl);
      case 'ws':
        return handleCreateWebSocketRequest(presetUrl);
      default:
        return handleCreateHttpRequest(presetUrl);
    }
  }, [presetType, presetUrl, handleCreateHttpRequest, handleCreateGraphQLRequest, handleCreateGrpcRequest, handleCreateWebSocketRequest]);

  const handleLeftClick = (e) => {
    // For standalone collections, store the preference when left-clicking
    if (isVirtualCollection) {
      // Convert presetType back to full request type format
      const requestType = presetType === 'http' ? 'http-request'
        : presetType === 'graphql' ? 'graphql-request'
          : presetType === 'grpc' ? 'grpc-request'
            : presetType === 'ws' ? 'ws-request'
              : 'http-request';
      dispatch(updateStandaloneRequestType({ requestType }));
    }

    handleCreatePresetRequest();
    // MenuDropdown will toggle open after this handler, so close it immediately
    requestAnimationFrame(() => {
      menuRef.current?.hide();
      setIsMenuOpen(false);
    });
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(true);
    menuRef.current?.show();
  };

  // Wrapper to close menu state when a menu item is clicked
  const handleMenuItemClick = (originalOnClick, requestType) => () => {
    setIsMenuOpen(false);

    // Update preference for standalone requests
    if (isVirtualCollection) {
      dispatch(updateStandaloneRequestType({ requestType }));
    }

    originalOnClick?.();
  };

  // Map request type handlers
  const typeHandlers = {
    'http-request': handleCreateHttpRequest,
    'graphql-request': handleCreateGraphQLRequest,
    'ws-request': handleCreateWebSocketRequest,
    'grpc-request': handleCreateGrpcRequest
  };

  // Build menu items from shared constants
  const menuItems = Object.entries(REQUEST_TYPE_INFO).map(([type, info]) => {
    const TypeIcon = info.icon;
    return {
      id: type,
      label: info.label,
      leftSection: <TypeIcon size={16} strokeWidth={1.5} style={{ color: info.color }} />,
      onClick: handleMenuItemClick(() => typeHandlers[type]?.(presetUrl), type)
    };
  });

  // For virtual collections, always show "standalone" in tooltip
  const requestTypeLabel = isVirtualCollection ? 'standalone' : 'collection';
  const tooltipText = `New ${requestTypeLabel} request. Right-click for more options.`;
  const uniqueToolhintId = `create-untitled-request-${location}-${collectionUid}`;

  // Footer text based on whether it's standalone or collection
  const footerText = isVirtualCollection
    ? 'Defaults to last used type'
    : 'Defaults to collection preset';

  return (
    <StyledWrapper onMouseLeave={() => setIsMenuOpen(false)}>
      <MenuDropdown
        ref={menuRef}
        items={menuItems}
        placement={placement}
        autoFocusFirstOption={true}
        data-testid="create-untitled-request"
        appendTo={document.body}
        footer={(
          <div
            className="footer"
            style={{
              fontSize: theme.font.size.xs,
              padding: '0px 6px',
              color: theme.colors.text.muted
            }}
          >
            {footerText}
          </div>
        )}
      >
        <div>
          <ToolHint
            text={tooltipText}
            toolhintId={uniqueToolhintId}
            place={tooltipPlacement}
            delayShow={300}
            hidden={isMenuOpen}
            positionStrategy={tooltipPositionStrategy}
            tooltipStyle={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}
          >
            <ActionIcon
              onClick={handleLeftClick}
              onContextMenu={handleRightClick}
            >
              <IconPlus size={16} strokeWidth={1.5} />
            </ActionIcon>
          </ToolHint>
        </div>
      </MenuDropdown>
    </StyledWrapper>
  );
};

export default CreateTransientRequest;
