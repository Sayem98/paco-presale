import Card from "./components/Card";
import { WagmiConfig, createConfig } from "wagmi";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { bsc } from "wagmi/chains";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ALCHEMY_ID = "CEf2CqkOIHpvGjTBCGKDnceDQz0L-BIw";
const WALLETCONNECT_PROJECT_ID = "409ca735da2a96e0fc9c913a4093d95b";
const chains = [bsc];

const config = createConfig(
  getDefaultConfig({
    // autoConnect: true,
    // Required API Keys
    //alchemyId: process.env.ALCHEMY_ID, // or infuraId
    //walletConnectProjectId: process.env.WALLETCONNECT_PROJECT_ID,
    alchemyId: ALCHEMY_ID, // or infuraId
    walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
    chains,
    // Required
    appName: "presale",

    // Optional
    // appDescription: "Your App Description",
    // appUrl: "https://family.co", // your app's url
    // appLogo: "https://family.co/logo.png", // your app's logo,no bigger than 1024x1024px (max. 1MB)
  })
);

function App() {
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider>
        <div className="w-full h-screen flex justify-center items-center overflow-hidden">
          <Card />
        </div>
      </ConnectKitProvider>
      <ToastContainer />
    </WagmiConfig>
  );
}

export default App;
