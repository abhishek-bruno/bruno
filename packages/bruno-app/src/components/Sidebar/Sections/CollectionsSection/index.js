import { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconArrowsSort,
  IconDotsVertical,
  IconDownload,
  IconFolder,
  IconFolderPlus,
  IconSearch,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
  IconSquareX,
  IconBox,
  IconTerminal2
} from '@tabler/icons';

import { importCollection, openCollection } from 'providers/ReduxStore/slices/collections/actions';
import { createOrGetVirtualCollection } from 'providers/ReduxStore/slices/collections';
import { sortCollections } from 'providers/ReduxStore/slices/collections/index';
import { normalizePath } from 'utils/common/path';

import MenuDropdown from 'ui/MenuDropdown';
import ActionIcon from 'ui/ActionIcon';
import ToolHint from 'components/ToolHint';
import CreateTransientRequest from 'components/CreateTransientRequest';
import ImportCollection from 'components/Sidebar/ImportCollection';
import ImportCollectionLocation from 'components/Sidebar/ImportCollectionLocation';
import RemoveCollectionsModal from 'components/Sidebar/Collections/RemoveCollectionsModal/index';
import CreateCollection from 'components/Sidebar/CreateCollection';
import Collections from 'components/Sidebar/Collections';
import SidebarSection from 'components/Sidebar/SidebarSection';
import { openDevtoolsAndSwitchToTerminal } from 'utils/terminal';

