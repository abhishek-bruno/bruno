import React, { useState, useEffect, useRef, useCallback } from 'react';
import find from 'lodash/find';
import { useSelector, useDispatch } from 'react-redux';
import { produce } from 'immer';
import HttpRequestPane from 'components/RequestPane/HttpRequestPane';
import GraphQLRequestPane from 'components/RequestPane/GraphQLRequestPane';
import ResponsePane from 'components/ResponsePane';
import QueryUrl from 'components/RequestPane/QueryUrl/index';
import { findItemOrTransientInCollection } from 'utils/collections';
import { sendRequest, cancelRequest } from 'providers/ReduxStore/slices/collections/actions';
import { getGlobalEnvironmentVariables, getGlobalEnvironmentVariablesMasked } from 'utils/collections/index';
import { useTabPaneBoundaries } from 'hooks/useTabPaneBoundaries/index';
import StyledWrapper from './StyledWrapper';

const MIN_LEFT_PANE_WIDTH = 300;
const MIN_RIGHT_PANE_WIDTH = 490;

const WorkspaceRequestTabPanel = ({ tab }) => {
  const dispatch = useDispatch();
  const { itemUid, collectionUid } = tab;

  const { globalEnvironments, activeGlobalEnvironmentUid } = useSelector((state) => state.globalEnvironments);
  const _collections = useSelector((state) => state.collections.collections);
  const preferences = useSelector((state) => state.app.preferences);
  const isVerticalLayout = preferences?.layout?.responsePaneOrientation === 'vertical';

  // Merge global environment variables into the collection
  const collections = produce(_collections, (draft) => {
    const collection = find(draft, (c) => c.uid === collectionUid);
    if (collection) {
      const globalEnvironmentVariables = getGlobalEnvironmentVariables({
        globalEnvironments,
        activeGlobalEnvironmentUid
      });
      const globalEnvSecrets = getGlobalEnvironmentVariablesMasked({ globalEnvironments, activeGlobalEnvironmentUid });
      collection.globalEnvironmentVariables = globalEnvironmentVariables;
      collection.globalEnvSecrets = globalEnvSecrets;
    }
  });

  const collection = find(collections, (c) => c.uid === collectionUid);
  const item = collection ? findItemOrTransientInCollection(collection, itemUid) : null;

  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);
  const mainSectionRef = useRef(null);

  const { left: leftPaneWidth, reset: resetPaneBoundaries, setLeft: setLeftPaneWidth } = useTabPaneBoundaries(tab.uid);

  const handleMouseMove = useCallback((e) => {
    if (!draggingRef.current || !mainSectionRef.current) return;

    e.preventDefault();
    const mainRect = mainSectionRef.current.getBoundingClientRect();
    const newWidth = e.clientX - mainRect.left;
    const maxWidth = mainRect.width - MIN_RIGHT_PANE_WIDTH;
    const clampedWidth = Math.max(MIN_LEFT_PANE_WIDTH, Math.min(newWidth, maxWidth));
    setLeftPaneWidth(clampedWidth);
  }, [setLeftPaneWidth]);

  const handleMouseUp = useCallback(() => {
    draggingRef.current = false;
    setDragging(false);
  }, []);

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, handleMouseMove, handleMouseUp]);

  const handleDragbarMouseDown = useCallback((e) => {
    e.preventDefault();
    draggingRef.current = true;
    setDragging(true);
  }, []);

  const handleRun = async () => {
    if (!item || !collection) return;
    dispatch(sendRequest(item, collection.uid));
  };

  const handleCancel = () => {
    if (!item || !collection) return;
    dispatch(cancelRequest(item.cancelTokenUid, item, collection.uid));
  };

  if (!collection) {
    return <div className="p-4">Collection not found</div>;
  }

  if (!item) {
    return <div className="p-4">Request not found</div>;
  }

  const renderRequestPane = () => {
    switch (item.type) {
      case 'graphql-request':
        return <GraphQLRequestPane item={item} collection={collection} />;
      case 'http-request':
      default:
        return <HttpRequestPane item={item} collection={collection} />;
    }
  };

  const renderResponsePane = () => {
    return <ResponsePane item={item} collection={collection} response={item.response} />;
  };

  const requestPaneStyle = {
    width: `${Math.max(leftPaneWidth, MIN_LEFT_PANE_WIDTH)}px`
  };

  return (
    <StyledWrapper className={isVerticalLayout ? 'vertical-layout' : ''}>
      <div className="pt-3 pb-3 px-4">
        <QueryUrl item={item} collection={collection} handleRun={handleRun} />
      </div>
      <section ref={mainSectionRef} className={`main flex ${isVerticalLayout ? 'flex-col' : ''} flex-grow pb-4 relative overflow-auto`}>
        <section className="request-pane">
          <div className="px-4 h-full" style={requestPaneStyle}>
            {renderRequestPane()}
          </div>
        </section>

        <div
          className="dragbar-wrapper"
          onDoubleClick={(e) => {
            e.preventDefault();
            resetPaneBoundaries();
          }}
          onMouseDown={handleDragbarMouseDown}
        >
          <div className="dragbar-handle" />
        </div>

        <section className="response-pane flex-grow overflow-x-auto">
          {renderResponsePane()}
        </section>
      </section>
    </StyledWrapper>
  );
};

export default WorkspaceRequestTabPanel;
