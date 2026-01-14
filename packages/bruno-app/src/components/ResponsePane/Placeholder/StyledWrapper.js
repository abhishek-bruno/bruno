import styled from 'styled-components';

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 20%;
  width: 100%;

  .send-icon {
    color: ${(props) => props.theme.background.surface2};
  }

  .request-type-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    margin-top: 16px;
    margin-bottom: 8px;

    .indicator-heading {
      font-size: 11px;
      font-weight: 500;
      color: ${(props) => props.theme.colors.text.muted};
      display: flex;
      align-items: center;
      gap: 5px;
      // background-color: ${(props) => props.theme.background.surface1};
      padding: 4px 10px;
      border-radius: 12px;
      border: 1px solid ${(props) => props.theme.border.border1};
    }

    .indicator-description {
      font-size: 11px;
      color: ${(props) => props.theme.colors.text.subtext0};
      text-align: center;
      max-width: 280px;
    }

    .indicator-icon {
      opacity: 0.8;
    }
  }

  &.vertical-layout {
    padding: 1rem;
    justify-content: center;

    .request-type-indicator {
      margin-top: 8px;
      margin-bottom: 4px;

      .indicator-heading {
        font-size: 10px;
        padding: 3px 8px;
        gap: 4px;
      }

      .indicator-description {
        font-size: 10px;
        max-width: 200px;
      }
    }
  }
`;

export default StyledWrapper;
