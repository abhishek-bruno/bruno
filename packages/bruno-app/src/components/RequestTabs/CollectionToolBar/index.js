import React, { useMemo } from 'react';
import { uuid } from 'utils/common';
import { IconBox, IconRun, IconEye, IconSettings, IconCategory, IconChevronDown, IconHome, IconWorld } from '@tabler/icons';
import EnvironmentSelector from 'components/Environments/EnvironmentSelector';
import { addTab, switchCollectionContext } from 'providers/ReduxStore/slices/tabs';
import { useDispatch, useSelector } from 'react-redux';
import ToolHint from 'components/ToolHint';
import StyledWrapper from './StyledWrapper';
import JsSandboxMode from 'components/SecuritySettings/JsSandboxMode';
import ActionIcon from 'ui/ActionIcon';
import Button from 'ui/Button';
import MenuDropdown from 'ui/MenuDropdown';

const CollectionToolBar = ({ collection }) => {
  const dispatch = useDispatch();
  const tabs = useSelector((state) => state.tabs.tabs);
  const activeTabUid = useSelector((state) => state.tabs.activeTabUid);
  const collections = useSelector((state) => state.collections.collections);
  const { activeWorkspaceUid } = useSelector((state) => state.workspaces);

  // Compute opened collections with tab counts
  const openedCollections = useMemo(() => {
    // Filter tabs to only show tabs from the current workspace
    // Tabs without workspaceUid are considered to belong to all workspaces (backward compatibility)
    const workspaceTabs = tabs.filter((t) => !t.workspaceUid || t.workspaceUid === activeWorkspaceUid);

    // Group tabs by collectionUid and count them
    const tabCountByCollection = {};
    const firstTabByCollection = {};

    workspaceTabs.forEach((tab) => {
      if (!tabCountByCollection[tab.collectionUid]) {
        tabCountByCollection[tab.collectionUid] = 0;
        firstTabByCollection[tab.collectionUid] = tab.uid;
      }
      tabCountByCollection[tab.collectionUid]++;
    });

    // Build the list of opened collections
    const result = [];
    const virtualCollectionUid = activeWorkspaceUid ? `virtual-${activeWorkspaceUid}` : null;

    Object.keys(tabCountByCollection).forEach((collectionUid) => {
      const coll = collections.find((c) => c.uid === collectionUid);
      if (coll) {
        result.push({
          uid: coll.uid,
          name: coll.name,
          tabCount: tabCountByCollection[collectionUid],
          firstTabUid: firstTabByCollection[collectionUid],
          isVirtual: coll.virtual === true,
          importedAt: coll.importedAt
        });
      }
    });

    // Always include virtual collection, even with 0 tabs
    if (virtualCollectionUid) {
      const virtualColl = collections.find((c) => c.uid === virtualCollectionUid);
      const alreadyIncluded = result.some((r) => r.uid === virtualCollectionUid);

      if (virtualColl && !alreadyIncluded) {
        result.push({
          uid: virtualColl.uid,
          name: virtualColl.name,
          tabCount: 0,
          firstTabUid: null,
          isVirtual: true,
          importedAt: virtualColl.importedAt
        });
      }
    }

    // Sort: virtual collection first (Workspace Home), then by importedAt (oldest to newest)
    result.sort((a, b) => {
      if (a.isVirtual && !b.isVirtual) return -1;
      if (!a.isVirtual && b.isVirtual) return 1;

      // Sort by importedAt timestamp (ascending - older collections first)
      const aImportedAt = a.importedAt || 0;
      const bImportedAt = b.importedAt || 0;
      return aImportedAt - bImportedAt;
    });

    return result;
  }, [tabs, collections, activeWorkspaceUid]);

  // Build dropdown menu items
  const collectionMenuItems = useMemo(() => {
    return openedCollections.map((coll) => ({
      id: coll.uid,
      label: `${coll.name} (${coll.tabCount})`,
      leftSection: coll.isVirtual ? IconCategory : IconBox,
      onClick: () => {
        // Get current collection to save its state
        const currentTab = tabs.find((t) => t.uid === activeTabUid);
        const fromCollectionUid = currentTab?.collectionUid;

        // Switch to target collection and restore last focused tab
        dispatch(switchCollectionContext({
          fromCollectionUid,
          toCollectionUid: coll.uid
        }));
      }
    }));
  }, [openedCollections, dispatch, tabs, activeTabUid]);

  const handleRun = () => {
    dispatch(
      addTab({
        uid: uuid(),
        collectionUid: collection.uid,
        type: 'collection-runner'
      })
    );
  };

  const viewVariables = () => {
    dispatch(
      addTab({
        uid: uuid(),
        collectionUid: collection.uid,
        type: 'variables'
      })
    );
  };

  const viewCollectionSettings = () => {
    dispatch(
      addTab({
        uid: collection.uid,
        collectionUid: collection.uid,
        type: 'collection-settings'
      })
    );
  };

  // Workspace-specific tab handlers for virtual collections
  const openWorkspaceOverview = () => {
    dispatch(
      addTab({
        uid: `${collection.uid}-overview`,
        collectionUid: collection.uid,
        type: 'workspace-overview'
      })
    );
  };

  const openWorkspaceEnvironments = () => {
    dispatch(
      addTab({
        uid: `${collection.uid}-environments`,
        collectionUid: collection.uid,
        type: 'workspace-environments'
      })
    );
  };

  const isVirtual = collection?.virtual;

  // Only show dropdown if there are multiple collections with open tabs
  const showDropdown = openedCollections.length > 1;

  const renderCollectionName = () => {
    const icon = isVirtual ? (
      <IconCategory size={18} strokeWidth={1.5} />
    ) : (
      <IconBox size={18} strokeWidth={1.5} />
    );

    const nameContent = (
      <div className="collection-name-container">
        {icon}
        <span className="collection-name">{collection?.name}</span>
        {showDropdown && <IconChevronDown size={14} strokeWidth={1.5} className="chevron-icon" />}
      </div>
    );

    if (showDropdown) {
      return (
        <MenuDropdown
          items={collectionMenuItems}
          placement="bottom-start"
          selectedItemId={collection?.uid}
        >
          {nameContent}
        </MenuDropdown>
      );
    }

    // If only one collection, clicking opens collection settings (for regular collections)
    if (!isVirtual) {
      return (
        <button
          className="collection-name-container collection-name-button"
          onClick={viewCollectionSettings}
        >
          {icon}
          <span className="collection-name">{collection?.name}</span>
        </button>
      );
    }

    // Virtual collection with no dropdown - just display the name
    return nameContent;
  };

  return (
    <StyledWrapper>
      <div className="flex items-center justify-between gap-2 py-2 px-4">
        <div className="mr-4">
          {renderCollectionName()}
        </div>
        <div className="flex flex-grow gap-2 items-center justify-end">
          {isVirtual ? (
            <>
              <Button variant="filled" color="secondary" size="sm" onClick={openWorkspaceOverview} icon={<IconHome size={14} strokeWidth={1.5} style={{ color: 'hsl(45, 75%, 42%)' }} />}>
                Overview
              </Button>
            </>
          ) : (
            <>
              <ToolHint text="Runner" toolhintId="RunnerToolhintId" place="bottom">
                <ActionIcon onClick={handleRun} aria-label="Runner" size="sm">
                  <IconRun size={16} strokeWidth={1.5} />
                </ActionIcon>
              </ToolHint>
              <ToolHint text="Variables" toolhintId="VariablesToolhintId">
                <ActionIcon onClick={viewVariables} aria-label="Variables" size="sm">
                  <IconEye size={16} strokeWidth={1.5} />
                </ActionIcon>
              </ToolHint>
              <ToolHint text="Collection Settings" toolhintId="CollectionSettingsToolhintId">
                <ActionIcon onClick={viewCollectionSettings} aria-label="Collection Settings" size="sm">
                  <IconSettings size={16} strokeWidth={1.5} />
                </ActionIcon>
              </ToolHint>
              {/* ToolHint is present within the JsSandboxMode component */}
              <JsSandboxMode collection={collection} />
            </>
          )}
          <div className="environment-button-group">
            {isVirtual && (
              <ToolHint text="Global Environments" toolhintId="GlobalEnvironmentsToolhintId" place="bottom">
                <ActionIcon onClick={openWorkspaceEnvironments} aria-label="Global Environments" size="sm" color="hsl(45, 75%, 42%)">
                  <IconWorld size={16} strokeWidth={1.5} />
                </ActionIcon>
              </ToolHint>
            )}
            <EnvironmentSelector collection={collection} />
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

export default CollectionToolBar;
