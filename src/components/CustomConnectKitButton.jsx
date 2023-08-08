import { ConnectKitButton } from "connectkit";

import styled from "styled-components";

 const CustomConnectKitButton = ({ width = "auto" }) => {
  const StyledButton = styled.button`
    cursor: pointer;
    display: inline-block;
    padding: 10px 24px;
    color: #ffffff;
    background: #5e269e;
    font-size: 16px;
    font-weight: 400;
    width: ${width};
    border-radius: 10px;
  `;
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress, ensName }) => {
        return (
          <StyledButton onClick={show}>
            {isConnected ? ensName ?? truncatedAddress : "Connect Wallet"}
          </StyledButton>
        );
      }}
    </ConnectKitButton.Custom>
  );
};

export default CustomConnectKitButton;
