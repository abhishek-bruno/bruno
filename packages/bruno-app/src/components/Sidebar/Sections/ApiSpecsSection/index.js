import { useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { IconFileCode, IconPlus } from '@tabler/icons';

import { openApiSpec } from 'providers/ReduxStore/slices/apiSpec';
import MenuDropdown from 'ui/MenuDropdown';
import ActionIcon from 'ui/ActionIcon';
import ToolHint from 'components/ToolHint';
import CreateApiSpec from 'components/Sidebar/ApiSpecs/CreateApiSpec';
import ApiSpecs from 'components/Sidebar/ApiSpecs';
import SidebarSection from 'components/Sidebar/SidebarSection';

const ApiSpecsSection = () => {
  const dispatch = useDispatch();
  const [createApiSpecModalOpen, setCreateApiSpecModalOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const handleOpenApiSpec = () => {
    dispatch(openApiSpec()).catch((err) => {
      console.error(err);
      toast.error('An error occurred while opening the API spec');
    });
  };

  const addDropdownItems = [
    {
      id: 'create-api-spec',
      leftSection: IconPlus,
      label: 'Create API Spec',
      onClick: () => {
        setCreateApiSpecModalOpen(true);
      }
    },
    {
      id: 'open-api-spec',
      leftSection: IconFileCode,
      label: 'Open API Spec',
      onClick: () => {
        handleOpenApiSpec();
      }
    }
  ];

  const sectionActions = (
    <>
      <MenuDropdown
        data-testid="api-specs-header-add-menu"
        items={addDropdownItems}
        placement="bottom-end"
        onShow={() => setIsAddMenuOpen(true)}
        onHide={() => setIsAddMenuOpen(false)}
      >
        <div>
          <ToolHint
            text="Add new API Spec"
            toolhintId="sidebar-add-api-spec"
            place="top"
            delayShow={800}
            hidden={isAddMenuOpen}
            positionStrategy="fixed"
          >
            <ActionIcon>
              <IconPlus size={14} stroke={1.5} aria-hidden="true" />
            </ActionIcon>
          </ToolHint>
        </div>
      </MenuDropdown>
    </>
  );

  return (
    <>
      {createApiSpecModalOpen && (
        <CreateApiSpec
          onClose={() => setCreateApiSpecModalOpen(false)}
        />
      )}
      <SidebarSection
        id="api-specs"
        title="API Specs"
        icon={IconFileCode}
        actions={sectionActions}
        className="api-specs-section"
      >
        <ApiSpecs />
      </SidebarSection>
    </>
  );
};

export default ApiSpecsSection;
