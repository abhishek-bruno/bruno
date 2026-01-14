import React, { useMemo, useState, useRef, forwardRef, useEffect } from 'react';
import find from 'lodash/find';
import Dropdown from 'components/Dropdown';
import { IconWorld, IconDatabase, IconCaretDown } from '@tabler/icons';
import { useSelector, useDispatch } from 'react-redux';
import { addTab } from 'providers/ReduxStore/slices/tabs';
import { selectEnvironment } from 'providers/ReduxStore/slices/collections/actions';
import { selectGlobalEnvironment } from 'providers/ReduxStore/slices/global-environments';
import toast from 'react-hot-toast';
import EnvironmentListContent from './EnvironmentListContent/index';
import CreateEnvironment from '../EnvironmentSettings/CreateEnvironment';
import ImportEnvironmentModal from 'components/Environments/Common/ImportEnvironmentModal';
import CreateGlobalEnvironment from 'components/WorkspaceHome/WorkspaceEnvironments/CreateEnvironment';
import ToolHint from 'components/ToolHint';
import StyledWrapper from './StyledWrapper';

const EnvironmentSelector = ({ collection }) => {
  const dispatch = useDispatch();
  const dropdownTippyRef = useRef();
  const isVirtual = collection?.virtual;
  // For virtual collections, always default to 'global' tab
  const [activeTab, setActiveTab] = useState(isVirtual ? 'global' : 'collection');
  const [showCreateGlobalModal, setShowCreateGlobalModal] = useState(false);
  const [showImportGlobalModal, setShowImportGlobalModal] = useState(false);
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [showImportCollectionModal, setShowImportCollectionModal] = useState(false);

  const globalEnvironments = useSelector((state) => state.globalEnvironments.globalEnvironments);
  const activeGlobalEnvironmentUid = useSelector((state) => state.globalEnvironments.activeGlobalEnvironmentUid);
  const activeGlobalEnvironment = activeGlobalEnvironmentUid
    ? find(globalEnvironments, (e) => e.uid === activeGlobalEnvironmentUid)
    : null;

  const environments = collection?.environments || [];
  const activeEnvironmentUid = collection?.activeEnvironmentUid;
  const activeCollectionEnvironment = activeEnvironmentUid
    ? find(environments, (e) => e.uid === activeEnvironmentUid)
    : null;

  // Sync activeTab when isVirtual changes (e.g., when collection loads)
  useEffect(() => {
    if (isVirtual && activeTab !== 'global') {
      setActiveTab('global');
    }
  }, [isVirtual, activeTab]);

  // For virtual collections, only show Global tab
  const tabs = isVirtual
    ? [{ id: 'global', label: 'Global', icon: <IconWorld size={16} strokeWidth={1.5} /> }]
    : [
        { id: 'collection', label: 'Collection', icon: <IconDatabase size={16} strokeWidth={1.5} /> },
        { id: 'global', label: 'Global', icon: <IconWorld size={16} strokeWidth={1.5} /> }
      ];

  const onDropdownCreate = (ref) => {
    dropdownTippyRef.current = ref;
  };

  // Get description based on active tab
  const description
    = activeTab === 'collection'
      ? 'Create your first environment to begin working with your collection.'
      : 'Create your first global environment to begin working across collections.';

  // Environment selection handler
  const handleEnvironmentSelect = (environment) => {
    // For virtual collections, always use global environment selection
    // Also use global selection when activeTab is 'global'
    const useGlobalSelection = isVirtual || activeTab === 'global';

    const action = useGlobalSelection
      ? selectGlobalEnvironment({ environmentUid: environment ? environment.uid : null })
      : selectEnvironment(environment ? environment.uid : null, collection.uid);

    dispatch(action)
      .then(() => {
        if (environment) {
          toast.success(`Environment changed to ${environment.name}`);
        } else {
          toast.success('No Environments are active now');
        }
        dropdownTippyRef.current.hide();
      })
      .catch((err) => {
        toast.error('An error occurred while selecting the environment');
      });
  };

  // Settings handler - opens environment settings tab
  const handleSettingsClick = () => {
    if (activeTab === 'collection') {
      dispatch(
        addTab({
          uid: `${collection.uid}-environment-settings`,
          collectionUid: collection.uid,
          type: 'environment-settings'
        })
      );
    } else {
      dispatch(
        addTab({
          uid: `${collection.uid}-global-environment-settings`,
          collectionUid: collection.uid,
          type: 'global-environment-settings'
        })
      );
    }
    dropdownTippyRef.current.hide();
  };

  // Create handler
  const handleCreateClick = () => {
    if (activeTab === 'collection') {
      setShowCreateCollectionModal(true);
    } else {
      setShowCreateGlobalModal(true);
    }
    dropdownTippyRef.current.hide();
  };

  // Import handler
  const handleImportClick = () => {
    if (activeTab === 'collection') {
      setShowImportCollectionModal(true);
    } else {
      setShowImportGlobalModal(true);
    }
    dropdownTippyRef.current.hide();
  };

  // Calculate dropdown width based on the longest environment name.
  // To prevent resizing while switching between collection and global environments.
  const dropdownWidth = useMemo(() => {
    const allEnvironments = [...environments, ...globalEnvironments];
    if (allEnvironments.length === 0) return 0;

    const maxCharLength = Math.max(...allEnvironments.map((env) => env.name?.length || 0));
    // 8 pixels per character: This is a rough estimate for the average character width in most fonts
    // (monospace fonts are typically 8-10px, proportional fonts vary but 8px is a safe average)
    return maxCharLength * 8;
  }, [environments, globalEnvironments]);

  // Create icon component for dropdown trigger
  const Icon = forwardRef((props, ref) => {
    // For virtual collections, only consider global environment
    const hasAnyEnv = isVirtual
      ? activeGlobalEnvironment
      : activeGlobalEnvironment || activeCollectionEnvironment;

    const displayContent = hasAnyEnv ? (
      <>
        {/* Hide collection environment display for virtual collections */}
        {!isVirtual && activeCollectionEnvironment && (
          <>
            <div className="flex items-center">
              <IconDatabase size={14} strokeWidth={1.5} className="env-icon" />
              <ToolHint
                text={activeCollectionEnvironment.name}
                toolhintId={`collection-env-${activeCollectionEnvironment.uid}`}
                place="bottom-start"
                delayShow={1000}
                hidden={activeCollectionEnvironment.name?.length < 7}
              >
                <span className="env-text max-w-24 truncate overflow-hidden">{activeCollectionEnvironment.name}</span>
              </ToolHint>
            </div>
            {activeGlobalEnvironment && <span className="env-separator">|</span>}
          </>
        )}
        {activeGlobalEnvironment && (
          <div className="flex items-center">
            {/* Hide globe icon for virtual collections (workspace context) */}
            {!isVirtual && <IconWorld size={14} strokeWidth={1.5} className="env-icon" />}
            <ToolHint
              text={activeGlobalEnvironment.name}
              toolhintId={`global-env-${activeGlobalEnvironment.uid}`}
              place="bottom-start"
              delayShow={1000}
              hidden={activeGlobalEnvironment.name?.length < 7}
            >
              <span className="env-text max-w-24 truncate overflow-hidden">{activeGlobalEnvironment.name}</span>
            </ToolHint>
          </div>
        )}
      </>
    ) : (
      <span className="env-text-inactive max-w-36 truncate no-wrap">No Environment</span>
    );

    return (
      <div
        ref={ref}
        className={`current-environment flex align-center justify-center cursor-pointer bg-transparent ${
          !hasAnyEnv ? 'no-environments' : ''
        }`}
        data-testid="environment-selector-trigger"
      >
        {displayContent}
        <IconCaretDown className="caret flex items-center justify-center" size={12} strokeWidth={2} />
      </div>
    );
  });

  return (
    <StyledWrapper width={dropdownWidth}>
      <div className="environment-selector flex align-center cursor-pointer">
        <Dropdown onCreate={onDropdownCreate} icon={<Icon />} placement="bottom-end">
          {/* Tab Headers - hide for virtual collections since only global is available */}
          {!isVirtual && (
            <div className="tab-header flex pt-3 pb-2 px-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-button whitespace-nowrap pb-[0.375rem] border-b-[0.125rem] bg-transparent flex align-center cursor-pointer transition-all duration-200 mr-[1.25rem] ${
                    activeTab === tab.id ? 'active' : 'inactive'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                  data-testid={`env-tab-${tab.id}`}
                >
                  <span className="tab-content-wrapper">
                    {tab.icon}
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Tab Content */}
          <div className={`tab-content ${isVirtual ? 'pt-2' : ''}`}>
            <EnvironmentListContent
              environments={isVirtual ? globalEnvironments : (activeTab === 'collection' ? environments : globalEnvironments)}
              activeEnvironmentUid={isVirtual ? activeGlobalEnvironmentUid : (activeTab === 'collection' ? activeEnvironmentUid : activeGlobalEnvironmentUid)}
              description={description}
              onEnvironmentSelect={handleEnvironmentSelect}
              onSettingsClick={handleSettingsClick}
              onCreateClick={handleCreateClick}
              onImportClick={handleImportClick}
            />
          </div>
        </Dropdown>
      </div>

      {showCreateGlobalModal && (
        <CreateGlobalEnvironment
          onClose={() => setShowCreateGlobalModal(false)}
          onEnvironmentCreated={() => {
            dispatch(
              addTab({
                uid: `${collection.uid}-global-environment-settings`,
                collectionUid: collection.uid,
                type: 'global-environment-settings'
              })
            );
          }}
        />
      )}

      {showImportGlobalModal && (
        <ImportEnvironmentModal
          type="global"
          onClose={() => setShowImportGlobalModal(false)}
          onEnvironmentCreated={() => {
            dispatch(
              addTab({
                uid: `${collection.uid}-global-environment-settings`,
                collectionUid: collection.uid,
                type: 'global-environment-settings'
              })
            );
          }}
        />
      )}

      {showCreateCollectionModal && (
        <CreateEnvironment
          collection={collection}
          onClose={() => setShowCreateCollectionModal(false)}
          onEnvironmentCreated={() => {
            dispatch(
              addTab({
                uid: `${collection.uid}-environment-settings`,
                collectionUid: collection.uid,
                type: 'environment-settings'
              })
            );
          }}
        />
      )}

      {showImportCollectionModal && (
        <ImportEnvironmentModal
          type="collection"
          collection={collection}
          onClose={() => setShowImportCollectionModal(false)}
          onEnvironmentCreated={() => {
            dispatch(
              addTab({
                uid: `${collection.uid}-environment-settings`,
                collectionUid: collection.uid,
                type: 'environment-settings'
              })
            );
          }}
        />
      )}
    </StyledWrapper>
  );
};

export default EnvironmentSelector;
