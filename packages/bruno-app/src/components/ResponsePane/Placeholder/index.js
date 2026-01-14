import React from 'react';
import { IconSend, IconBolt, IconBox } from '@tabler/icons';
import { useSelector } from 'react-redux';
import StyledWrapper from './StyledWrapper';
import { isMacOS } from 'utils/common/platform';
import ToolHint from 'components/ToolHint';

const Placeholder = ({ item, collection }) => {
  const isMac = isMacOS();
  const sendRequestShortcut = isMac ? 'Cmd + Enter' : 'Ctrl + Enter';
  const newRequestShortcut = isMac ? 'Cmd + B' : 'Ctrl + B';
  const editEnvironmentShortcut = isMac ? 'Cmd + E' : 'Ctrl + E';
  const preferences = useSelector((state) => state.app.preferences);
  const isVerticalLayout = preferences?.layout?.responsePaneOrientation === 'vertical';

  // Detect request type
  // Standalone = transient request in virtual collection (no inheritance)
  // Collection = request in real collection (inherits everything, whether saved or transient)
  const isVirtualCollection = collection?.virtual === true || collection?.uid?.startsWith('virtual-');
  const isStandaloneRequest = item?.transient === true && isVirtualCollection;

  // Check if this is a special tab (not a regular request)
  const specialTabTypes = [
    'collection-settings', 'collection-overview', 'folder-settings',
    'variables', 'collection-runner', 'environment-settings',
    'global-environment-settings', 'workspace-overview',
    'workspace-git', 'workspace-environments'
  ];
  const isSpecialTab = specialTabTypes.includes(item?.type);
  // Show indicator for ALL requests (both transient and saved), but exclude special tabs
  const shouldShowIndicator = item && !isSpecialTab;

  const iconSize = isVerticalLayout ? 80 : 150;

  return (
    <StyledWrapper className={`${isVerticalLayout ? 'vertical-layout' : ''}`}>
      <div className="send-icon flex justify-center" style={{ fontSize: isVerticalLayout ? 100 : 200 }}>
        <IconSend size={iconSize} strokeWidth={1} />
      </div>
      {shouldShowIndicator && (
        <div className="request-type-indicator">
          <ToolHint
            text={isStandaloneRequest
              ? 'Independent request, not part of any collection'
              : 'Inherits all collection settings, scripts, variables, etc.'}
            toolhintId="request-type-indicator"
            place="top"
            delayShow={300}
          >
            <div className="indicator-heading">
              {isStandaloneRequest ? (
                <><IconBolt size={14} className="indicator-icon" /> Standalone Request</>
              ) : (
                <><IconBox size={14} className="indicator-icon" /> Collection Request</>
              )}
            </div>
          </ToolHint>
        </div>
      )}
      <div className={`flex ${isVerticalLayout ? 'mt-2' : 'mt-4'}`}>
        <div className="flex flex-1 flex-col items-end px-1">
          <div className="px-1 py-2">Send Request</div>
          <div className="px-1 py-2">New Request</div>
          <div className="px-1 py-2">Edit Environments</div>
        </div>
        <div className="flex flex-1 flex-col px-1">
          <div className="px-1 py-2">{sendRequestShortcut}</div>
          <div className="px-1 py-2">{newRequestShortcut}</div>
          <div className="px-1 py-2">{editEnvironmentShortcut}</div>
        </div>
      </div>
    </StyledWrapper>
  );
};

export default Placeholder;