const CollectionsSection = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [isCollectionActionsOpen, setIsCollectionActionsOpen] = useState(false);
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false);
  const dispatch = useDispatch();

  const { workspaces, activeWorkspaceUid } = useSelector((state) => state.workspaces);
  const activeWorkspace = workspaces.find((w) => w.uid === activeWorkspaceUid);

  const { collections, collectionSortOrder } = useSelector((state) => state.collections);

  // Check if virtual collection exists for the active workspace
  const virtualCollectionUid = activeWorkspaceUid ? `virtual-${activeWorkspaceUid}` : null;
  const virtualCollectionExists = virtualCollectionUid ? collections.some((c) => c.uid === virtualCollectionUid) : false;
  const [collectionsToClose, setCollectionsToClose] = useState([]);

  const [importData, setImportData] = useState(null);
  const [createCollectionModalOpen, setCreateCollectionModalOpen] = useState(false);
  const [importCollectionModalOpen, setImportCollectionModalOpen] = useState(false);
  const [importCollectionLocationModalOpen, setImportCollectionLocationModalOpen] = useState(false);

  // Ensure virtual collection exists for the active workspace
  useEffect(() => {
    if (activeWorkspaceUid && activeWorkspace) {
      dispatch(createOrGetVirtualCollection({
        workspaceUid: activeWorkspaceUid,
        workspaceName: activeWorkspace.name
      }));
    }
  }, [activeWorkspaceUid, activeWorkspace, dispatch]);

  const workspaceCollections = useMemo(() => {
    if (!activeWorkspace) return [];
    return collections.filter((c) =>
      activeWorkspace.collections?.some((wc) => normalizePath(wc.path) === normalizePath(c.pathname))
    );
  }, [activeWorkspace, collections]);

  const handleImportCollection = ({ rawData, type }) => {
    setImportCollectionModalOpen(false);
    setImportData({ rawData, type });
    setImportCollectionLocationModalOpen(true);
  };

  const handleImportCollectionLocation = (convertedCollection, collectionLocation, options = {}) => {
    dispatch(importCollection(convertedCollection, collectionLocation, options))
      .then(() => {
        setImportCollectionLocationModalOpen(false);
        setImportData(null);
        toast.success('Collection imported successfully');
      })
      .catch((err) => {
        console.error(err);
        toast.error('An error occurred while importing the collection');
      });
  };

  const handleToggleSearch = () => {
    setShowSearch((prev) => !prev);
  };

  const handleSortCollections = () => {
    let order;
    switch (collectionSortOrder) {
      case 'default':
        order = 'alphabetical';
        break;
      case 'alphabetical':
        order = 'reverseAlphabetical';
        break;
      case 'reverseAlphabetical':
        order = 'default';
        break;
      default:
        order = 'default';
        break;
    }
    dispatch(sortCollections({ order }));
  };

  const getSortIcon = () => {
    switch (collectionSortOrder) {
      case 'alphabetical':
        return IconSortDescendingLetters;
      case 'reverseAlphabetical':
        return IconArrowsSort;
      default:
        return IconSortAscendingLetters;
    }
  };

  const getSortLabel = () => {
    switch (collectionSortOrder) {
      case 'alphabetical':
        return 'Sort Z-A';
      case 'reverseAlphabetical':
        return 'Clear sort';
      default:
        return 'Sort A-Z';
    }
  };

  const selectAllCollectionsToClose = () => {
    setCollectionsToClose(workspaceCollections.map((c) => c.uid));
  };

  const clearCollectionsToClose = () => {
    setCollectionsToClose([]);
  };

  const handleOpenCollection = () => {
    const options = {};
    if (activeWorkspace?.pathname) {
      options.workspaceId = activeWorkspace.pathname;
    }

    dispatch(openCollection(options)).catch((err) => {
      toast.error('An error occurred while opening the collection');
    });
  };

  const addDropdownItems = [
    {
      id: 'create',
      leftSection: IconFolderPlus,
      label: 'Create collection',
      onClick: () => {
        setCreateCollectionModalOpen(true);
      }
    },
    {
      id: 'open',
      leftSection: IconFolder,
      label: 'Open collection',
      onClick: () => {
        handleOpenCollection();
      }
    },
    {
      id: 'import',
      leftSection: IconDownload,
      label: 'Import collection',
      onClick: () => {
        setImportCollectionModalOpen(true);
      }
    }
  ];

  const actionsDropdownItems = [
    {
      id: 'sort',
      leftSection: getSortIcon(),
      label: getSortLabel(),
      onClick: () => {
        handleSortCollections();
      }
    },
    {
      id: 'close-all',
      leftSection: IconSquareX,
      label: 'Close all',
      onClick: () => {
        selectAllCollectionsToClose();
      }
    },
    {
      id: 'open-in-terminal',
      leftSection: IconTerminal2,
      label: 'Open in Terminal',
      onClick: () => {
        openDevtoolsAndSwitchToTerminal(dispatch, activeWorkspace?.pathname);
      }
    }
  ];

  const sectionActions = (
    <>
      <ToolHint
        text="Search requests"
        toolhintId="sidebar-search-requests"
        place="bottom"
        delayShow={800}
        positionStrategy="fixed"
      >
        <ActionIcon
          data-testid="collections-search"
          onClick={handleToggleSearch}
        >
          <IconSearch size={14} stroke={1.5} aria-hidden="true" />
        </ActionIcon>
      </ToolHint>

      <MenuDropdown
        data-testid="collections-header-add-menu"
        items={addDropdownItems}
        placement="bottom-end"
        onShow={() => setIsCollectionActionsOpen(true)}
        onHide={() => setIsCollectionActionsOpen(false)}
      >
        <div>
          <ToolHint
            text="Create/Open/Import Collection"
            toolhintId="sidebar-collection-actions"
            place="bottom"
            delayShow={800}
            hidden={isCollectionActionsOpen}
            positionStrategy="fixed"
          >
            <ActionIcon data-testid="collections-actions">
              <IconFolderPlus size={14} stroke={1.5} aria-hidden="true" />
            </ActionIcon>
          </ToolHint>
        </div>
      </MenuDropdown>

      {virtualCollectionExists && (
        <CreateTransientRequest
          collectionUid={virtualCollectionUid}
          placement="bottom"
          tooltipPlacement="bottom"
          tooltipPositionStrategy="fixed"
          location="sidebar"
        />
      )}

      <MenuDropdown
        data-testid="collections-header-actions-menu"
        items={actionsDropdownItems}
        placement="bottom-end"
        onShow={() => setIsMoreActionsOpen(true)}
        onHide={() => setIsMoreActionsOpen(false)}
      >
        <div>
          <ToolHint
            text="More actions"
            toolhintId="sidebar-more-actions"
            place="bottom"
            delayShow={800}
            hidden={isMoreActionsOpen}
            positionStrategy="fixed"
          >
            <ActionIcon data-testid="collections-more-actions">
              <IconDotsVertical size={14} stroke={1.5} aria-hidden="true" />
            </ActionIcon>
          </ToolHint>
        </div>
      </MenuDropdown>

      {collectionsToClose.length > 0 && (
        <RemoveCollectionsModal collectionUids={collectionsToClose} onClose={clearCollectionsToClose} />
      )}
    </>
  );

  return (
    <>
      {createCollectionModalOpen && (
        <CreateCollection
          onClose={() => setCreateCollectionModalOpen(false)}
        />
      )}
      {importCollectionModalOpen && (
        <ImportCollection
          onClose={() => setImportCollectionModalOpen(false)}
          handleSubmit={handleImportCollection}
        />
      )}
      {importCollectionLocationModalOpen && importData && (
        <ImportCollectionLocation
          rawData={importData.rawData}
          format={importData.type}
          onClose={() => setImportCollectionLocationModalOpen(false)}
          handleSubmit={handleImportCollectionLocation}
        />
      )}
      <SidebarSection
        id="collections"
        title="Collections"
        icon={IconBox}
        actions={sectionActions}
      >
        <Collections showSearch={showSearch} />
      </SidebarSection>
    </>
  );
};

export default CollectionsSection;
