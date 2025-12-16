import React, { useMemo, useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MenuDropdown from 'ui/MenuDropdown';
import { newTransientHttpRequest, newTransientGrpcRequest, newTransientWsRequest } from 'providers/ReduxStore/slices/collections/actions';
import toast from 'react-hot-toast';
import { IconApi, IconBrandGraphql, IconPlugConnected, IconCode, IconPlus } from '@tabler/icons';
import ActionIcon from 'ui/ActionIcon';
import ToolHint from 'components/ToolHint/index';

const CreateUntitledRequest = ({ collectionUid, itemUid = null, onRequestCreated, placement = 'bottom' }) => {
  const dispatch = useDispatch();
  const collections = useSelector((state) => state.collections.collections);
  const collection = collections?.find((c) => c.uid === collectionUid);

  const menuRef = useRef();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!collection) {
    return null;
  }

  const handleCreateHttpRequest = useCallback(async () => {
    dispatch(
      newTransientHttpRequest({
        requestName: 'Untitled',
        requestType: 'http-request',
        requestUrl: '',
        requestMethod: 'GET',
        collectionUid: collection.uid
      })
    )
      .then(() => {
        onRequestCreated?.();
      })
      .catch((err) => toast.error(err ? err.message : 'An error occurred while adding the request'));
  }, [dispatch, collection, itemUid, onRequestCreated]);

  const handleCreateGraphQLRequest = useCallback(async () => {
    dispatch(
      newTransientHttpRequest({
        requestName: 'Untitled',
        requestType: 'graphql-request',
        requestUrl: '',
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
  }, [dispatch, collection, itemUid, onRequestCreated]);

  const handleCreateWebSocketRequest = useCallback(async () => {
    dispatch(
      newTransientWsRequest({
        requestName: 'Untitled',
        requestUrl: '',
        requestMethod: 'ws',
        collectionUid: collection.uid
      })
    )
      .then(() => {
        onRequestCreated?.();
      })
      .catch((err) => toast.error(err ? err.message : 'An error occurred while adding the request'));
  }, [dispatch, collection, itemUid, onRequestCreated]);

  const handleCreateGrpcRequest = useCallback(async () => {
    dispatch(
      newTransientGrpcRequest({
        requestName: 'Untitled',
        requestUrl: '',
        collectionUid: collection.uid
      })
    )
      .then(() => {
        onRequestCreated?.();
      })
      .catch((err) => toast.error(err ? err.message : 'An error occurred while adding the request'));
  }, [dispatch, collection, itemUid, onRequestCreated]);

  // const menuItems = useMemo(() => [
  //   {
  //     id: 'http',
  //     label: 'HTTP',
  //     leftSection: <IconApi size={16} strokeWidth={2} />,
  //     onClick: handleCreateHttpRequest
  //   },
  //   {
  //     id: 'graphql',
  //     label: 'GraphQL',
  //     leftSection: <IconBrandGraphql size={16} strokeWidth={2} />,
  //     onClick: handleCreateGraphQLRequest
  //   },
  //   {
  //     id: 'websocket',
  //     label: 'WebSocket',
  //     leftSection: <IconPlugConnected size={16} strokeWidth={2} />,
  //     onClick: handleCreateWebSocketRequest
  //   },
  //   {
  //     id: 'grpc',
  //     label: 'gRPC',
  //     leftSection: <IconCode size={16} strokeWidth={2} />,
  //     onClick: handleCreateGrpcRequest
  //   }
  // ], [handleCreateHttpRequest, handleCreateGraphQLRequest, handleCreateWebSocketRequest, handleCreateGrpcRequest]);

  if (!collection) {
    return null;
  }

  const handleLeftClick = (e) => {
    handleCreateHttpRequest();
    // MenuDropdown will toggle open after this handler, so close it immediately
    requestAnimationFrame(() => {
      menuRef.current?.close();
      setIsMenuOpen(false);
    });
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(true);
    menuRef.current?.open();
  };

  // Wrapper to close menu state when a menu item is clicked
  const handleMenuItemClick = (originalOnClick) => () => {
    setIsMenuOpen(false);
    originalOnClick?.();
  };

  const menuItems = [
    {
      id: 'http',
      label: 'HTTP',
      leftSection: <IconApi size={16} strokeWidth={1.5} />,
      onClick: handleMenuItemClick(handleCreateHttpRequest)
    },
    {
      id: 'graphql',
      label: 'GraphQL',
      leftSection: <IconBrandGraphql size={16} strokeWidth={1.5} />,
      onClick: handleMenuItemClick(handleCreateGraphQLRequest)
    },
    {
      id: 'websocket',
      label: 'WebSocket',
      leftSection: <IconPlugConnected size={16} strokeWidth={1.5} />,
      onClick: handleMenuItemClick(handleCreateWebSocketRequest)
    },
    {
      id: 'grpc',
      label: 'gRPC',
      leftSection: <IconCode size={16} strokeWidth={1.5} />,
      onClick: handleMenuItemClick(handleCreateGrpcRequest)
    }
  ];

  return (
    <div onMouseLeave={() => setIsMenuOpen(false)}>
      <MenuDropdown
        ref={menuRef}
        items={menuItems}
        placement={placement}
        autoFocusFirstOption={true}
        data-testid="create-untitled-request"
      >
        <div>
          <ToolHint
            text="Click for new HTTP request. Right-click for more."
            toolhintId="create-untitled-request-toolhint"
            place="bottom"
            delayShow={800}
            hidden={isMenuOpen}
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
    </div>
  );
};

export default CreateUntitledRequest;
