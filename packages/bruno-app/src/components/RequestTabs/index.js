import React, { useRef, useEffect, useCallback, useState } from 'react';
import find from 'lodash/find';
import filter from 'lodash/filter';
import classnames from 'classnames';
import { IconChevronRight, IconChevronLeft } from '@tabler/icons';
import { useSelector, useDispatch } from 'react-redux';
import { focusTab, reorderTabs } from 'providers/ReduxStore/slices/tabs';
import CollectionToolBar from './CollectionToolBar';
import RequestTab from './RequestTab';
import StyledWrapper from './StyledWrapper';
import DraggableTab from './DraggableTab';
import CreateTransientRequest from 'components/CreateTransientRequest';
import ActionIcon from 'ui/ActionIcon/index';
import { createOrGetVirtualCollection } from 'providers/ReduxStore/slices/collections';

const RequestTabs = () => {
  const dispatch = useDispatch();
  const tabsRef = useRef();
  const scrollContainerRef = useRef();
  const collectionTabsRef = useRef();
  const [tabOverflowStates, setTabOverflowStates] = useState({});
  const [showChevrons, setShowChevrons] = useState(false);
  const allTabs = useSelector((state) => state.tabs.tabs);
  const activeTabUid = useSelector((state) => state.tabs.activeTabUid);
  const collections = useSelector((state) => state.collections.collections);
  const leftSidebarWidth = useSelector((state) => state.app.leftSidebarWidth);
  const sidebarCollapsed = useSelector((state) => state.app.sidebarCollapsed);
  const screenWidth = useSelector((state) => state.app.screenWidth);
  const { workspaces, activeWorkspaceUid } = useSelector((state) => state.workspaces);
  const activeWorkspace = workspaces?.find((w) => w.uid === activeWorkspaceUid);

  // Filter tabs to only show tabs from the current workspace
  // Tabs without workspaceUid are considered to belong to all workspaces (backward compatibility)
  const tabs = allTabs.filter((t) => !t.workspaceUid || t.workspaceUid === activeWorkspaceUid);

  const createSetHasOverflow = useCallback((tabUid) => {
    return (hasOverflow) => {
      setTabOverflowStates((prev) => {
        if (prev[tabUid] === hasOverflow) {
          return prev;
        }
        return {
          ...prev,
          [tabUid]: hasOverflow
        };
      });
    };
  }, []);

  // Only look for active tab within workspace-filtered tabs
  const activeTab = find(tabs, (t) => t.uid === activeTabUid);

  // When no active tab, use the virtual collection for the workspace
  const virtualCollectionUid = activeWorkspaceUid ? `virtual-${activeWorkspaceUid}` : null;
  const virtualCollection = virtualCollectionUid ? find(collections, (c) => c.uid === virtualCollectionUid) : null;

  const activeCollection = activeTab
    ? find(collections, (c) => c.uid === activeTab.collectionUid)
    : virtualCollection;
  const collectionRequestTabs = activeTab
    ? filter(tabs, (t) => t.collectionUid === activeTab.collectionUid)
    : [];

  useEffect(() => {
    if (!activeTabUid || !activeTab) return;

    const checkOverflow = () => {
      if (tabsRef.current && scrollContainerRef.current) {
        const hasOverflow = tabsRef.current.scrollWidth > scrollContainerRef.current.clientWidth;
        setShowChevrons(hasOverflow);
      }
    };

    checkOverflow();
    const resizeObserver = new ResizeObserver(checkOverflow);
    if (scrollContainerRef.current) {
      resizeObserver.observe(scrollContainerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [activeTabUid, activeTab, collectionRequestTabs.length, screenWidth, leftSidebarWidth, sidebarCollapsed]);

  const getTabClassname = (tab, index) => {
    return classnames('request-tab select-none', {
      'active': tab.uid === activeTabUid,
      'last-tab': tabs && tabs.length && index === tabs.length - 1,
      'has-overflow': tabOverflowStates[tab.uid]
    });
  };

  const handleClick = (tab) => {
    dispatch(
      focusTab({
        uid: tab.uid
      })
    );
  };

  // Ensure virtual collection exists when no tabs are open
  useEffect(() => {
    if (!activeTabUid && activeWorkspaceUid && activeWorkspace && !virtualCollection) {
      dispatch(createOrGetVirtualCollection({ workspaceUid: activeWorkspaceUid, workspaceName: activeWorkspace.name }));
    }
  }, [activeTabUid, activeWorkspaceUid, activeWorkspace, virtualCollection, dispatch]);

  // Show toolbar even when no tabs are open (workspace home)
  // Only return null if virtual collection hasn't been created yet
  if (!virtualCollection && !activeTab) {
    return null;
  }

  const effectiveSidebarWidth = sidebarCollapsed ? 0 : leftSidebarWidth;
  const maxTablistWidth = screenWidth - effectiveSidebarWidth - 150;

  const leftSlide = () => {
    scrollContainerRef.current?.scrollBy({
      left: -120,
      behavior: 'smooth'
    });
  };

  const rightSlide = () => {
    scrollContainerRef.current?.scrollBy({
      left: 120,
      behavior: 'smooth'
    });
  };


  return (
    <StyledWrapper>
      <CollectionToolBar collection={activeCollection} />
      <div className="flex items-center gap-2 pl-2" ref={collectionTabsRef}>
        <div className={classnames('scroll-chevrons', { hidden: !showChevrons })}>
          <ActionIcon size="lg" onClick={leftSlide} aria-label="Left Chevron" style={{ marginBottom: '3px' }}>
            <IconChevronLeft size={18} strokeWidth={1.5} />
          </ActionIcon>
        </div>

        <div className="tabs-scroll-container" style={{ maxWidth: maxTablistWidth }} ref={scrollContainerRef}>
          <ul role="tablist" ref={tabsRef}>
            {collectionRequestTabs && collectionRequestTabs.length
              ? collectionRequestTabs.map((tab, index) => {
                  return (
                    <DraggableTab
                      key={tab.uid}
                      id={tab.uid}
                      index={index}
                      onMoveTab={(source, target) => {
                        dispatch(reorderTabs({
                          sourceUid: source,
                          targetUid: target
                        }));
                      }}
                      className={getTabClassname(tab, index)}
                      onClick={() => handleClick(tab)}
                    >
                      <RequestTab
                        collectionRequestTabs={collectionRequestTabs}
                        tabIndex={index}
                        key={tab.uid}
                        tab={tab}
                        collection={activeCollection}
                        folderUid={tab.folderUid}
                        hasOverflow={tabOverflowStates[tab.uid]}
                        setHasOverflow={createSetHasOverflow(tab.uid)}
                        dropdownContainerRef={collectionTabsRef}
                      />
                    </DraggableTab>
                  );
                })
              : null}
          </ul>
        </div>

        {activeCollection && (
          <CreateTransientRequest
            collectionUid={activeCollection.uid}
            placement="bottom"
            location="tabs"
            tooltipPlacement="bottom"
            tooltipPositionStrategy="fixed"
          />
        )}

        <div className={classnames('scroll-chevrons', { hidden: !showChevrons })}>
          <ActionIcon size="lg" onClick={rightSlide} aria-label="Right Chevron" style={{ marginBottom: '3px' }}>
            <IconChevronRight size={18} strokeWidth={1.5} />
          </ActionIcon>
        </div>
      </div>
    </StyledWrapper>
  );
};

export default RequestTabs;
